import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import ProductsList from './admin/products/ProductList';
import './App.css';

function AppLayout() {
  const location = useLocation();

  // Whether it is an administrator-related route (including /admin and /admin/xxx)
  const isAdminRoute = location.pathname.startsWith('/admin');

  // The Administrator router does not display Navbar
  const shouldHideNavbar = isAdminRoute;

  return (
    <>
      {!shouldHideNavbar && <Navbar />}

      {/* Only ordinary user pages use the centered width of main-content */}
      <main className={isAdminRoute ? '' : 'main-content'}>
        <Routes>
          {/* User front-end page */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Admin login page */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Layout wraps all background pages */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products/list" element={<ProductsList />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
