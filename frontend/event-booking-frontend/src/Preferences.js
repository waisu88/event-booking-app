import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Preferences.css';

function Preferences() {
  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/categories/')
      .then(res => setCategories(res.data))
      .catch(err => console.error(err));

    axios.get('http://127.0.0.1:8000/api/preferences/')
      .then(res => {
        const ids = res.data.categories.map(cat => cat.id);
        setSelectedIds(ids);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const toggleCategory = (id) => {
    let newSelected;
    if (selectedIds.includes(id)) {
      // Usuwamy kategorię z wybranych
      newSelected = selectedIds.filter(i => i !== id);
    } else {
      // Dodajemy kategorię do wybranych
      newSelected = [...selectedIds, id];
    }

    // Aktualizujemy lokalny stan
    setSelectedIds(newSelected);

    // Od razu wysyłamy PATCH do backendu
    axios.patch('http://127.0.0.1:8000/api/preferences/', {
      categories_ids: newSelected
    }).then(() => {
      // Opcjonalnie możesz dać info, np. alert lub toast
      console.log('Zapisano preferencje!');
    }).catch(err => {
      alert('Błąd zapisu preferencji.');
      console.error(err);
    });
  };

  if (loading) return <p>Ładowanie...</p>;

  return (
    <div className="preferences-container section">
      <h2>Twoje preferencje wydarzeń</h2>
      <ul className="preferences-list">
        {categories.map(cat => (
          <li 
            key={cat.id} 
            className={`preference-item ${selectedIds.includes(cat.id) ? 'selected' : ''}`}
            onClick={() => toggleCategory(cat.id)}
            style={{cursor: 'pointer', userSelect: 'none', padding: '0.5rem'}}
          >
            {cat.name}
          </li>
        ))}
      </ul>
      {/* Usuwamy przycisk "Zapisz" */}
    </div>
  );
}

export default Preferences;
