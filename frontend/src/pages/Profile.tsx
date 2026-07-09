import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getProfile, 
  updateProfile, 
  sendProfileUpdateCode,
  isProfileError, 
  UpdateProfileRequest 
} from '../api/client';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePhoneNumber, validateUsername } from '../utils/validation';
import './Profile.css';
import ShippingAddressManager from '../components/ShippingAddressManager';

export default function Profile() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  // 原始数据
  const [originalData, setOriginalData] = useState({
    email: '',
    phoneNumber: '',
  });

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    gender: '',
    dob: '',
    emailVerificationCode: '',
    phoneVerificationCode: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 验证码相关状态
  const [emailCodeSending, setEmailCodeSending] = useState(false);
  const [phoneCodeSending, setPhoneCodeSending] = useState(false);
  const [emailCountdown, setEmailCountdown] = useState(0);
  const [phoneCountdown, setPhoneCountdown] = useState(0);

  // 倒计时
  useEffect(() => {
    if (emailCountdown > 0) {
      const timer = setTimeout(() => setEmailCountdown(emailCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailCountdown]);

  useEffect(() => {
    if (phoneCountdown > 0) {
      const timer = setTimeout(() => setPhoneCountdown(phoneCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [phoneCountdown]);

  // 加载用户信息
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function loadProfile() {
      const result = await getProfile(user!.id);
      if (isProfileError(result)) {
        setError(result.error);
      } else {
        let formattedDob = '';
        if (result.dob) {
          const date = new Date(result.dob);
          if (!isNaN(date.getTime())) {
            formattedDob = date.toISOString().split('T')[0];
          }
        }

        // 如果是临时值，显示为空让用户输入
        const displayPhone = result.phoneNumber?.startsWith('TEMP_') ? '' : result.phoneNumber;
        const displayEmail = result.email?.includes('@placeholder.local') ? '' : result.email;

        setFormData({
          username: result.username || '',
          email: displayEmail || '',
          phoneNumber: displayPhone || '',
          gender: result.gender || '',
          dob: formattedDob,
          emailVerificationCode: '',
          phoneVerificationCode: '',
        });

        setOriginalData({
          email: result.email || '',
          phoneNumber: result.phoneNumber || '',
        });
      }
      setLoading(false);
    }

    loadProfile();
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: '' }));
    setMessage(null);
  };

  // 检查是否是临时邮箱
  const isTempEmail = () => {
    return originalData.email.includes('@placeholder.local');
  };

  // 检查是否是临时手机号
  const isTempPhone = () => {
    return originalData.phoneNumber.startsWith('TEMP_');
  };

  // 检查邮箱是否需要验证（修改了或者是绑定新邮箱）
  const needEmailVerification = () => {
    // 如果输入了新邮箱
    if (!formData.email) return false;
    
    // 如果原来是临时邮箱，现在要绑定真实邮箱
    if (isTempEmail()) return true;
    
    // 如果邮箱和原来不同
    return formData.email !== originalData.email;
  };

  // 检查手机号是否需要验证（修改了或者是绑定新手机号）
  const needPhoneVerification = () => {
    // 如果输入了新手机号
    if (!formData.phoneNumber) return false;
    
    // 如果原来是临时手机号，现在要绑定真实手机号
    if (isTempPhone()) return true;
    
    // 如果手机号和原来不同
    return formData.phoneNumber !== originalData.phoneNumber;
  };

  // 发送邮箱验证码
  const handleSendEmailCode = async () => {
    if (!user) return;

    const emailResult = validateEmail(formData.email);
    if (!emailResult.isValid) {
      setFieldErrors(prev => ({ ...prev, email: emailResult.error || '' }));
      return;
    }

    setEmailCodeSending(true);
    setError(null);
    setMessage(null);

    try {
      const result = await sendProfileUpdateCode(user.id, {
        method: 'email',
        email: formData.email,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setMessage('Email verification code sent! (Check console in dev mode)');
        setEmailCountdown(60);
      }
    } catch (err) {
      setError('Failed to send verification code');
    } finally {
      setEmailCodeSending(false);
    }
  };

  // 发送手机验证码
  const handleSendPhoneCode = async () => {
    if (!user) return;

    const phoneResult = validatePhoneNumber(formData.phoneNumber);
    if (!phoneResult.isValid) {
      setFieldErrors(prev => ({ ...prev, phoneNumber: phoneResult.error || '' }));
      return;
    }

    setPhoneCodeSending(true);
    setError(null);
    setMessage(null);

    try {
      const result = await sendProfileUpdateCode(user.id, {
        method: 'phone',
        phoneNumber: formData.phoneNumber,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setMessage('Phone verification code sent! (Check console in dev mode)');
        setPhoneCountdown(60);
      }
    } catch (err) {
      setError('Failed to send verification code');
    } finally {
      setPhoneCodeSending(false);
    }
  };

  // 验证表单
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 验证用户名
    if (formData.username) {
      const usernameResult = validateUsername(formData.username);
      if (!usernameResult.isValid) {
        errors.username = usernameResult.error || '';
      }
    }

    // 如果需要邮箱验证
    if (needEmailVerification()) {
      const emailResult = validateEmail(formData.email);
      if (!emailResult.isValid) {
        errors.email = emailResult.error || '';
      }
      if (!formData.emailVerificationCode || formData.emailVerificationCode.length !== 6) {
        errors.emailVerificationCode = 'Please enter the 6-digit email verification code';
      }
    }

    // 如果需要手机号验证
    if (needPhoneVerification()) {
      const phoneResult = validatePhoneNumber(formData.phoneNumber);
      if (!phoneResult.isValid) {
        errors.phoneNumber = phoneResult.error || '';
      }
      if (!formData.phoneVerificationCode || formData.phoneVerificationCode.length !== 6) {
        errors.phoneVerificationCode = 'Please enter the 6-digit phone verification code';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setMessage(null);
    setError(null);

    const updateData: UpdateProfileRequest = {
      username: formData.username,
      gender: formData.gender,
      dob: formData.dob,
    };

    // 如果需要更新邮箱
    if (needEmailVerification()) {
      updateData.email = formData.email;
      updateData.emailVerificationCode = formData.emailVerificationCode;
    }

    // 如果需要更新手机号
    if (needPhoneVerification()) {
      updateData.phoneNumber = formData.phoneNumber;
      updateData.phoneVerificationCode = formData.phoneVerificationCode;
    }

    const result = await updateProfile(user.id, updateData);

    if (isProfileError(result)) {
      setError(result.error);
    } else {
      setMessage('Profile updated successfully!');
      
      // 更新本地用户状态
      login({
        id: result.id,
        email: result.email,
        username: result.username,
        role: result.role,
      });

      // 更新原始数据
      setOriginalData({
        email: result.email,
        phoneNumber: result.phoneNumber,
      });

      // 更新显示的数据
      const displayPhone = result.phoneNumber?.startsWith('TEMP_') ? '' : result.phoneNumber;
      const displayEmail = result.email?.includes('@placeholder.local') ? '' : result.email;

      setFormData(prev => ({
        ...prev,
        email: displayEmail || prev.email,
        phoneNumber: displayPhone || prev.phoneNumber,
        emailVerificationCode: '',
        phoneVerificationCode: '',
      }));
    }

    setSaving(false);
  };

  if (loading) {
    return <div className="profile-container">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <h2>My Profile</h2>

      <form onSubmit={handleSubmit}>
        {/* 用户名 */}
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Enter your username (no spaces)"
          />
          {fieldErrors.username && <span className="field-error">{fieldErrors.username}</span>}
        </div>

        {/* 邮箱 */}
        <div className="form-group">
          <label>
            Email
            {isTempEmail() && <span className="bind-badge">Not bound - Please bind your email</span>}
            {!isTempEmail() && needEmailVerification() && (
              <span className="change-badge">Changed - Verification Required</span>
            )}
          </label>
          <div className="input-with-button">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={isTempEmail() ? "Enter email to bind" : "Enter your email"}
            />
            {(needEmailVerification()) && (
              <button
                type="button"
                onClick={handleSendEmailCode}
                disabled={emailCodeSending || emailCountdown > 0 || !formData.email}
                className="send-code-btn"
              >
                {emailCodeSending ? 'Sending...' : emailCountdown > 0 ? `${emailCountdown}s` : 'Send Code'}
              </button>
            )}
          </div>
          {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
        </div>

        {/* 邮箱验证码 */}
        {needEmailVerification() && (
          <div className="form-group">
            <label>Email Verification Code</label>
            <input
              type="text"
              name="emailVerificationCode"
              value={formData.emailVerificationCode}
              onChange={handleChange}
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
            {fieldErrors.emailVerificationCode && (
              <span className="field-error">{fieldErrors.emailVerificationCode}</span>
            )}
          </div>
        )}

        {/* 手机号 */}
        <div className="form-group">
          <label>
            Phone Number
            {isTempPhone() && <span className="bind-badge">Not bound - Please bind your phone</span>}
            {!isTempPhone() && needPhoneVerification() && (
              <span className="change-badge">Changed - Verification Required</span>
            )}
          </label>
          <div className="input-with-button">
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder={isTempPhone() ? "Enter phone number to bind (10 digits)" : "Enter your phone number"}
              maxLength={10}
            />
            {(needPhoneVerification()) && (
              <button
                type="button"
                onClick={handleSendPhoneCode}
                disabled={phoneCodeSending || phoneCountdown > 0 || !formData.phoneNumber}
                className="send-code-btn"
              >
                {phoneCodeSending ? 'Sending...' : phoneCountdown > 0 ? `${phoneCountdown}s` : 'Send Code'}
              </button>
            )}
          </div>
          {fieldErrors.phoneNumber && <span className="field-error">{fieldErrors.phoneNumber}</span>}
        </div>

        {/* 手机验证码 */}
        {needPhoneVerification() && (
          <div className="form-group">
            <label>Phone Verification Code</label>
            <input
              type="text"
              name="phoneVerificationCode"
              value={formData.phoneVerificationCode}
              onChange={handleChange}
              placeholder="Enter 6-digit code"
              maxLength={6}
            />
            {fieldErrors.phoneVerificationCode && (
              <span className="field-error">{fieldErrors.phoneVerificationCode}</span>
            )}
          </div>
        )}

        {/* 性别 */}
        <div className="form-group">
          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="OTHER">Other</option>
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

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <ShippingAddressManager />

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}