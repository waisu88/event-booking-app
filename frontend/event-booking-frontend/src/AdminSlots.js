import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminSlots({ isAdmin }) {
  const [slots, setSlots] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    id: null,
    category: '',
    start_time: '',
    end_time: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    fetchSlots();
    fetchCategories();
  }, [isAdmin]);

  const fetchSlots = () => {
    setLoading(true);
    axios.get('/api/slots/')
      .then(res => {
        setSlots(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchCategories = () => {
    axios.get('/api/categories/')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ id: null, category: '', start_time: '', end_time: '' });
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!form.category || !form.start_time || !form.end_time) {
      setError('Wypełnij wszystkie pola.');
      return;
    }

    const data = {
      category_id: form.category,
      start_time: form.start_time,
      end_time: form.end_time,
    };

    if (form.id) {
      // Edycja
      axios.patch(`/api/slots/${form.id}/`, data)
        .then(() => {
          fetchSlots();
          resetForm();
        })
        .catch(err => {
          setError('Błąd przy aktualizacji slotu.');
          console.error(err);
        });
    } else {
      // Tworzenie
      axios.post('/api/slots/', data)
        .then(() => {
          fetchSlots();
          resetForm();
        })
        .catch(err => {
          setError('Błąd przy tworzeniu slotu.');
          console.error(err);
        });
    }
  };

  const handleEdit = (slot) => {
    setForm({
      id: slot.id,
      category: slot.category.id,
      start_time: slot.start_time.slice(0, 16), // format yyyy-mm-ddThh:mm
      end_time: slot.end_time.slice(0, 16),
    });
    setError('');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Na pewno usunąć ten slot?')) return;

    axios.delete(`/api/slots/${id}/`)
      .then(() => fetchSlots())
      .catch(err => {
        setError('Błąd przy usuwaniu slotu.');
        console.error(err);
      });
  };

  if (!isAdmin) return <p>Brak dostępu do panelu administratora.</p>;

  if (loading) return <p>Ładowanie...</p>;

  return (
    <div className="section">
      <h2>Panel administratora - zarządzanie slotami</h2>
  
      {error && <p style={{ color: 'red' }}>{error}</p>}
  
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
        <label>
          Kategoria:
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="">-- wybierz --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </label>
  
        <label>
          Start:
          <input
            type="datetime-local"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
          />
        </label>
  
        <label>
          Koniec:
          <input
            type="datetime-local"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
          />
        </label>
  
        <button type="submit" className="primary">{form.id ? 'Zapisz zmiany' : 'Dodaj slot'}</button>
        {form.id && <button type="button" onClick={resetForm} className="cancel" style={{ marginLeft: '1rem' }}>Anuluj</button>}
      </form>
  
      <h3>Lista slotów</h3>
      <ul>
        {slots.map(slot => (
          <li key={slot.id}>
            <div>
              <strong>{slot.category.name}</strong> | {new Date(slot.start_time).toLocaleString()} – {new Date(slot.end_time).toLocaleString()}
            </div>
            <div className="slot-actions">
              <button onClick={() => handleEdit(slot)}>Edytuj</button>
              <button onClick={() => handleDelete(slot.id)} style={{ marginLeft: '0.5rem' }}>Usuń</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );  
}

export default AdminSlots;
