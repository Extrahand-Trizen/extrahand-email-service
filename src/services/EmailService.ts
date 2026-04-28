import logger from '../config/logger';
import { validateEnv } from '../config/env';
import { SMTPProvider } from './providers/SMTPProvider';
import { SendGridProvider } from './providers/SendGridProvider';
import { SESProvider } from './providers/SESProvider';
import EmailLog from '../models/EmailLog';
import { TemplateService } from './TemplateService';
import { EmailOptions, EmailResult } from '../types';
import { fetchLogoAsBuffer } from '../utils/logoUtils';
import NotificationPreferencesClient, { NotificationCategory } from '../clients/NotificationPreferencesClient';

type EmailPreferenceCategory =
  | 'transactional'
  | 'taskReminders'
  | 'keywordTaskAlerts'
  | 'recommendedTaskAlerts'
  | 'taskUpdates'
  | 'payments'
  | 'promotions'
  | 'reminders'
  | 'system'
  | 'marketing';

// Templates that are ALWAYS sent regardless of preferences (auth/security)
const ALWAYS_SEND_TEMPLATES = new Set([
  'email_verification',
  'password_reset',
  'login_alert',
  'account_created',
  'welcome',
  'admin_invite',
  'account_suspended',
  'suspension',
  'ban',
  'task_start_otp', // OTP is security-critical
]);

const TEMPLATE_CATEGORY_MAP: Record<string, EmailPreferenceCategory> = {
  // Transactional (account actions)
  task_posted_confirmation: 'transactional',
  verification_confirmed: 'transactional',

  // Task Updates — ALL task lifecycle emails
  task_reminder: 'taskReminders',
  task_created_keyword: 'keywordTaskAlerts',
  task_created_recommended: 'recommendedTaskAlerts',
  task_updated: 'taskUpdates',
  task_assigned_requester: 'taskUpdates',
  task_started: 'taskUpdates',
  task_completed: 'taskUpdates',
  task_cancelled: 'taskUpdates',
  application_submitted: 'taskUpdates',
  application_accepted: 'taskUpdates',
  application_rejected: 'taskUpdates',
  application_withdrawn: 'taskUpdates',
  completion_proof_submitted: 'taskUpdates',
  review_request: 'taskUpdates',

  // Verification
  verification_request: 'transactional',
  verification_approved: 'transactional',
  verification_rejected: 'transactional',
  verification_status: 'transactional',
  document_reminder: 'transactional',
};

export class EmailService {
  private static provider: any;
  private static env = validateEnv();

  private static getProvider() {
    if (!this.provider) {
      switch (this.env.EMAIL_PROVIDER) {
        case 'sendgrid':
          this.provider = new SendGridProvider();
          break;
        case 'ses':
          this.provider = new SESProvider();
          break;
        case 'smtp':
          this.provider = new SMTPProvider();
          break;
        default:
          throw new Error(`Unknown email provider: ${this.env.EMAIL_PROVIDER}`);
      }
    }
    return this.provider;
  }

  private static resolvePreferenceCategory(options: EmailOptions): EmailPreferenceCategory | undefined {
    const metadataCategory = options.metadata?.notificationCategory || options.metadata?.category;
    const dataCategory = options.data?.notificationCategory || options.data?.category;
    const directCategory = options.notificationCategory;

    if (typeof directCategory === 'string' && directCategory.trim() !== '') {
      return directCategory as EmailPreferenceCategory;
    }
    if (typeof metadataCategory === 'string' && metadataCategory.trim() !== '') {
      return metadataCategory as EmailPreferenceCategory;
    }
    if (typeof dataCategory === 'string' && dataCategory.trim() !== '') {
      return dataCategory as EmailPreferenceCategory;
    }
    if (options.template && TEMPLATE_CATEGORY_MAP[options.template]) {
      return TEMPLATE_CATEGORY_MAP[options.template];
    }
    return undefined;
  }

