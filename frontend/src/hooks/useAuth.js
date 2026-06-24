import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Convenience hook so components do:
//   const { user, loginUser, logoutUser } = useAuth();
// instead of importing useContext + AuthContext everywhere.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};