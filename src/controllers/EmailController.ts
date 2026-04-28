import { Request, Response } from 'express';
import { EmailService } from '../services/EmailService';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../config/logger';

export class EmailController {
  /**
   * Send generic email
   * POST /api/v1/email/send
   */
  static sendEmail = asyncHandler(async (req: Request, res: Response) => {
    const { to, template, subject } = req.body;

    // Validate required fields
    if (!to || !template) {
      res.status(400).json({
        success: false,
        error: 'to and template are required'
      });
      return;
    }

    try {
      // Process email synchronously to catch errors immediately
      await EmailService.sendEmail(req.body);

      res.json({
        success: true,
        message: 'Email sent successfully'
      });
    } catch (error: any) {
      logger.error('Email send failed', {
        to,
        subject,
        template,
        error: error.message
      });

      res.status(500).json({
        success: false,
        error: 'Failed to send email',
        message: error.message
      });
    }
  });

  /**
   * Send admin invite email
   * POST /api/v1/email/admin-invite
   */
  static sendAdminInviteEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email, role, inviteLink, expiresAt, team, department, platformName, name } = req.body;
    
    if (!email || !role || !inviteLink || !expiresAt) {
      res.status(400).json({
        success: false,
        error: 'email, role, inviteLink, and expiresAt are required'
      });
      return;
    }
    
    // Return immediately - process email in background
    res.json({
      success: true,
      message: 'Email queued for sending'
    });
    
    // Process email asynchronously (don't await)
    EmailService.sendAdminInviteEmail(
      email,
      role,
      inviteLink,
      new Date(expiresAt),
      team,
      department,
      platformName,
      name
    ).catch((error: any) => {
      logger.error('Background admin invite email send failed', {
        email,
        role,
        error: error.message
      });
    });
    
    return;
  });

  /**
   * Send account created email
   * POST /api/v1/email/account-created
   */
  static sendAccountCreatedEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email, name, phone } = req.body;
    
    if (!email || !name) {
      res.status(400).json({
        success: false,
        error: 'email and name are required'
      });
      return;
    }
    
    // Return immediately - process email in background
    res.json({
      success: true,
      message: 'Email queued for sending'
    });
    
    // Process email asynchronously (don't await)
    EmailService.sendAccountCreatedEmail(email, name, phone).catch((error: any) => {
      logger.error('Background account created email send failed', {
        email,
        name,
        error: error.message
      });
    });
    
    return;
  });

  /**
   * Send password reset email
   * POST /api/v1/email/password-reset
   */
  static sendPasswordResetEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email, resetLink, name, expiresAt, platformName } = req.body;
    
    if (!email || !resetLink) {
      res.status(400).json({
        success: false,
        error: 'email and resetLink are required'
      });
      return;
    }
    
    // Log the received platformName for debugging
    logger.info('Password reset email request received', {
      email,
      platformName: platformName || 'not provided (will use default)',
      platformNameType: typeof platformName,
      platformNameValue: platformName,
      hasPlatformName: !!platformName,
      reqBodyKeys: Object.keys(req.body),
      reqBodyPlatformName: req.body.platformName,
      fullRequestBody: JSON.stringify(req.body),
    });
    
    // Return immediately - process email in background
    res.json({
      success: true,
      message: 'Email queued for sending'
    });
    
    // Process email asynchronously (don't await)
    // Pass platformName directly - let EmailService handle the default
    EmailService.sendPasswordResetEmail(
      email,
      resetLink,
      name,
      expiresAt ? new Date(expiresAt) : undefined,
      platformName // Pass as-is, EmailService will handle defaults
    ).catch((error: any) => {
      logger.error('Background password reset email send failed', {
        email,
        platformName,
        error: error.message
      });
    });
    
    return;
  });

  /**
   * Send suspension notification email
   * POST /api/v1/email/suspension
   */
  static sendSuspensionEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email, name, suspendedUntil, reason, daysRemaining, contactInfo, platformName } = req.body;
    
    if (!email || !name || !suspendedUntil || !reason) {
      res.status(400).json({
        success: false,
        error: 'email, name, suspendedUntil, and reason are required'
      });
      return;
    }
    
    // Return immediately - process email in background
    res.json({
      success: true,
      message: 'Email queued for sending'
    });
    
    // Process email asynchronously (don't await)
    EmailService.sendSuspensionEmail(
      email,
      name,
      new Date(suspendedUntil),
      reason,
      daysRemaining,
      contactInfo,
      platformName
    ).catch((error: any) => {
      logger.error('Background suspension email send failed', {
        email,
        name,
        error: error.message
      });
    });
    
    return;
  });

  /**
   * Send ban notification email
   * POST /api/v1/email/ban
   */
  static sendBanEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email, name, reason, contactInfo, platformName } = req.body;
    
    if (!email || !name || !reason) {
      res.status(400).json({
        success: false,
        error: 'email, name, and reason are required'
      });
      return;
    }
    
    // Return immediately - process email in background
    res.json({
      success: true,
      message: 'Email queued for sending'
    });
    
    // Process email asynchronously (don't await)
    EmailService.sendBanEmail(
      email,
      name,
      reason,
      contactInfo,
      platformName
    ).catch((error: any) => {
      logger.error('Background ban email send failed', {
        email,
        name,
        error: error.message
      });
    });
    
    return;
  });

  /**
   * Health check with provider verification
   * GET /api/v1/email/health
   */
  static healthCheck = asyncHandler(async (_req: Request, res: Response) => {
    const { validateEnv } = await import('../config/env');
    const env = validateEnv();
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        service: 'extrahand-email-service',
        provider: env.EMAIL_PROVIDER,
        from: env.EMAIL_FROM_ADDRESS,
        timestamp: new Date().toISOString(),
      }
    });
  });
}
