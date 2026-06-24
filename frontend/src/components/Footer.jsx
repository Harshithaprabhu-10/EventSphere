import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand">EventSphere</div>
          <p className="footer-desc">
            A modern event management and registration platform — discover events,
            register in seconds, and check in with a QR code.
          </p>
        </div>

        <div>
          <div className="footer-heading">Platform</div>
          <div className="footer-links">
            <Link to="/">Browse events</Link>
            <Link to="/my-registrations">My registrations</Link>
            <Link to="/create-event">Create an event</Link>
          </div>
        </div>

        <div>
          <div className="footer-heading">Account</div>
          <div className="footer-links">
            <Link to="/login">Log in</Link>
            <Link to="/signup">Sign up</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} EventSphere. Built as a full-stack portfolio project.</span>
        <span>Made with React, Node.js, Express & MongoDB</span>
      </div>
    </footer>
  );
}

export default Footer;