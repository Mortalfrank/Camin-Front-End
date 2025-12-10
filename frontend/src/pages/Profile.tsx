import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, isProfileError, UpdateProfileRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    gender: '',
    dob: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        // 格式化日期为 YYYY-MM-DD（input type="date" 需要的格式）
        let formattedDob = '';
        if (result.dob) {
          // 处理可能的日期格式
          const date = new Date(result.dob);
          if (!isNaN(date.getTime())) {
            formattedDob = date.toISOString().split('T')[0];
          }
        }

        setFormData({
          username: result.username || '',
          email: result.email || '',
          phoneNumber: result.phoneNumber || '',
          gender: result.gender || '',
          dob: formattedDob,
        });
      }
      setLoading(false);
    }

    loadProfile();
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);
    setError(null);

    const updateData: UpdateProfileRequest = {
      username: formData.username,
      gender: formData.gender,
      dob: formData.dob,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
    };

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
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Enter your username"
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />
        </div>

        <div className="form-group">
          <label>Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

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
        </div>

        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}