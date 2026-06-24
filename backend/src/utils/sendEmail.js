const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends an email via Resend. Deliberately NOT awaited by callers in most cases —
 * email sending shouldn't block the HTTP response. Errors are caught and logged
 * here so a failed email never crashes the request that triggered it.
 */
const sendEmail = async ({ to, subject, html }) => {
  try {
    await resend.emails.send({
      from: 'EventSphere <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
  } catch (error) {
    // Log but never throw — a failed email must not break registration/cancellation.
    console.error(`Failed to send email to ${to}: ${error.message}`);
  }
};

module.exports = sendEmail;