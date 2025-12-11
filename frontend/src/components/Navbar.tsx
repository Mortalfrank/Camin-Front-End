import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartIcon from './CartIcon';
import './Navbar.css';

export default function Navbar() {
  const { isLoggedIn, logout, user } = useAuth();
  const { itemCount } = useCart();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Camin</Link>

      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        {isLoggedIn() ? (
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
            <span className="text-gray-600">{user?.username}</span>
            <button onClick={logout} className="text-red-600 hover:text-red-800">
              Logout
            </button>
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
