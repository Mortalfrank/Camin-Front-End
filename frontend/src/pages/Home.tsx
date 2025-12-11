import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { isLoggedIn } = useAuth();

  return (
    <div className="p-8 text-center">
      <h2 className="text-4xl font-bold mb-4">Welcome to Camin</h2>
      <p className="text-gray-600 mb-6">Discover our amazing products</p>
      <Link
        to="/products"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition-colors"
      >
        Browse Products
      </Link>
      {!isLoggedIn() && (
        <div className="mt-4">
          <Link to="/login" className="text-blue-600 hover:text-blue-800 mr-4">
            Login
          </Link>
          <Link to="/signup" className="text-blue-600 hover:text-blue-800">
            Sign Up
          </Link>
        </div>
      )}
    </div>
  );
}