import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { sendResetCode, resetPassword } from '../api/client';
import { validateEmail, validatePhoneNumber, validatePassword } from '../utils/validation';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const navigate = useNavigate();

  // 步骤: 1 = 输入邮箱/手机, 2 = 输入验证码和新密码
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<'email' | 'phone'>('email');

  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 验证码倒计时
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  // 步骤1：发送验证码
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    // 验证输入
    if (method === 'email') {
      const result = validateEmail(formData.email);
      if (!result.isValid) {
        setFieldErrors({ email: result.error || '' });
        return;
      }
    } else {
      const result = validatePhoneNumber(formData.phoneNumber);
      if (!result.isValid) {
        setFieldErrors({ phoneNumber: result.error || '' });
        return;
      }
    }

    setLoading(true);

    try {
      const result = await sendResetCode({
        method,
        email: method === 'email' ? formData.email : undefined,
        phoneNumber: method === 'phone' ? formData.phoneNumber : undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setMessage('Verification code sent! Check your ' + (method === 'email' ? 'email' : 'phone'));
        setCountdown(60);
        setStep(2);
      }
    } catch (err) {
      setError('Failed to send verification code');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 重新发送验证码
  const handleResendCode = async () => {
    if (countdown > 0) return;

    setLoading(true);
    setError(null);

    try {
      const result = await sendResetCode({
        method,
        email: method === 'email' ? formData.email : undefined,
        phoneNumber: method === 'phone' ? formData.phoneNumber : undefined,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setMessage('Verification code resent!');
        setCountdown(60);
      }
    } catch (err) {
      setError('Failed to resend verification code');
    } finally {
      setLoading(false);
    }
  };

  // 步骤2：重置密码
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const errors: Record<string, string> = {};

    // 验证验证码
    if (!formData.verificationCode || formData.verificationCode.length !== 6) {
      errors.verificationCode = 'Please enter the 6-digit verification code';
    }

    // 验证新密码
    const passwordResult = validatePassword(formData.newPassword);
    if (!passwordResult.isValid) {
      errors.newPassword = passwordResult.error || '';
    }

    // 验证确认密码
    if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword({
        method,
        email: method === 'email' ? formData.email : undefined,
        phoneNumber: method === 'phone' ? formData.phoneNumber : undefined,
        verificationCode: formData.verificationCode,
        newPassword: formData.newPassword,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setMessage('Password reset successfully! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError('Failed to reset password');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>

      {step === 1 && (
        <>
          {/* 选择重置方式 */}
          <div className="method-tabs">
            <button
              type="button"
              className={method === 'email' ? 'active' : ''}
              onClick={() => setMethod('email')}
            >
              Reset via Email
            </button>
            <button
              type="button"
              className={method === 'phone' ? 'active' : ''}
              onClick={() => setMethod('phone')}
            >
              Reset via Phone
            </button>
          </div>

          <form onSubmit={handleSendCode}>
            {method === 'email' ? (
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your registered email"
                />
                {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
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
                  placeholder="Enter your registered phone number"
                  maxLength={10}
                />
                {fieldErrors.phoneNumber && <span className="field-error">{fieldErrors.phoneNumber}</span>}
              </div>
            )}

            <button type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>
          </form>
        </>
      )}

      {step === 2 && (
        <form onSubmit={handleResetPassword}>
          <p className="info-text">
            Verification code sent to: {method === 'email' ? formData.email : formData.phoneNumber}
          </p>

          <div className="form-group">
            <label>Verification Code</label>
            <div className="input-with-button">
              <input
                type="text"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                required
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
              <button
                type="button"
                onClick={handleResendCode}
                disabled={countdown > 0}
                className="resend-btn"
              >
                {countdown > 0 ? `${countdown}s` : 'Resend'}
              </button>
            </div>
            {fieldErrors.verificationCode && <span className="field-error">{fieldErrors.verificationCode}</span>}
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              placeholder="Min 8 chars, uppercase, lowercase, number"
            />
            {fieldErrors.newPassword && <span className="field-error">{fieldErrors.newPassword}</span>}
            <small className="hint">At least 8 characters with uppercase, lowercase, and number</small>
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Re-enter your new password"
            />
            {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          <button
            type="button"
            className="back-btn"
            onClick={() => setStep(1)}
          >
            ← Back
          </button>
        </form>
      )}

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}

      <p className="login-link">
        Remember your password? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}