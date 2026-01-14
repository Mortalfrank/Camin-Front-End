// src/components/SignUpForm.tsx
import { useState, useEffect } from 'react';
import { signUpWithEmail, signUpWithPhone, sendVerificationCode } from '../api/client';
import { 
  validateEmail, 
  validatePhoneNumber, 
  validatePassword, 
  validateUsername 
} from '../utils/validation';
import './SignUpForm.css';

export default function SignUpForm() {
  const [signUpMethod, setSignUpMethod] = useState<'email' | 'phone'>('email');
  
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    password: '',
    username: '',
    gender: 'OTHER',
    dob: '',
    verificationCode: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  // 验证码相关状态
  const [codeSending, setCodeSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  // 倒计时
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let result;

    switch (name) {
      case 'email':
        result = validateEmail(value);
        break;
      case 'phoneNumber':
        result = validatePhoneNumber(value);
        break;
      case 'password':
        result = validatePassword(value);
        break;
      case 'username':
        result = validateUsername(value);
        break;
      default:
        return;
    }

    if (!result.isValid) {
      setFieldErrors(prev => ({ ...prev, [name]: result.error || '' }));
    }
  };

  // 发送验证码
  const handleSendCode = async () => {
    // 先验证手机号
    const phoneResult = validatePhoneNumber(formData.phoneNumber);
    if (!phoneResult.isValid) {
      setFieldErrors(prev => ({ ...prev, phoneNumber: phoneResult.error || '' }));
      return;
    }

    setCodeSending(true);
    setError(null);

    try {
      const result = await sendVerificationCode({ phoneNumber: formData.phoneNumber });
      
      if (result.error) {
        setError(result.error);
      } else {
        setCodeSent(true);
        setCountdown(60); // 60秒倒计时
        setMessage('Verification code sent! Check your phone (or console in dev mode)');
      }
    } catch (err) {
      setError('Failed to send verification code');
      console.error(err);
    } finally {
      setCodeSending(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    const usernameResult = validateUsername(formData.username);
    if (!usernameResult.isValid) {
      errors.username = usernameResult.error || '';
    }

    const passwordResult = validatePassword(formData.password);
    if (!passwordResult.isValid) {
      errors.password = passwordResult.error || '';
    }

    if (signUpMethod === 'email') {
      const emailResult = validateEmail(formData.email);
      if (!emailResult.isValid) {
        errors.email = emailResult.error || '';
      }
    } else {
      const phoneResult = validatePhoneNumber(formData.phoneNumber);
      if (!phoneResult.isValid) {
        errors.phoneNumber = phoneResult.error || '';
      }
      // 验证验证码
      if (!formData.verificationCode || formData.verificationCode.length !== 6) {
        errors.verificationCode = 'Please enter the 6-digit verification code';
      }
    }

    if (!formData.dob) {
      errors.dob = 'Date of birth is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      let result;
      
      if (signUpMethod === 'email') {
        result = await signUpWithEmail({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          gender: formData.gender as 'MALE' | 'FEMALE' | 'OTHER',
          dob: formData.dob,
        });
      } else {
        result = await signUpWithPhone({
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          username: formData.username,
          gender: formData.gender as 'MALE' | 'FEMALE' | 'OTHER',
          dob: formData.dob,
          verificationCode: formData.verificationCode,
        });
      }

      if (result.error) {
        setError(result.error);
      } else {
        setMessage(`Registration successful! User ID: ${result.userId}`);
        setFormData({
          email: '',
          phoneNumber: '',
          password: '',
          username: '',
          gender: 'OTHER',
          dob: '',
          verificationCode: '',
        });
        setCodeSent(false);
      }
    } catch (err) {
      setError('Registration failed, please try again later');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>User Registration</h2>
      
      <div className="signup-tabs">
        <button 
          type="button"
          className={signUpMethod === 'email' ? 'active' : ''}
          onClick={() => setSignUpMethod('email')}
        >
          Email Registration
        </button>
        <button 
          type="button"
          className={signUpMethod === 'phone' ? 'active' : ''}
          onClick={() => setSignUpMethod('phone')}
        >
          Phone Registration
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {signUpMethod === 'email' ? (
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="Only letters, numbers, and dots allowed"
            />
            {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
          </div>
        ) : (
          <>
            {/* 手机号 */}
            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-with-button">
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  required
                  placeholder="10 digits only"
                  maxLength={10}
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={codeSending || countdown > 0}
                  className="send-code-btn"
                >
                  {codeSending ? 'Sending...' : countdown > 0 ? `${countdown}s` : 'Send Code'}
                </button>
              </div>
              {fieldErrors.phoneNumber && <span className="field-error">{fieldErrors.phoneNumber}</span>}
            </div>

            {/* 验证码 */}
            <div className="form-group">
              <label>Verification Code</label>
              <input
                type="text"
                name="verificationCode"
                value={formData.verificationCode}
                onChange={handleChange}
                required
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
              {fieldErrors.verificationCode && <span className="field-error">{fieldErrors.verificationCode}</span>}
              {codeSent && <small className="hint">Code sent! Valid for 5 minutes.</small>}
            </div>
          </>
        )}

        {/* 密码 */}
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            placeholder="Min 8 chars, uppercase, lowercase, number"
          />
          {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
          <small className="hint">
            At least 8 characters with uppercase, lowercase, and number. No spaces.
          </small>
        </div>

        {/* 用户名 */}
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            placeholder="No spaces allowed"
          />
          {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
        </div>

        {/* 性别 */}
        <div className="form-group">
          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="OTHER">Other</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>

        {/* 出生日期 */}
        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
            max={new Date().toISOString().split('T')[0]}
          />
          {fieldErrors.dob && <span className="field-error">{fieldErrors.dob}</span>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}