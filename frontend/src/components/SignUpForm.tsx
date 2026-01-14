import { useState } from 'react';
import { signUpWithEmail, signUpWithPhone } from '../api/client';
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
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 清除该字段的错误
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
  };

  // 实时验证
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 验证用户名
    const usernameResult = validateUsername(formData.username);
    if (!usernameResult.isValid) {
      errors.username = usernameResult.error || '';
    }

    // 验证密码
    const passwordResult = validatePassword(formData.password);
    if (!passwordResult.isValid) {
      errors.password = passwordResult.error || '';
    }

    // 根据注册方式验证
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
    }

    // 验证出生日期
    if (!formData.dob) {
      errors.dob = 'Date of birth is required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单
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
        });
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
      
      {/* 切换注册方式 */}
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
        {/* 邮箱 或 手机号 */}
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
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              onBlur={handleBlur}
              required
              placeholder="10 digits only (e.g., 0412345678)"
              maxLength={10}
            />
            {fieldErrors.phoneNumber && <span className="field-error">{fieldErrors.phoneNumber}</span>}
          </div>
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

        {/* 提交按钮 */}
        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {/* 显示消息 */}
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}