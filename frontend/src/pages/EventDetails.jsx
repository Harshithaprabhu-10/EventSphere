import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getEventById } from '../api/eventApi';
import { registerForEvent } from '../api/registrationApi';
import { useAuth } from '../hooks/useAuth';

function EventDetails() {
  const { id } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [registerMessage, setRegisterMessage] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const fetchEvent = async () => {
    setLoading(true);
    try {
      const data = await getEventById(id);
      setEvent(data.event);
    } catch (err) {
      setError('Event not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    setRegistering(true);
    setRegisterMessage('');
    try {
      const data = await registerForEvent(id);
      // 202 means waitlisted, 201 means confirmed — registerForEvent's axios call
      // resolves successfully either way, so we rely on the backend's message text.
      setRegisterMessage(data.message || 'Successfully registered! Check "My registrations" for your QR code.');
      setRegisterSuccess(true);
      fetchEvent();
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed.';
      setRegisterMessage(message);
      setRegisterSuccess(false);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="page state-message">
        <div className="spinner" />
        <p>Loading event...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="page">
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }
  if (!event) return null;

  const seatsFilledPercent = Math.round(((event.capacity - event.seatsLeft) / event.capacity) * 100);
  const progressClass =
    event.seatsLeft === 0 ? 'full' : event.seatsLeft / event.capacity <= 0.25 ? 'low' : '';

  const organizerInitials = event.organizer?.name
    ? event.organizer.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join('')
    : '?';

  // event.organizer is populated as an object ({ _id, name, email }) from the backend's
  // .populate() call, so we compare its _id against the logged-in user's id.
  const isOwnEvent = user && event.organizer?._id === user.id;

  return (
    <div className="page">
      <div className="event-banner">
        {event.category && <span className="category-badge">{event.category}</span>}
        <h2>{event.title}</h2>
        <span className="event-banner-meta">
          {new Date(event.eventDate).toLocaleString()} · {event.location}
        </span>
      </div>

      <div className="detail-card-body">
        <p>{event.description}</p>

        <div className="organizer-card">
          <div className="organizer-avatar">{organizerInitials}</div>
          <div className="organizer-info">
            <div className="label">Organized by</div>
            <div className="name">{event.organizer?.name}</div>
          </div>
        </div>

        <div className="seat-progress-wrap">
          <div className="seat-progress-track">
            <div
              className={`seat-progress-fill ${progressClass}`}
              style={{ width: `${seatsFilledPercent}%` }}
            />
          </div>
          <div className="seat-progress-label">
            <span>{event.seatsLeft} of {event.capacity} seats left</span>
            <span>{seatsFilledPercent}% filled</span>
          </div>
        </div>

        {!user && <p>Please log in to register for this event.</p>}

        {user && isOwnEvent && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>🎤</span>
            <p style={{ margin: 0 }}>You are the organizer of this event.</p>
          </div>
        )}

        {user && !isOwnEvent && (
          <button onClick={handleRegister} disabled={registering}>
            {registering
              ? 'Processing...'
              : event.seatsLeft === 0
              ? 'Join waitlist'
              : 'Register for this event'}
          </button>
        )}

        {registerMessage && (
          <div className={`alert ${registerSuccess ? 'alert-success' : 'alert-error'}`} style={{ marginTop: 16 }}>
            <p>{registerMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EventDetails;