  private static resolveRecipientId(options: EmailOptions): string | undefined {
    const fromMetadata = options.metadata?.userId || options.metadata?.uid || options.metadata?.recipientId;
    if (typeof fromMetadata === 'string' && fromMetadata.trim() !== '') {
      return fromMetadata;
    }
    const fromData = options.data?.userId || options.data?.uid || options.data?.recipientId;
    if (typeof fromData === 'string' && fromData.trim() !== '') {
      return fromData;
    }
    if (typeof options.userId === 'string' && options.userId.trim() !== '') {
      return options.userId;
    }
    return undefined;
  }

  private static async isEmailAllowed(options: EmailOptions): Promise<boolean> {
    const template = options.template;

    // Always send auth/security emails — never gated by preferences
    if (template && ALWAYS_SEND_TEMPLATES.has(template)) {
      return true;
    }

    const category = this.resolvePreferenceCategory(options);
    const recipientId = this.resolveRecipientId(options);

    // If category is unknown, allow through — the calling service already pre-checked
    // We only block here when we know the category AND know the user said no
    if (!category) {
      logger.info('Email allowed: cannot resolve category (pre-check assumed done)', {
        template,
        to: options.to,
      });
      return true;
    }

    // If recipientId not found, allow through — the calling service (task-service) already
    // ran its own preference check before sending here
    if (!recipientId) {
      logger.info('Email allowed: no userId to check (pre-check assumed done)', {
        template,
        category,
        to: options.to,
      });
      return true;
    }

    return NotificationPreferencesClient.canSendEmail(
      recipientId,
      category as NotificationCategory
    );
  }

