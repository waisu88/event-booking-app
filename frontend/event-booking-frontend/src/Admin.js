import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Admin({ onCreated }) {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/categories/')
      .then(res => setCategories(res.data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://127.0.0.1:8000/api/slots/', {
        category,
        start_time: startTime,
        end_time: endTime,
      });
      alert('Slot utworzony!');
      setCategory('');
      setStartTime('');
      setEndTime('');
      onCreated();
    } catch (err) {
      alert('Błąd podczas tworzenia slotu');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>Dodaj nowy slot</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Kategoria:
          <select required value={category} onChange={e => setCategory(e.target.value)}>
            <option value="">Wybierz kategorię</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label><br />
        <label>
          Start (YYYY-MM-DDTHH:mm):
          <input
            type="datetime-local"
            required
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
          />
        </label><br />
        <label>
          Koniec (YYYY-MM-DDTHH:mm):
          <input
            type="datetime-local"
            required
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
          />
        </label><br />
        <button type="submit" disabled={loading}>{loading ? 'Tworzenie...' : 'Utwórz slot'}</button>
      </form>
    </div>
  );
}

export default Admin;
