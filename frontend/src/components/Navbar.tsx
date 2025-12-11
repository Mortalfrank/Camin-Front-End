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
      <Link to="/" className="navbar-brand">Camin</Link>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        {isLoggedIn() ? (
          <>
            
            {isAdmin() ? (
              <Link to="/admin">Admin</Link>
            ) : (
              <Link to="/dashboard">Dashboard</Link>
            )}
            <Link to="/profile">Profile</Link>
            <Link to="/cart" className="relative flex items-center gap-2">
              <CartIcon size={20} />
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            <span className="user-info">Hi, {user.username || 'User'}</span>
            <button onClick={logout} className="text-red-600 hover:text-red-800">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/cart" className="relative flex items-center gap-2">
              <CartIcon size={20} />
              <span>Cart</span>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
             <Link to="/login">Login</Link>
             <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}