  static async sendEmail(options: EmailOptions): Promise<EmailResult> {
    try {
      let html = options.html;
      let text = options.text;
      let subject = options.subject;

      const isAllowed = await this.isEmailAllowed(options);
      if (!isAllowed) {
        logger.info('Email suppressed by user preferences', {
          to: options.to,
          template: options.template,
          category: this.resolvePreferenceCategory(options),
          userId: this.resolveRecipientId(options),
        });

        this.logEmail({
          to: Array.isArray(options.to) ? options.to : [options.to],
          subject: subject || options.subject || 'Suppressed by preferences',
          template: options.template,
          status: 'failed',
          error: 'blocked_by_preferences',
          provider: this.env.EMAIL_PROVIDER,
          metadata: {
            ...options.metadata,
            suppressed: true,
          },
        });

        return {
          success: false,
          error: 'blocked_by_preferences',
        };
      }

      // Render template if provided
      if (options.template) {
        // Clear require cache to ensure we get the latest template
        const templatesPath = require.resolve('../templates');
        const passwordResetPath = require.resolve('../templates/passwordReset');
        delete require.cache[templatesPath];
        delete require.cache[passwordResetPath];

        const template = require('../templates').getTemplate(options.template);
        const data = options.data || {};

        logger.info('Rendering email template', {
          template: options.template,
          platformName: data.platformName,
          subjectType: typeof template?.subject,
          hasSubjectFunction: typeof template?.subject === 'function',
          providedSubject: options.subject,
          willGenerateSubject: !options.subject || options.subject.trim() === '',
        });

        // Handle dynamic subject from template
        // Always use template's subject function if available to ensure platformName is used correctly
        // If subject is empty or not provided, always use template's subject function
        if (template && typeof template.subject === 'function') {
          const generatedSubject = template.subject(data);

          logger.info('Template subject function called in sendEmail', {
            template: options.template,
            platformName: data.platformName,
            generatedSubject,
            originalSubject: subject,
            dataKeys: Object.keys(data),
            willUseGenerated: !subject || subject.trim() === '',
          });

          // Always use the template's generated subject (especially if subject is empty)
          // This ensures platformName is always used correctly
          subject = generatedSubject;
        } else if (template && typeof template.subject === 'string') {
          // Use static subject if template has one and no subject was provided
          if (!subject || subject.trim() === '') {
            subject = template.subject;
          }
        } else {
          logger.warn('Template subject is not a function or string', {
            template: options.template,
            subjectType: typeof template?.subject,
            subjectValue: template?.subject,
          });
        }

        const rendered = TemplateService.render(options.template, data);
        html = rendered.html;
        text = rendered.text;

        const needsCidLogo = typeof html === 'string' && html.includes('cid:extrahand-logo');
        const hasCidLogo = Array.isArray(options.attachments)
          && options.attachments.some((attachment: any) => attachment?.cid === 'extrahand-logo');

        if (needsCidLogo && !hasCidLogo) {
          try {
            logger.info('Fetching logo for CID attachment', { to: options.to, template: options.template });
            const logoBuffer = await fetchLogoAsBuffer();

            if (logoBuffer) {
              const logoAttachment = {
                filename: 'logo.png',
                content: logoBuffer,
                contentType: 'image/png',
                cid: 'extrahand-logo',
              };

              options.attachments = Array.isArray(options.attachments)
                ? [...options.attachments, logoAttachment]
                : [logoAttachment];

              logger.info('Logo attached with CID successfully', {
                to: options.to,
                template: options.template,
                logoSize: logoBuffer.length,
              });
            } else {
              logger.warn('Logo fetch failed, email will be sent without logo', {
                to: options.to,
                template: options.template,
              });
            }
          } catch (error: any) {
            logger.warn('Failed to attach logo', {
              to: options.to,
              template: options.template,
              error: error.message,
            });
          }
        }

        // Add logo attachment for email_verification template if not already provided
        if (options.template === 'email_verification' && !options.attachments) {
          try {
            logger.info('Fetching logo for email verification template', { to: options.to });
            const logoBuffer = await fetchLogoAsBuffer('https://i.ibb.co/Zt9jNcs/logo.png');

            if (logoBuffer) {
              options.attachments = [{
                filename: 'logo.png',
                content: logoBuffer,
                contentType: 'image/png',
                cid: 'extrahand-logo',
              }];
              logger.info('Logo attached to email verification', {
                to: options.to,
                logoSize: logoBuffer.length,
              });
            }
          } catch (error: any) {
            logger.warn('Failed to attach logo to email verification', {
              to: options.to,
              error: error.message,
            });
          }
        }
      }

      // Validate
      if (!html && !text) {
        throw new Error('Either html, text, or template must be provided');
      }

      // Get provider
      const provider = this.getProvider();

      // Send email
      const result = await provider.send({
        to: options.to,
        from: {
          email: this.env.EMAIL_FROM_ADDRESS,
          name: this.env.EMAIL_FROM_NAME,
        },
        replyTo: this.env.EMAIL_REPLY_TO,
        subject: subject,
        html: html || '',
        text: text || TemplateService.stripHtml(html || ''),
        cc: options.cc,
        bcc: options.bcc,
        attachments: options.attachments,
      });

      // Log email (non-blocking)
      this.logEmail({
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: subject,
        template: options.template,
        status: 'sent',
        messageId: result.messageId,
        provider: this.env.EMAIL_PROVIDER,
        metadata: options.metadata,
      });

      logger.info('Email sent successfully', {
        to: options.to,
        subject: subject,
        template: options.template,
        messageId: result.messageId,
      });

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error: any) {
      logger.error('Email send failed', {
        to: options.to,
        subject: options.subject,
        template: options.template,
        error: error.message,
      });

      // Log failed email (non-blocking)
      let finalSubject = options.subject;
      try {
        if (options.template) {
          const template = require('../templates').getTemplate(options.template);
          const data = options.data || {};
          if (template && typeof template.subject === 'function') {
            finalSubject = template.subject(data);
          }
        }
      } catch {
        // Use original subject if template resolution fails
        finalSubject = options.subject;
      }
      this.logEmail({
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: finalSubject,
        template: options.template,
        status: 'failed',
        error: error.message,
        provider: this.env.EMAIL_PROVIDER,
        metadata: options.metadata,
      });

      return {
        success: false,
        error: error.message,
      };
    }
  }

