import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  loginWithEmail, 
  loginWithPhone, 
  isLoginError,
  EmailLoginRequest,
  PhoneLoginRequest 
} from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;

      if (loginMethod === 'email') {
        const request: EmailLoginRequest = {
          email: formData.email,
          password: formData.password,
        };
        result = await loginWithEmail(request);
      } else {
        const request: PhoneLoginRequest = {
          phoneNumber: formData.phoneNumber,
          password: formData.password,
        };
        result = await loginWithPhone(request);
      }

      if (isLoginError(result)) {
        setError(result.error);
      } else {
        // 检查是否是 ADMIN 账户，如果是则拒绝登录
        if (result.role === 'ADMIN') {
          setError(loginMethod === 'email' 
            ? 'Invalid email or password' 
            : 'Invalid phone number or password'
          );
          return;
        }

        // USER 账户正常登录
        login(result);
        navigate('/orders');
      }
    } catch (err) {
      setError('Login failed, please try again later');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {/* Login method tabs */}
      <div className="login-tabs">
        <button
          type="button"
          className={loginMethod === 'email' ? 'active' : ''}
          onClick={() => setLoginMethod('email')}
        >
          Email Login
        </button>
        <button
          type="button"
          className={loginMethod === 'phone' ? 'active' : ''}
          onClick={() => setLoginMethod('phone')}
        >
          Phone Login
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {loginMethod === 'email' ? (
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Please enter your email"
            />
          </div>
        ) : (
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              required
              placeholder="Please enter your phone number"
            />
          </div>
        )}

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Please enter your password"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <p className="signup-link">
        Don't have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
