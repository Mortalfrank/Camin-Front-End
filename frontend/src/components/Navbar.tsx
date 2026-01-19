import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import CartIcon from './CartIcon';
import './Navbar.css';

export default function Navbar() {
  const { isLoggedIn, logout, user, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">CAM_IN</Link>

        <div className="navbar-links">
          <Link to="/products">Collections</Link>
          <Link to="/products">Explore</Link>
          <Link to="/">About</Link>
        </div>

        <div className="navbar-actions">
          {isLoggedIn() ? (
            <>
              {isAdmin() ? (
                <Link to="/admin" className="nav-link subtle">Admin</Link>
              ) : (
                <Link to="/orders" className="nav-link subtle">My Orders</Link>
              )}
              <Link to="/profile" className="nav-link subtle">
                {user.username || 'Account'}
              </Link>
              <button onClick={handleLogout} className="nav-button">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link subtle">Login</Link>
              <Link to="/signup" className="nav-link subtle">Sign Up</Link>
            </>
          )}

          <Link to="/cart" className="cart-link">
            <span className="cart-label">Cart</span>
            <span className="cart-count">({itemCount})</span>
            <CartIcon size={18} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