  private static logEmail(data: any) {
    // Don't await - log asynchronously to avoid blocking email sending
    EmailLog.create({
      ...data,
      sentAt: new Date(),
    }).catch((error: any) => {
      logger.error('Failed to log email', { error: error.message });
    });
  }

  // Convenience methods

  /**
   * Send admin invite email with logo as CID attachment (bulletproof for Outlook)
   */
  static async sendAdminInviteEmail(
    email: string,
    role: string,
    inviteLink: string,
    expiresAt: Date,
    team?: string,
    department?: string,
    platformName?: string,
    inviteeName?: string
  ) {
    // Always use CID attachment - fetch logo from URL and attach inline
    // This is the only bulletproof method for Outlook
    let logoAttachment: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
      cid: string;
    }> | undefined = undefined;

    try {
      logger.info('Fetching logo for CID attachment', { email });

      // Fetch logo from the hosted URL (imgbb.co)
      const logoBuffer = await fetchLogoAsBuffer('https://i.ibb.co/Zt9jNcs/logo.png');

      if (logoBuffer) {
        logoAttachment = [{
          filename: 'logo.png',
          content: logoBuffer,
          contentType: 'image/png',
          cid: 'extrahand-logo', // Must match src="cid:extrahand-logo" in template
        }];
        logger.info('Logo attached with CID successfully', {
          email,
          logoSize: logoBuffer.length,
          cid: 'extrahand-logo',
        });
      } else {
        logger.warn('Logo fetch failed, email will be sent without logo', { email });
      }
    } catch (error: any) {
      logger.error('Failed to fetch logo for CID attachment', {
        error: error.message,
        stack: error.stack,
        email,
      });
      // Continue without logo - template will show broken image or nothing
    }

    const defaultPlatformName =
      this.env.DEFAULT_ADMIN_INVITE_PLATFORM_NAME || 'Partner Onboarding Platform';
    const finalPlatformName = platformName || defaultPlatformName;
    const displayName =
      (inviteeName && String(inviteeName).trim()) ||
      email.split('@')[0];

