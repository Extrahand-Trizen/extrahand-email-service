import { EmailTemplate } from '../types';

// Account & Auth Templates
import { accountCreatedTemplate } from './accountCreated';
import { adminInviteTemplate } from './adminInvite';
import { passwordResetTemplate } from './passwordReset';
import { welcomeTemplate } from './welcome';
import { emailVerificationTemplate } from './emailVerification';
import { loginAlertTemplate } from './loginAlert';
import { accountSuspendedTemplate } from './accountSuspended';
import { suspensionTemplate } from './suspension';
import { banTemplate } from './ban';
import { adminAlertTemplate } from './adminAlert';

// Task Templates
import { taskCreatedRecommendedTemplate } from './taskCreatedRecommended';
import { taskCreatedKeywordTemplate } from './taskCreatedKeyword';
import { taskPostedConfirmationTemplate } from './taskPostedConfirmation';
import { taskAssignedRequesterTemplate } from './taskAssignedRequester';
import { taskCancelledTemplate } from './taskCancelled';
import { taskStartedTemplate } from './taskStarted';
import { taskStartOtpTemplate } from './taskStartOtp';
import { completionProofSubmittedTemplate } from './completionProofSubmitted';
import { applicationSubmittedTemplate } from './applicationSubmitted';
import { applicationAcceptedTemplate } from './applicationAccepted';
import { applicationRejectedTemplate } from './applicationRejected';
import { applicationWithdrawnTemplate } from './applicationWithdrawn';
import { taskUpdatedTemplate } from './taskUpdated';
import { taskReminderTemplate } from './taskReminder';
import { taskCompletedTemplate } from './taskCompleted';
import { reviewRequestTemplate } from './reviewRequest';

// Verification Templates
import { verificationRequestTemplate } from './verificationRequest';
import { verificationApprovedTemplate } from './verificationApproved';
import { verificationRejectedTemplate } from './verificationRejected';
import { documentReminderTemplate } from './documentReminder';
import { verificationStatusTemplate } from './verificationStatus';
import { verificationConfirmedTemplate } from './verificationConfirmed';

// Payment Templates
import { paymentReceivedTemplate } from './paymentReceived';
import { paymentFailedTemplate } from './paymentFailed';
import { escrowReleasedTemplate } from './escrowReleased';
import { refundInitiatedTemplate } from './refundInitiated';
import { refundProcessedTemplate } from './refundProcessed';
import { payoutInitiatedTemplate } from './payoutInitiated';
import { invoiceTemplate } from './invoice';
import { paymentReminderTemplate } from './paymentReminder';

export const templates: Record<string, EmailTemplate> = {
  // Account & Auth
  account_created: accountCreatedTemplate,
  admin_invite: adminInviteTemplate,
  password_reset: passwordResetTemplate,
  welcome: welcomeTemplate,
  email_verification: emailVerificationTemplate,
  login_alert: loginAlertTemplate,
  account_suspended: accountSuspendedTemplate,
  suspension: suspensionTemplate,
  ban: banTemplate,
  admin_alert: adminAlertTemplate,

  // Task
  task_created_recommended: taskCreatedRecommendedTemplate,
  task_created_keyword: taskCreatedKeywordTemplate,
  task_posted_confirmation: taskPostedConfirmationTemplate,
  task_assigned_requester: taskAssignedRequesterTemplate,
  task_cancelled: taskCancelledTemplate,
  task_started: taskStartedTemplate,
    task_start_otp: taskStartOtpTemplate,
  completion_proof_submitted: completionProofSubmittedTemplate,
  application_submitted: applicationSubmittedTemplate,
  application_accepted: applicationAcceptedTemplate,
  application_rejected: applicationRejectedTemplate,
  application_withdrawn: applicationWithdrawnTemplate,
  task_updated: taskUpdatedTemplate,
  task_reminder: taskReminderTemplate,
  task_completed: taskCompletedTemplate,
  review_request: reviewRequestTemplate,

  // Verification
  verification_request: verificationRequestTemplate,
  verification_approved: verificationApprovedTemplate,
  verification_rejected: verificationRejectedTemplate,
  document_reminder: documentReminderTemplate,
  verification_status: verificationStatusTemplate,
  verification_confirmed: verificationConfirmedTemplate,

  // Payment
  payment_received: paymentReceivedTemplate,
  payment_failed: paymentFailedTemplate,
  escrow_released: escrowReleasedTemplate,
  refund_initiated: refundInitiatedTemplate,
  refund_processed: refundProcessedTemplate,
  payout_initiated: payoutInitiatedTemplate,
  invoice: invoiceTemplate,
  payment_reminder: paymentReminderTemplate,
};

export function getTemplate(name: string): EmailTemplate | undefined {
  return templates[name];
}
