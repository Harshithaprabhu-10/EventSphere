import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logoutUser();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const initials = user?.name
    ? user.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
    : '';

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        EventSphere
      </Link>

      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
              Events
            </Link>
            <Link
              to="/my-registrations"
              className={`nav-link ${isActive('/my-registrations') ? 'active' : ''}`}
            >
              My registrations
            </Link>

            {(user.role === 'organizer' || user.role === 'admin') && (
              <>
                <Link
                  to="/create-event"
                  className={`nav-link ${isActive('/create-event') ? 'active' : ''}`}
                >
                  Create event
                </Link>
                <Link
                  to="/checkin"
                  className={`nav-link ${isActive('/checkin') ? 'active' : ''}`}
                >
                  Check-in
                </Link>
              </>
            )}

            <div className="navbar-profile" ref={dropdownRef}>
              <button
                className="profile-trigger"
                aria-expanded={dropdownOpen}
                onClick={() => setDropdownOpen((open) => !open)}
              >
                <span className="profile-avatar">{initials}</span>
                <span className="profile-chevron">▾</span>
              </button>

              {dropdownOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="profile-dropdown-name">{user.name}</div>
                    <span className="role-badge profile-dropdown-role">{user.role}</span>
                  </div>
                  <button className="profile-dropdown-item" onClick={handleLogout}>
                    Log out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
              Login
            </Link>
            <Link to="/signup" className={`nav-link ${isActive('/signup') ? 'active' : ''}`}>
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;