import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

/**
 * Returns a singleton Nodemailer transporter.
 * In development (default), auto-creates an Ethereal test account.
 * In production, uses SMTP_HOST / SMTP_USER / SMTP_PASS env vars.
 * Emails can be previewed at: https://ethereal.email/messages
 */
export async function getEmailTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  const isProduction =
    process.env.NODE_ENV === 'production' &&
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS;

  if (isProduction) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('📧 Email: Production SMTP configured');
  } else {
    // Ethereal staging — completely free, no signup required
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('\n📧 Email: Staging mode (Ethereal)');
    console.log(`   Account: ${testAccount.user}`);
    console.log('   View sent emails at: https://ethereal.email/messages\n');
  }

  return transporter;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<{ previewUrl: string | false; messageId: string }> {
  const t = await getEmailTransporter();

  const info = await t.sendMail({
    from: process.env.FROM_EMAIL || '"Ascend Cricket Academy" <noreply@ascendcricket.in>',
    ...options,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);

  if (previewUrl) {
    console.log(`   📬 Email preview → ${previewUrl}`);
  }

  return {
    previewUrl,
    messageId: info.messageId,
  };
}
