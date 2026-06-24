import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyRegistrations, getRegistrationQRCode, cancelRegistration } from '../api/registrationApi';

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState({});

  const statusBadgeClass = (status) => {
  if (status === 'waitlisted') return 'status-badge waitlisted';
  if (status === 'cancelled') return 'status-badge cancelled';
  return 'status-badge';
};

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const data = await getMyRegistrations();
      setRegistrations(data.registrations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleShowQR = async (registrationId) => {
    if (qrCodes[registrationId]) {
      setQrCodes((prev) => {
        const updated = { ...prev };
        delete updated[registrationId];
        return updated;
      });
      return;
    }

    try {
      const data = await getRegistrationQRCode(registrationId);
      setQrCodes((prev) => ({ ...prev, [registrationId]: data.qrCode }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = async (registrationId) => {
    try {
      await cancelRegistration(registrationId);
      fetchRegistrations();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="page state-message">
        <div className="spinner" />
        <p>Loading your registrations...</p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>My registrations</h2>
        <p>Events you've signed up for, with check-in QR codes.</p>
      </div>

      {registrations.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🎟️</div>
          <h3>No registrations yet</h3>
          <p>Browse events and register to see them here, along with your check-in QR codes.</p>
          <Link to="/" className="btn">
            Browse events
          </Link>
        </div>
      )}

      {registrations.map((reg) => (
        <div key={reg._id} className="registration-card">
          <div className="registration-card-header">
  <div>
    <h3 className="registration-event-title">{reg.event?.title}</h3>
    <div className="event-meta-row">
      <span className="event-meta-item">
        <span className="event-meta-icon">📅</span>
        {new Date(reg.event?.eventDate).toLocaleString()}
      </span>
      <span className="event-meta-item">
        <span className="event-meta-icon">📍</span>
        {reg.event?.location}
      </span>
    </div>
  </div>
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
    <span className={statusBadgeClass(reg.status)}>{reg.status}</span>
    {reg.status === 'confirmed' && (
      <span className={reg.checkedIn ? 'checkin-badge checked-in' : 'checkin-badge not-checked-in'}>
        {reg.checkedIn ? '✓ Checked in' : 'Not checked in'}
      </span>
    )}
  </div>
</div>

          <div className="registration-actions">
            <button className="btn-secondary btn-sm" onClick={() => handleShowQR(reg._id)}>
              {qrCodes[reg._id] ? 'Hide QR code' : 'Show QR code'}
            </button>
            <button className="btn-danger btn-sm" onClick={() => handleCancel(reg._id)}>
              Cancel registration
            </button>
          </div>

          {qrCodes[reg._id] && (
            <div className="qr-container">
              <img src={qrCodes[reg._id]} alt="Registration QR code" width={180} height={180} />
              <span className="qr-hint">Show this at check-in</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default MyRegistrations;