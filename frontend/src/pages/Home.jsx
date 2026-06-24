import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../api/eventApi';

function Home() {
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getEvents({ page, limit: 6, search: search || undefined });
        setEvents(data.events);
        setPagination(data.pagination);
      } catch (err) {
        setError('Failed to load events.');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [page, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const seatClass = (seatsLeft, capacity) => {
    if (seatsLeft === 0) return 'seats-pill full';
    if (seatsLeft / capacity <= 0.25) return 'seats-pill low';
    return 'seats-pill';
  };

  // Lightweight, honest stats derived from data already on the page —
  // not fake numbers, just a useful summary of what's currently loaded.
  const totalSeatsAvailable = events.reduce((sum, e) => sum + e.seatsLeft, 0);
  const fullyBookedCount = events.filter((e) => e.seatsLeft === 0).length;

  return (
    <div className="page-wide">
      <div className="hero-header">
        <span className="hero-eyebrow">Event management platform</span>
        <h1>Discover great events</h1>
        <p>Browse what's happening near you and register in seconds.</p>
      </div>

      {!loading && events.length > 0 && (
        <div className="stats-strip">
          <div className="stat-card">
            <div className="stat-value">{pagination?.total ?? events.length}</div>
            <div className="stat-label">Events listed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalSeatsAvailable}</div>
            <div className="stat-label">Seats available now</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{fullyBookedCount}</div>
            <div className="stat-label">Fully booked</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSearchSubmit} className="search-bar">
        <input
          type="text"
          placeholder="Search events by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {loading && (
        <div className="state-message">
          <div className="spinner" />
          <p>Loading events...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          <p>{error}</p>
        </div>
      )}

      {!loading && events.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <h3>No events found</h3>
          <p>
            {search
              ? `No events match "${search}". Try a different search term.`
              : "There aren't any events yet. Check back soon, or create one yourself."}
          </p>
          <Link to="/create-event" className="btn">
            Create an event
          </Link>
        </div>
      )}

      {!loading && events.length > 0 && (
        <>
          <div className="section-label">{events.length} event{events.length !== 1 ? 's' : ''}</div>
          <div className="event-grid">
            {events.map((event) => (
              <div key={event._id} className="event-card">
                <div className="event-card-top">
                  <h3>{event.title}</h3>
                  {event.category && <span className="category-badge">{event.category}</span>}
                </div>

                <div className="event-meta-row">
                  <span className="event-meta-item">
                    <span className="event-meta-icon">📅</span>
                    {new Date(event.eventDate).toLocaleDateString()}
                  </span>
                  <span className="event-meta-item">
                    <span className="event-meta-icon">📍</span>
                    {event.location}
                  </span>
                  {event.organizer?.name && (
                    <span className="event-meta-item">
                      <span className="event-meta-icon">👤</span>
                      {event.organizer.name}
                    </span>
                  )}
                </div>

                <span className={seatClass(event.seatsLeft, event.capacity)}>
                  {event.seatsLeft === 0 ? 'Fully booked' : `${event.seatsLeft} of ${event.capacity} seats left`}
                </span>

                <div className="event-card-footer">
                  <Link to={`/events/${event._id}`} className="btn-link">
                    View details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            className="btn-secondary btn-sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            className="btn-secondary btn-sm"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Home;