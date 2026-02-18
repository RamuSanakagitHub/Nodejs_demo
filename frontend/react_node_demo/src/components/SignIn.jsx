import { useState } from 'react';
import './Auth.css';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';

const SignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await apiService.login(email, password);
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('accessToken',data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('role', data.role);
        navigate('/dashboard');
        
        // Get userId from login response and call getUserById
        const userId = data.userId;
        if (userId) {
          const userResponse = await apiService.getUserById(userId, data.accessToken);
          const userData = await userResponse.json();
          if (userResponse.ok) {
            localStorage.setItem('user', JSON.stringify(userData));
          }
        }
        
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign In</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            autoComplete="new-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            autocomplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
};

export default SignIn;
