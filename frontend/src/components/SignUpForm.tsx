import { useState } from 'react';
import { signUpWithEmail, signUpWithPhone } from '../api/client';

type SignUpMethod = 'email' | 'phone';

interface FormData {
  email: string;
  phoneNumber: string;
  password: string;
  username: string;
  gender: 'OTHER' | 'MALE' | 'FEMALE';
  dob: string;
}

export default function SignUpForm() {
  const [signUpMethod, setSignUpMethod] = useState<SignUpMethod>('email');

  const [formData, setFormData] = useState<FormData>({
    email: '',
    phoneNumber: '',
    password: '',
    username: '',
    gender: 'OTHER',
    dob: '',
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 表单输入处理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      let result: any;

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
        setMessage(`Registered successfully, User ID: ${result.userId}`);

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
      console.error(err);
      setError('Registration failed. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2>User registration</h2>

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

        <div className="form-group">
          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="OTHER">Other</option>
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
        </div>

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

        <button type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
