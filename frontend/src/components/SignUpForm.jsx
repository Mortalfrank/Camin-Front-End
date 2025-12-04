// frontend/src/components/SignUpForm.jsx
import { useState } from 'react';
import { signUpWithEmail, signUpWithPhone } from '../api/client';

export default function SignUpForm() {
  // 切换注册方式：'email' 或 'phone'
  const [signUpMethod, setSignUpMethod] = useState('email');
  
  // 表单数据
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    password: '',
    username: '',
    gender: 'OTHER',
    dob: '',
  });
  
  // 状态
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // 处理输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
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
          gender: formData.gender,
          dob: formData.dob,
        });
      } else {
        result = await signUpWithPhone({
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          username: formData.username,
          gender: formData.gender,
          dob: formData.dob,
        });
      }

      if (result.error) {
        setError(result.error);
      } else {
        setMessage(`Registered successfully,User ID: ${result.userId}`);
        // 清空表单
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
      setError('Registration failed. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>User registration</h2>
      
      {/* 切换注册方式 */}
      <div className="signup-tabs">
        <button 
          type="button"
          className={signUpMethod === 'email' ? 'active' : ''}
          onClick={() => setSignUpMethod('email')}
        >
          Registration by email
        </button>
        <button 
          type="button"
          className={signUpMethod === 'phone' ? 'active' : ''}
          onClick={() => setSignUpMethod('phone')}
        >
          Registration by phone number
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
              required
              placeholder="Please enter your email"
            />
          </div>
        ) : (
          <div className="form-group">
            <label>Phone number</label>
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

        {/* 密码 */}
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

        {/* 用户名 */}
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Please enter your username"
          />
        </div>

        {/* 性别 */}
        <div className="form-group">
          <label>Gentle</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="OTHER">Other</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>

        {/* 出生日期 */}
        <div className="form-group">
          <label>Birthday</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />
        </div>

        {/* 提交按钮 */}
        <button type="submit" disabled={loading}>
          {loading ? 'Registrating...' : 'Register'}
        </button>
      </form>

      {/* 显示消息 */}
      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}