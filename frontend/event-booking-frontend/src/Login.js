import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // popraw import

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/token/', {
        username,
        password,
      });
      const { access, refresh } = res.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      const decoded = jwtDecode(access);
      const isAdmin = !!decoded.is_staff;

      // Przekaż od razu info do App
      onLogin({ isLoggedIn: true, isAdmin });

    } catch (err) {
      alert('Logowanie nieudane');
    }
  };

  const handleRegister = async e => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/register/', {
        username,
        password,
      });
      alert('Rejestracja zakończona sukcesem! Zaloguj się.');
      setIsRegistering(false);
    } catch (err) {
      alert('Błąd rejestracji');
    }
  };

  return (
    <div>
      {isRegistering ? (
        <form onSubmit={handleRegister}>
          <h2>Rejestracja</h2>
          <input
            type="text"
            placeholder="Nazwa użytkownika"
            value={username}
            onChange={e => setUsername(e.target.value)}
          /><br />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={e => setPassword(e.target.value)}
          /><br />
          <button type="submit">Zarejestruj</button> &nbsp;
          <button type="button" onClick={() => setIsRegistering(false)}>Masz już konto?</button>
        </form>
      ) : (
        <form onSubmit={handleLogin}>
          <h2>Logowanie</h2>
          <input
            type="text"
            placeholder="Nazwa użytkownika"
            value={username}
            onChange={e => setUsername(e.target.value)}
          /><br />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={e => setPassword(e.target.value)}
          /><br />
          <button type="submit">Zaloguj</button> &nbsp;
          <button type="button" onClick={() => setIsRegistering(true)}>Nie masz konta?</button>
        </form>
      )}
    </div>
  );
}

export default Login;
