import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../api/eventApi';

function CreateEvent() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    category: '',
    capacity: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await createEvent({
        ...form,
        capacity: Number(form.capacity),
      });
      navigate(`/events/${data.event._id}`);
    } catch (err) {
      const message =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.message ||
        'Failed to create event.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="form-card">
        <div className="page-header">
          <h2>Create a new event</h2>
          <p>Fill in the details below to publish your event.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-section-title">Event details</div>

          <div className="form-field">
            <label>Title</label>
            <input name="title" value={form.title} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label>Category</label>
            <input name="category" value={form.category} onChange={handleChange} placeholder="e.g. workshop" />
            <div className="field-hint">Helps attendees filter and find your event.</div>
          </div>

          <div className="form-section-title">Date &amp; location</div>

          <div className="form-row">
            <div className="form-field">
              <label>Date and time</label>
              <input
                type="datetime-local"
                name="eventDate"
                value={form.eventDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-field">
              <label>Capacity</label>
              <input
                type="number"
                name="capacity"
                value={form.capacity}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label>Location</label>
            <input name="location" value={form.location} onChange={handleChange} required />
          </div>

          {error && (
            <div className="alert alert-error">
              <p>{error}</p>
            </div>
          )}

          <button type="submit" className="btn-block" disabled={loading}>
            {loading ? 'Creating...' : 'Create event'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;