const { Resend } = require('resend');

const sendEmail = async ({ to, subject, html }) => {
  // Skip silently if no API key is configured (test environment or local dev without email)
  if (!process.env.RESEND_API_KEY) {
    console.log(`[sendEmail] No RESEND_API_KEY configured — skipping email to ${to}`);
    return;
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: 'EventSphere <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error(`Failed to send email to ${to}: ${error.message}`);
  }
};

module.exports = sendEmail;