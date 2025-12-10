import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Camin</Link>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        
        {user ? (
          <>
            {isAdmin() ? (
              <Link to="/admin">Admin</Link>
            ) : (
              <Link to="/dashboard">Dashboard</Link>
            )}
            <Link to="/profile">Profile</Link>
            <span className="user-info">Hi, {user.username || 'User'}</span>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}