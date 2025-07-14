import { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './Login';
import UserView from './UserView';
import AdminSlots from './AdminSlots';
import { jwtDecode } from 'jwt-decode';
import './App.css';


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState([]);

  const handleLogin = ({ isLoggedIn, isAdmin }) => {
    setIsLoggedIn(isLoggedIn);
    setIsAdmin(isAdmin);
    const token = localStorage.getItem('access_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setIsLoggedIn(true);
        setIsAdmin(!!decoded.is_staff);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      axios.get('/api/categories/')
        .then(res => setCategories(res.data))
        .catch(console.error);
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return <Login onLogin={handleLogin} />;

  return (
    <div className="app-container">
      <button
        onClick={() => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          delete axios.defaults.headers.common['Authorization'];
          setIsLoggedIn(false);
          setIsAdmin(false);
        }}
      >
        Wyloguj
      </button>
      
      {isAdmin ? (
        <AdminSlots isAdmin categories={categories} />
      ) : (
        <UserView categories={categories} />
      )}
    </div>
  );
}

export default App;