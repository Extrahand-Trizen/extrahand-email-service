import { EmailTemplate } from "../types";

export interface AdminInviteTemplateData {
  role: string;
  team?: string;
  department?: string;
  inviteLink: string;
  expiresAt: Date;
  name?: string;
  platformName?: string; // Optional platform name, defaults to "Partner Onboarding Platform"
}

import { EXTRAHAND_LOGO_SVG } from "./logo";

/** Ticket / portal roles → user-facing labels (agent, admin, supervisor, user). */
function formatInviteRoleDisplay(role: string): string {
  const r = (role || "").toLowerCase().trim();
  const labels: Record<string, string> = {
    admin: "Administrator",
    supervisor: "Supervisor",
    agent: "Support Agent",
    user: "User",
  };
  if (labels[r]) return labels[r];
  if (!role) return "Member";
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
}

export const adminInviteTemplate: EmailTemplate = {
  name: "admin_invite",
  subject: "You've been invited to join ExtraHand Admin Team",

  html: (data: AdminInviteTemplateData) => {
    const roleDisplay = formatInviteRoleDisplay(data.role);
    const platformName = data.platformName || "Partner Onboarding Platform";
    const expiryDate = new Date(data.expiresAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>You're Invited to Join ExtraHand Admin Team</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
  </style>
  <![endif]-->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style type="text/css">
    /* Reset and Base Styles */
    body {
      margin: 0;
      padding: 0;
      background: #f8fafc;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    table {
      border-collapse: collapse;
      border-spacing: 0;
    }
    
    img {
      border: 0;
      display: block;
      outline: none;
      text-decoration: none;
    }
    
    /* Prevent auto-linking on iOS */
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
    }

    /* Mobile Responsive Styles */
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        padding: 16px !important;
      }
      
      .content-wrapper {
        width: 100% !important;
        border-radius: 12px !important;
      }
      
      .header-bar {
        font-size: 10px !important;
        padding: 10px 16px !important;
      }
      
      .header-section {
        padding: 28px 20px 20px !important;
      }
      
      .logo {
        width: 44px !important;
        height: 44px !important;
        margin-bottom: 18px !important;
      }
      
      .main-title {
        font-size: 24px !important;
        line-height: 30px !important;
        margin-bottom: 6px !important;
      }
      
      .subtitle {
        font-size: 14px !important;
        line-height: 20px !important;
      }
      
      .content-section {
        padding: 24px 20px !important;
      }
      
      .text-block {
        font-size: 15px !important;
        line-height: 24px !important;
        margin-bottom: 14px !important;
      }
      
      .role-card {
        padding: 18px 14px !important;
        margin: 20px 0 !important;
      }
      
      .role-label {
        font-size: 10px !important;
        margin-bottom: 6px !important;
      }
      
      .role-name {
        font-size: 18px !important;
        line-height: 24px !important;
        margin-bottom: 16px !important;
      }
      
      .meta-row {
        padding: 10px 0 !important;
      }
      
      .meta-label {
        font-size: 11px !important;
      }
      
      .meta-value {
        font-size: 14px !important;
      }
      
      .cta-button {
        padding: 14px 28px !important;
        font-size: 15px !important;
        width: 100% !important;
        max-width: 100% !important;
        margin: 24px 0 20px !important;
      }
      
      .link-text {
        font-size: 12px !important;
        margin-bottom: 10px !important;
      }
      
      .link-box {
        padding: 12px !important;
        font-size: 11px !important;
        line-height: 18px !important;
      }
      
      .alert-box {
        padding: 14px !important;
        margin-top: 20px !important;
        font-size: 13px !important;
        line-height: 20px !important;
      }
      
      .footer-section {
        padding: 20px !important;
      }
      
      .footer-text {
        font-size: 12px !important;
        line-height: 18px !important;
      }
    }
  </style>
