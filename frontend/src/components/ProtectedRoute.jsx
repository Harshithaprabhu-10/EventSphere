import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Usage: <ProtectedRoute roles={['organizer', 'admin']}><CreateEvent /></ProtectedRoute>
// If roles is omitted, only checks that the user is logged in (any role allowed).
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  // Still checking if a token in localStorage is valid — don't redirect prematurely
  if (loading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <p>You don't have permission to view this page.</p>;
  }

  return children;
}

export default ProtectedRoute;