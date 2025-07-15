import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/token/', {
        username,
        password,
      });
      const { access, refresh } = res.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      const decoded = jwtDecode(access);
      const isAdmin = !!decoded.is_staff;

      onLogin({ isLoggedIn: true, isAdmin });
    } catch (err) {
      alert('Login failed');
    }
  };

  const handleRegister = async e => {
    e.preventDefault();
    try {
      await axios.post('/api/register/', {
        username,
        password,
      });
      alert('Registration successful! You can now log in.');
      setIsRegistering(false);
    } catch (err) {
      alert('Registration error');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">{isRegistering ? 'Register' : 'Login'}</h2>
        <form onSubmit={isRegistering ? handleRegister : handleLogin}>
          <label className="login-label">Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="login-input"
            required
          />

          <label className="login-label">Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="login-input"
            required
          />

          <button type="submit" className="login-button">
            {isRegistering ? 'Register' : 'Login'}
          </button>

          <button
            type="button"
            className="login-link-button"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering ? 'Already have an account? Log in' : "Don't have an account? Register"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