</head>
<body>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="container" style="background:#f8fafc;padding:40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Content Wrapper -->
        <table role="presentation" width="520" cellspacing="0" cellpadding="0" class="content-wrapper" style="max-width:520px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header Bar -->
          <tr>
            <td class="header-bar" style="background:#0f172a;color:#e2e8f0;padding:11px 20px;font-size:11px;letter-spacing:0.8px;text-align:center;text-transform:uppercase;font-weight:500;">
              ${platformName}
            </td>
          </tr>
          
          <!-- Header Section -->
          <tr>
            <td class="header-section" style="padding:32px 32px 24px;text-align:center;background:#fafafa;">
              <!-- Logo -->
              <div style="margin:0 auto 20px;text-align:center;">
                ${EXTRAHAND_LOGO_SVG}
              </div>
              
              <h1 class="main-title" style="margin:0 0 8px;font-size:28px;font-weight:600;color:#0f172a;line-height:36px;letter-spacing:-0.4px;">
                You're Invited
              </h1>
              <p class="subtitle" style="margin:0;font-size:15px;color:#64748b;line-height:22px;font-weight:400;">
                Join the ExtraHand ${roleDisplay} Team
              </p>
            </td>
          </tr>
          
          <!-- Content Section -->
          <tr>
            <td class="content-section" style="padding:28px 32px 32px;">
              <p class="text-block" style="margin:0 0 18px;font-size:15px;line-height:24px;color:#334155;font-weight:400;">
                ${data.name ? `Hello ${data.name},` : 'Hello,'}
              </p>
              <p class="text-block" style="margin:0 0 20px;font-size:15px;line-height:24px;color:#334155;font-weight:400;">
                You've been invited to join the ExtraHand ${platformName} with the following role:
              </p>

              <!-- Role Card (Smaller) -->
              <div class="role-card" style="background:#fafafa;border:1px solid #e2e8f0;border-radius:10px;padding:20px 20px;margin:24px 0;text-align:center;">
                <div class="role-label" style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.8px;font-weight:500;margin-bottom:8px;">
                  Your Role
                </div>
                <div class="role-name" style="font-size:20px;color:#0f172a;font-weight:600;line-height:28px;letter-spacing:-0.2px;margin-bottom:${data.team || data.department ? '18px' : '0'};">
                  ${roleDisplay}
                </div>
                
                <!-- Meta Information (Conditional) -->
                ${data.team || data.department ? `
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${data.team ? `
                  <tr class="meta-row" style="border-top:1px solid #e2e8f0;">
                    <td style="padding:12px 0;text-align:left;">
                      <span class="meta-label" style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:500;">Team</span>
                    </td>
                    <td style="padding:12px 0;text-align:right;">
                      <span class="meta-value" style="font-size:15px;color:#0f172a;font-weight:500;">${data.team}</span>
                    </td>
                  </tr>
                  ` : ''}
                  ${data.department ? `
                  <tr class="meta-row" style="border-top:1px solid #e2e8f0;">
                    <td style="padding:12px 0;text-align:left;">
                      <span class="meta-label" style="font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px;font-weight:500;">Department</span>
                    </td>
                    <td style="padding:12px 0;text-align:right;">
                      <span class="meta-value" style="font-size:15px;color:#0f172a;font-weight:500;">${data.department}</span>
                    </td>
                  </tr>
                  ` : ''}
                </table>
                ` : ''}
              </div>

              <!-- CTA Button (Solid Color, No Gradient) -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding:28px 0 24px;">
                    <a href="${data.inviteLink}" class="cta-button" style="display:inline-block;background:#f59e0b;color:#ffffff;text-decoration:none;padding:15px 40px;border-radius:8px;font-size:16px;font-weight:600;letter-spacing:0.2px;">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link Section -->
              <p class="link-text" style="margin:0 0 12px;font-size:13px;color:#94a3b8;text-align:center;font-weight:400;">
                Or copy and paste this link into your browser:
              </p>
              <div class="link-box" style="background:#fafafa;border:1px solid #e2e8f0;border-radius:6px;padding:14px;font-size:12px;color:#475569;font-family:'SF Mono',Monaco,'Cascadia Code',monospace;word-break:break-all;text-align:center;line-height:20px;">
                ${data.inviteLink}
              </div>

              <!-- Alert Box (Subtle Gray-Blue Background) -->
              <div class="alert-box" style="margin-top:24px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:16px 18px;">
                <div style="font-size:14px;color:#475569;line-height:22px;font-weight:400;">
                  <span style="font-weight:600;color:#334155;">Important:</span> This invitation expires on <span style="font-weight:600;color:#334155;">${expiryDate}</span>. Please accept it before the specified date.
                </div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="footer-section" style="background:#fafafa;padding:24px 32px;text-align:center;border-top:1px solid #e2e8f0;">
              <p class="footer-text" style="margin:0 0 6px;font-size:13px;color:#94a3b8;line-height:20px;font-weight:400;">
                Automated message from ExtraHand
              </p>
              <p class="footer-text" style="margin:0;font-size:12px;color:#cbd5e1;font-weight:400;">
                © ${new Date().getFullYear()} ExtraHand. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
  },

  text: (data: AdminInviteTemplateData) => {
    const roleDisplay = formatInviteRoleDisplay(data.role);
    const platformName = data.platformName || "Partner Onboarding Platform";
    const expiryDate = new Date(data.expiresAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    return `
EXTRAHAND - You're Invited to Join the Admin Team

${data.name ? `Hello ${data.name},` : "Hello,"}

You've been invited to the ExtraHand ${platformName}.

Role: ${roleDisplay}
${data.team ? `Team: ${data.team}` : ""}
${data.department ? `Department: ${data.department}` : ""}

Accept invite: ${data.inviteLink}

Important: This invite expires on ${expiryDate}. Please accept it before then.

This is an automated message from ExtraHand.
© ${new Date().getFullYear()} ExtraHand. All rights reserved.
  `;
  },
};
