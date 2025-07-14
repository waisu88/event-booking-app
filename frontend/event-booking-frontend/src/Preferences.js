// Preferences.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Preferences.css';

function Preferences({ selectedIds, setSelectedIds }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/categories/')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));

    axios.get('/api/preferences/')
      .then(res => {
        const ids = res.data.categories.map(cat => cat.id);
        setSelectedIds(ids); // Ustawiamy globalnie
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [setSelectedIds]);

  const toggleCategory = (id) => {
    const newSelected = selectedIds.includes(id)
      ? selectedIds.filter(i => i !== id)
      : [...selectedIds, id];

    setSelectedIds(newSelected);

    axios.patch('/api/preferences/', {
      categories_ids: newSelected
    }).then(() => {
      console.log('Zapisano preferencje!');
    }).catch(err => {
      alert('Błąd zapisu preferencji.');
      console.error(err);
    });
  };

  if (loading) return <p>Ładowanie preferencji...</p>;

  return (
    <div className="preferences-container section">
      <h2>Twoje preferencje wydarzeń</h2>
      <ul className="preferences-list">
        {categories.map(cat => (
          <li
            key={cat.id}
            className={`preference-item ${selectedIds.includes(cat.id) ? 'selected' : ''}`}
            onClick={() => toggleCategory(cat.id)}
            style={{ cursor: 'pointer', userSelect: 'none', padding: '0.5rem' }}
          >
            {cat.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Preferences;
