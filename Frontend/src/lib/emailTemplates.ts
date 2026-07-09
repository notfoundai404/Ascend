const ACADEMY_NAME = 'Ascend Cricket Academy';
const PRIMARY_COLOR = '#1B3A8C';

/**
 * Generates the HTML activation email sent to new students and coaches.
 */
export function activationEmailTemplate(params: {
  recipientName: string;
  email: string;
  tempPassword: string;
  role: 'Student' | 'Coach';
  studentId?: string;
  loginUrl: string;
}): { subject: string; html: string; text: string } {
  const { recipientName, email, tempPassword, role, studentId, loginUrl } = params;

  const subject = `Your ${ACADEMY_NAME} Account Has Been Activated`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
  <style>
    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F8FAFC; }
    .container { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, ${PRIMARY_COLOR} 0%, #2563EB 100%); padding: 40px 32px; text-align: center; }
    .header h1 { color: #fff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; }
    .header p { color: rgba(255,255,255,0.75); margin: 8px 0 0; font-size: 13px; }
    .body { padding: 32px; }
    .greeting { font-size: 16px; color: #1E293B; margin-bottom: 16px; }
    .greeting strong { color: ${PRIMARY_COLOR}; }
    .info-box { background: #F0F4FF; border: 1px solid #C7D7FF; border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #DDE6FF; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #64748B; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .info-value { color: #1E293B; font-size: 13px; font-weight: 700; }
    .password-badge { background: #1B3A8C; color: #fff; font-family: 'Courier New', monospace; font-size: 18px; font-weight: 700; padding: 12px 20px; border-radius: 8px; letter-spacing: 2px; display: inline-block; margin: 4px 0; }
    .login-btn { display: block; background: ${PRIMARY_COLOR}; color: #fff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 700; font-size: 14px; text-align: center; margin: 24px 0; letter-spacing: 0.5px; }
    .warning { background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 8px; padding: 12px 16px; font-size: 12px; color: #92400E; margin: 16px 0; }
    .footer { background: #F8FAFC; padding: 20px 32px; text-align: center; border-top: 1px solid #E2E8F0; }
    .footer p { color: #94A3B8; font-size: 11px; margin: 4px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏏 ${ACADEMY_NAME}</h1>
      <p>${role} Account Activated</p>
    </div>
    <div class="body">
      <p class="greeting">Hello, <strong>${recipientName}</strong>!</p>
      <p style="color:#475569;font-size:14px;line-height:1.6;">
        Your ${role.toLowerCase()} account at <strong>${ACADEMY_NAME}</strong> has been created by the Admin.
        Use the credentials below to log in to your portal.
      </p>

      <div class="info-box">
        ${studentId ? `
        <div class="info-row">
          <span class="info-label">Student ID</span>
          <span class="info-value" style="color:${PRIMARY_COLOR};">${studentId}</span>
        </div>` : ''}
        <div class="info-row">
          <span class="info-label">Role</span>
          <span class="info-value">${role}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Login Email</span>
          <span class="info-value">${email}</span>
        </div>
        <div class="info-row" style="border-bottom:none;">
          <span class="info-label">Temporary Password</span>
          <span class="password-badge">${tempPassword}</span>
        </div>
      </div>

      <div class="warning">
        ⚠️ <strong>You must change your password on first login.</strong>
        This temporary password expires after first use.
      </div>

      <a href="${loginUrl}" class="login-btn">Login to Your Portal →</a>

      <p style="color:#64748B;font-size:12px;">
        If the button doesn't work, copy this URL:<br/>
        <a href="${loginUrl}" style="color:${PRIMARY_COLOR};">${loginUrl}</a>
      </p>
    </div>
    <div class="footer">
      <p><strong>${ACADEMY_NAME}</strong></p>
      <p>This is an automated message. Please do not reply to this email.</p>
      <p>If you did not expect this email, please contact the academy admin.</p>
    </div>
  </div>
</body>
</html>`;

  const text = `
${ACADEMY_NAME} — Account Activated

Hello ${recipientName},

Your ${role} account has been created. Login credentials:

${studentId ? `Student ID: ${studentId}\n` : ''}Email: ${email}
Temporary Password: ${tempPassword}

Login URL: ${loginUrl}

IMPORTANT: You must change your password on first login.

— ${ACADEMY_NAME}
  `.trim();

  return { subject, html, text };
}
