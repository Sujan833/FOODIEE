import React, { useState } from 'react';

const AuthModal = ({ isOpen, onClose, user, onLoginSuccess, onLogout }) => {
  const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_SERVER_URL) || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' ? '' : 'http://localhost:5000');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    pincode: ''
  });

  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    const endpoint = isLogin ? `${API_BASE}/api/auth/login` : `${API_BASE}/api/auth/register`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok && data.user) {
        onLoginSuccess(data.user);
        setFormData({ name: '', email: '', password: '', phone: '', address: '', pincode: '' });
        onClose();
      } else {
        setErrorMessage(data.error || 'Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Auth error:', err);
      setLoading(false);
      setErrorMessage('Unable to connect to authentication server.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-header">
          <h2>{user ? '👤 Account Profile' : isLogin ? '🔑 Account Log In' : '✨ Create New Account'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {user ? (
          <div className="profile-view">
            <div className="profile-avatar">
              <span>{user.name ? user.name.charAt(0).toUpperCase() : '👤'}</span>
            </div>
            <h3>{user.name}</h3>
            <p className="profile-email">📧 {user.email}</p>
            <p className="profile-phone">📱 {user.phone || 'No phone number added'}</p>
            <div className="profile-address-box">
              <h4>📍 Default Delivery Address</h4>
              <p>{user.address || 'No address added yet'} {user.pincode ? `(${user.pincode})` : ''}</p>
            </div>

            <div className="profile-actions">
              <button className="btn-secondary" onClick={onClose}>Close</button>
              <button className="btn-logout" onClick={onLogout}>Log Out</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form-content">
            {errorMessage && (
              <div className="auth-error-banner">
                ⚠️ {errorMessage}
              </div>
            )}

            {!isLogin && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  name="name"
                  placeholder="e.g. Sujan Kumar"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="sujan@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {!isLogin && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label>Mobile Number</label>
                    <input
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label>Pincode</label>
                    <input
                      name="pincode"
                      placeholder="560001"
                      value={formData.pincode}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Delivery Address</label>
                  <input
                    name="address"
                    placeholder="House No, Street, Landmark"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
              {loading ? 'Verifying...' : isLogin ? 'Log In to Account' : 'Register Account'}
            </button>

            <div
              className="auth-toggle-link"
              onClick={() => {
                setIsLogin(!isLogin);
                setErrorMessage('');
              }}
            >
              {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Log In'}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;
