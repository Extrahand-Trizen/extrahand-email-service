import { EmailTemplate } from '../types';

export interface AdminAlertTemplateData {
  title?: string;
  message?: string;
  linkUrl?: string;
}

export const adminAlertTemplate: EmailTemplate = {
  name: 'admin_alert',
  subject: (data: AdminAlertTemplateData) =>
    `[Admin Alert] ${data.title || 'Notification'}`,
  html: (data: AdminAlertTemplateData) => {
    const title = data.title || 'Admin Alert';
    const message = data.message || 'You have a new admin notification.';
    const linkUrl = data.linkUrl;

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${title}</title>
        </head>
        <body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,Helvetica,sans-serif;color:#111827;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f9fafb;padding:24px 16px;">
            <tr>
              <td align="center">
                <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                  <tr>
                    <td style="padding:24px 24px 0 24px;">
                      <h1 style="margin:0;font-size:20px;color:#111827;">${title}</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:12px 24px 0 24px;">
                      <p style="margin:0;font-size:14px;line-height:1.6;color:#374151;">${message}</p>
                    </td>
                  </tr>
                  ${
                    linkUrl
                      ? `<tr>
                          <td style="padding:20px 24px 24px 24px;">
                            <a href="${linkUrl}" style="display:inline-block;background:#f59e0b;color:#111827;text-decoration:none;padding:10px 16px;border-radius:8px;font-size:13px;font-weight:600;">Open in dashboard</a>
                          </td>
                        </tr>`
                      : '<tr><td style="padding:20px 24px 24px 24px;"></td></tr>'
                  }
                </table>
                <p style="margin:16px 0 0 0;font-size:12px;color:#9ca3af;">This is an automated admin alert.</p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;
  },
  text: (data: AdminAlertTemplateData) => {
    const title = data.title || 'Admin Alert';
    const message = data.message || 'You have a new admin notification.';
    const link = data.linkUrl ? `\nOpen in dashboard: ${data.linkUrl}` : '';
    return `${title}\n${message}${link}\n\nThis is an automated admin alert.`;
  },
};
