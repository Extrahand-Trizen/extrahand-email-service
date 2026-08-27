import { EmailTemplate } from '../types';
import { EXTRAHAND_LOGO_SVG } from './logo';

export const taskStartOtpTemplate: EmailTemplate = {
  name: 'task_start_otp',
  subject: (data: any) => `🔐 Task Start OTP for "${data.taskTitle || 'your task'}" - ${data.platformName || 'ExtraHand'}`,

  html: (data: any) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Start OTP</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#DC2626;color:#fff;padding:12px 24px;font-size:13px;letter-spacing:0.3px;text-align:center;">
              🔒 Security Verification Required
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 20px;text-align:center;border-bottom:1px solid #e5e7eb;">
              <div style="margin-bottom:16px;">${EXTRAHAND_LOGO_SVG}</div>
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#111827;">Task Start OTP 🔐</h1>
              <p style="margin:8px 0 0;font-size:14px;color:#6b7280;">Verify that ${data.taskerName || 'the tasker'} can start your task</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 18px;color:#374151;font-size:16px;line-height:1.6;">
                Hi <strong>${data.requesterName || 'there'}</strong>,
              </p>
              <p style="margin:0 0 18px;color:#374151;font-size:16px;line-height:1.6;">
                <strong>${data.taskerName || 'Your tasker'}</strong> is ready to start working on "<strong>${data.taskTitle || 'your task'}</strong>". For security verification, please share this OTP with them.
              </p>
              
              <!-- OTP Display Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FEF2F2;border:2px solid #DC2626;border-radius:12px;margin:0 0 24px;">
                <tr>
                  <td style="padding:32px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:14px;color:#6b7280;font-weight:600;letter-spacing:0.5px;text-transform:uppercase;">Your OTP Code</p>
                    <div style="background:#fff;padding:20px;border-radius:8px;margin:0 auto;max-width:280px;box-shadow:0 2px 8px rgba(220,38,38,0.15);">
                      <p style="margin:0;font-size:40px;font-weight:800;color:#DC2626;letter-spacing:8px;font-family:'Courier New',monospace;">${data.otp || '******'}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Task Details -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#F3F4F6;border:1px solid #E5E7EB;border-radius:8px;margin:0 0 20px;">
                <tr>
                  <td style="padding:20px;">
                    <h3 style="margin:0 0 12px;font-size:16px;color:#111827;font-weight:700;">📋 Task Details</h3>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#6b7280;">Task:</td>
                        <td style="padding:6px 0;font-size:14px;color:#111827;text-align:right;font-weight:600;">${data.taskTitle || 'Task'}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#6b7280;">Tasker:</td>
                        <td style="padding:6px 0;font-size:14px;color:#111827;text-align:right;font-weight:600;">${data.taskerName || 'Tasker'}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#FFFBEB;border-left:4px solid #F59E0B;border-radius:6px;margin:0 0 20px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;font-size:14px;color:#92400E;line-height:1.6;">
                      <strong style="display:block;margin-bottom:4px;">🔒 Security Notice:</strong>
                      Only share this OTP with the tasker who is physically present and ready to start work. This ensures you're authorizing the correct person to begin your task.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Action Buttons -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding:10px 0;">
                    <a href="${data.taskUrl || 'https://extrahand.in/my-tasks'}" style="display:inline-block;background:#2563EB;color:#fff !important;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:700;margin:0 4px;">View Task</a>
                  </td>
                </tr>
              </table>

              <!-- Help Text -->
              <p style="margin:24px 0 0;color:#6b7280;font-size:13px;line-height:1.6;text-align:center;">
                If you didn't request this OTP or have concerns, please contact support immediately.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">This is an automated security email.</p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} ${data.platformName || 'ExtraHand'}. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `,

  text: (data: any) => `
Task Start OTP - ${data.platformName || 'ExtraHand'}

Hi ${data.requesterName || 'there'},

${data.taskerName || 'Your tasker'} is ready to start working on "${data.taskTitle || 'your task'}". 
For security verification, please share this OTP with them:

OTP CODE: ${data.otp || '******'}

Task Details:
- Task: ${data.taskTitle || 'Task'}
- Tasker: ${data.taskerName || 'Tasker'}

SECURITY NOTICE:
Only share this OTP with the tasker who is physically present and ready to start work.
This ensures you're authorizing the correct person to begin your task.

View task: ${data.taskUrl || 'https://extrahand.in/my-tasks'}

If you didn't request this OTP or have concerns, please contact support immediately.

---
© ${new Date().getFullYear()} ${data.platformName || 'ExtraHand'}
  `
};
