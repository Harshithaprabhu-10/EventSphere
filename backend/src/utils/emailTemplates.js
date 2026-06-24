const registrationConfirmedTemplate = ({ userName, eventTitle, eventDate, location }) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
    <h2 style="color: #5b4fe8;">You're registered!</h2>
    <p>Hi ${userName},</p>
    <p>You're confirmed for <strong>${eventTitle}</strong>.</p>
    <p>
      <strong>Date:</strong> ${new Date(eventDate).toLocaleString()}<br/>
      <strong>Location:</strong> ${location}
    </p>
    <p>Find your check-in QR code anytime under "My registrations" in EventSphere.</p>
  </div>
`;

const waitlistPromotedTemplate = ({ userName, eventTitle, eventDate, location }) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
    <h2 style="color: #5b4fe8;">A seat opened up — you're in!</h2>
    <p>Hi ${userName},</p>
    <p>Good news — a spot opened up for <strong>${eventTitle}</strong>, and you've been moved from the waitlist to confirmed.</p>
    <p>
      <strong>Date:</strong> ${new Date(eventDate).toLocaleString()}<br/>
      <strong>Location:</strong> ${location}
    </p>
    <p>Find your check-in QR code anytime under "My registrations" in EventSphere.</p>
  </div>
`;

module.exports = { registrationConfirmedTemplate, waitlistPromotedTemplate };