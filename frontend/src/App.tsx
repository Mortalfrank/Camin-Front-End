import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Receipt from './pages/Receipt';
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import ProductsList from './admin/products/ProductList';
import AdminOrdersList from './admin/orders/AdminOrdersList';
import AdminOrderDetail from './admin/orders/AdminOrderDetail';
import SalesAnalytics from './admin/analytics/SalesAnalytics';
import ProductAnalytics from './admin/analytics/ProductAnalytics';
import CustomerAnalytics from './admin/analytics/CustomerAnalytics';
import Profile from './pages/Profile';
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
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/receipt/:orderId" element={<Receipt />} />

          <Route path="/profile" element={<Profile />} />

          {/* Admin login page */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Layout wraps all background pages */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders/list" element = {<AdminOrdersList />} />
            <Route path="orders/:orderId" element = {<AdminOrderDetail />} />
            <Route path="products/list" element = {<ProductsList />} />
            <Route path="analytics/sales" element = {<SalesAnalytics />} />
            <Route path="analytics/products" element = {<ProductAnalytics />} />
            <Route path="analytics/customers" element = {<CustomerAnalytics />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
