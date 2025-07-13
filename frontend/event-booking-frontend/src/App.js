import { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './Login';
import Preferences from './Preferences';
import UserView from './UserView';
import AdminSlots from './AdminSlots';
import { jwtDecode } from 'jwt-decode'; // poprawione importowanie jwtDecode
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('decoded JWT:', decoded); // <-- DODAJ TO TUTAJ
        setIsAdmin(!!decoded.is_staff); // użyj tylko is_staff z tokena
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setIsLoggedIn(true);
      } catch (err) {
        console.error('Błąd dekodowania tokena:', err);
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      axios.get('http://127.0.0.1:8000/api/categories/')
        .then(res => setCategories(res.data))
        .catch(err => console.error(err));
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;
  console.log('isAdmin:', isAdmin);
  return (
    <div className="app-container">
      <button
        className="logout-btn"
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

      <Preferences categories={categories} />

      <div>
        {isAdmin 
          ? <AdminSlots isAdmin={true} categories={categories} /> 
          : <UserView categories={categories} />}
      </div>
    </div>
  );
}

export default App;
