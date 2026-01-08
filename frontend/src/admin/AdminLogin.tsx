// src/admin/AdminLogin.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../api/client';
import './AdminLogin.css';
type FormErrors = {
  email?: string;
  password?: string;
  form?: string;
};

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required.';
    if (!password.trim()) newErrors.password = 'Password is required.';
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    const response = await adminLogin({
      email: email.trim(),
      password,
    });

    if ('error' in response) {
      setErrors({ form: response.error });
      setLoading(false);
      return;
    }

    if (response.role !== 'ADMIN') {
      setErrors({ form: 'You are not an administrator.' });
      setLoading(false);
      return;
    }

    localStorage.setItem('admin_session', JSON.stringify(response));

    navigate('/admin');
    setLoading(false);
  };

    return (
    <div className="admin-login-page">
        <div className="admin-login-card">
        <h2>Admin Login</h2>

        {errors.form && <p className="admin-login-error">{errors.form}</p>}

        <form onSubmit={handleSubmit}>
            
            {/* Email block */}
            <div className="form-group">
            <label htmlFor="admin-email">Email</label>
            <input
                id="admin-email"
                type="email"
                value={email}
                disabled={loading}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
            </div>

            {/* Password block */}
            <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <input
                id="admin-password"
                type="password"
                value={password}
                disabled={loading}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
            />
            {errors.password && (
                <p className="field-error">{errors.password}</p>
            )}
            </div>
            <div className="admin-login">
              <button type="submit" disabled={loading}>
              {loading ? 'Logging in…' : 'Login'}
              </button>
            </div>
        </form>
        </div>
    </div>
    );
}
