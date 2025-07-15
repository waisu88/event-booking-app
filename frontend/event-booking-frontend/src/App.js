import { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './Login';
import UserView from './UserView';
import AdminView from './AdminView';
import { jwtDecode } from 'jwt-decode';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');
  const [categories, setCategories] = useState([]);

  const handleLogin = ({ isLoggedIn, isAdmin }) => {
    setIsLoggedIn(isLoggedIn);
    setIsAdmin(isAdmin);

    const token = localStorage.getItem('access_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      try {
        const decoded = jwtDecode(token);
        setUsername(decoded.username || '');
      } catch {
        setUsername('');
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsLoggedIn(true);
        setIsAdmin(!!decoded.is_staff);
        setUsername(decoded.username || '');
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch {
        setIsLoggedIn(false);
        setIsAdmin(false);
        setUsername('');
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      axios.get('/api/categories/')
        .then(res => setCategories(res.data));
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p>Welcome, <strong>{username}</strong></p>
        <button
          onClick={() => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            delete axios.defaults.headers.common['Authorization'];
            setIsLoggedIn(false);
            setIsAdmin(false);
            setUsername('');
          }}
        >
          Logout
        </button>
      </div>

      {isAdmin ? (
        <AdminView isAdmin categories={categories} />
      ) : (
        <UserView categories={categories} />
      )}
    </div>
  );
}

export default App;