    return this.sendEmail({
      to: email,
      subject: `You've been invited to join ExtraHand ${finalPlatformName} Team`,
      template: 'admin_invite',
      data: {
        role,
        team,
        department,
        inviteLink,
        expiresAt,
        platformName: finalPlatformName,
        name: displayName,
      },
      attachments: logoAttachment, // CID attachment - bulletproof for Outlook
      metadata: { type: 'admin_invite', source: 'ticket_portal' },
    });
  }

  static async sendAccountCreatedEmail(email: string, name: string, phone?: string) {
    return this.sendEmail({
      to: email,
      subject: 'Your ExtraHand Account is Ready!',
      template: 'account_created',
      data: {
        name,
        phone,
        loginUrl: `${this.env.WEB_APP_URL}/login`,
        supportEmail: 'support@extrahand.in',
      },
      metadata: { type: 'account_created' },
    });
  }

  /**
   * Send password reset email with logo as CID attachment (bulletproof for Outlook)
   */
  static async sendPasswordResetEmail(
    email: string,
    resetLink: string,
    name?: string,
    expiresAt?: Date,
    platformName?: string
  ) {
    logger.info('EmailService.sendPasswordResetEmail called', {
      email,
      receivedPlatformName: platformName,
      platformNameType: typeof platformName,
      platformNameValue: platformName,
    });
    const formattedExpiresAt = expiresAt
      ? expiresAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
      : undefined;

    // Always use CID attachment - fetch logo from URL and attach inline
    // This is the only bulletproof method for Outlook
    let logoAttachment: Array<{
      filename: string;
      content: Buffer;
      contentType: string;
      cid: string;
    }> | undefined = undefined;

    try {
      logger.info('Fetching logo for CID attachment', { email });

      // Fetch logo from the hosted URL (imgbb.co)
      const logoBuffer = await fetchLogoAsBuffer('https://i.ibb.co/Zt9jNcs/logo.png');

      if (logoBuffer) {
        logoAttachment = [{
          filename: 'logo.png',
          content: logoBuffer,
          contentType: 'image/png',
          cid: 'extrahand-logo', // Must match src="cid:extrahand-logo" in template
        }];
        logger.info('Logo attached with CID successfully', {
          email,
          logoSize: logoBuffer.length,
          cid: 'extrahand-logo',
        });
      } else {
        logger.warn('Logo fetch failed, email will be sent without logo', { email });
      }
    } catch (error: any) {
      logger.error('Failed to fetch logo for CID attachment', {
        error: error.message,
        stack: error.stack,
        email,
      });
      // Continue without logo - template will show broken image or nothing
    }

    // Use provided platformName, or default to "Partner Onboarding Platform" for backward compatibility
    // Note: Content Admin Portal should pass "Content Admin Portal" explicitly
    const finalPlatformName = (platformName && typeof platformName === 'string' && platformName.trim() !== '')
      ? platformName.trim()
      : "Partner Onboarding Platform";

    logger.info('Determining platformName for password reset', {
      email,
      receivedPlatformName: platformName,
      platformNameType: typeof platformName,
      platformNameValue: platformName,
      finalPlatformName,
      willUseDefault: !platformName || (typeof platformName === 'string' && platformName.trim() === '') || typeof platformName !== 'string',
    });

    const templateData = {
      name: name || email.split('@')[0],
      resetLink,
      expiresAt: formattedExpiresAt,
      platformName: finalPlatformName,
    };

    logger.info('Sending password reset email', {
      email,
      platformName: finalPlatformName,
      receivedPlatformName: platformName,
      templateDataPlatformName: templateData.platformName,
    });

    // Don't pass subject - let sendEmail generate it from template to ensure platformName is used
    return this.sendEmail({
      to: email,
      subject: '', // Empty - will be generated from template
      template: 'password_reset',
      data: templateData,
      attachments: logoAttachment, // CID attachment - bulletproof for Outlook
      metadata: { type: 'password_reset' },
    });
  }

  /**
   * Send suspension notification email
   */
  static async sendSuspensionEmail(
    email: string,
    name: string,
    suspendedUntil: Date,
    reason: string,
    daysRemaining?: number,
    contactInfo?: string,
    platformName?: string
  ) {
    const defaultPlatformName = "Partner Onboarding Platform";
    const finalPlatformName = platformName || defaultPlatformName;

    return this.sendEmail({
      to: email,
      subject: `Account Suspended - ${finalPlatformName}`, // Fallback, template will override if dynamic
      template: 'suspension',
      data: {
        name,
        suspendedUntil: suspendedUntil.toISOString(),
        reason,
        daysRemaining: daysRemaining || Math.ceil((suspendedUntil.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        contactInfo: contactInfo || 'Please contact your manager or administrator for assistance.',
        platformName: finalPlatformName,
      },
      metadata: { type: 'suspension' },
    });
  }

  /**
   * Send ban notification email
   */
  static async sendBanEmail(
    email: string,
    name: string,
    reason: string,
    contactInfo?: string,
    platformName?: string
  ) {
    const defaultPlatformName = "Partner Onboarding Platform";
    const finalPlatformName = platformName || defaultPlatformName;

    return this.sendEmail({
      to: email,
      subject: `Account Banned - ${finalPlatformName}`, // Fallback, template will override if dynamic
      template: 'ban',
      data: {
        name,
        reason,
        contactInfo: contactInfo || 'Please contact your manager or administrator for assistance.',
        platformName: finalPlatformName,
      },
      metadata: { type: 'ban' },
    });
  }
}
