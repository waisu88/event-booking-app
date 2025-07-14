import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Upewnij się, że masz zainstalowane: npm install jwt-decode
import Preferences from './Preferences';


function getStartOfWeek(weekOffset = 0) {
  const now = new Date();
  const day = now.getDay(); // 0 niedziela, 1 poniedziałek, itd.
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function groupSlotsByDay(slots, weekOffset) {
  const startOfWeek = getStartOfWeek(weekOffset);
  const days = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(startOfWeek);
    dayDate.setDate(startOfWeek.getDate() + i);
    days.push({
      date: dayDate,
      slots: slots.filter(slot => {
        const slotDate = new Date(slot.start_time);
        return slotDate.toDateString() === dayDate.toDateString();
      })
    });
  }

  return days;
}

function UserView() {
  const [slots, setSlots] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decoded = jwtDecode(token);
      setUserId(decoded.user_id || decoded.sub);
      setUsername(decoded.username || decoded.name);
      console.log(decoded);
    }
  }, []);

  useEffect(() => {
    axios.get('/api/categories/')
      .then(res => setCategories(res.data))
      .catch(console.error);
  }, []);
  

  useEffect(() => {
    fetchSlots();
  }, [selectedCategory, weekOffset]);

  const fetchSlots = () => {
    setLoading(true);
    let url = `/api/slots/?week=${weekOffset}`;
    if (selectedCategory) url += `&category=${selectedCategory}`;

    axios.get(url)
      .then(res => {
        setSlots(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleBook = (id) => {
    axios.post(`/api/slots/${id}/book/`)
      .then(() => fetchSlots())
      .catch(console.error);
  };

  const handleUnsubscribe = (id) => {
    axios.post(`/api/slots/${id}/unsubscribe/`)
      .then(() => fetchSlots())
      .catch(console.error);
  };

  if (loading) return <p>Ładowanie slotów...</p>;
  
  const groupedDays = groupSlotsByDay(slots, weekOffset);

  return (
    <div>
      <Preferences categories={categories} />
      <h2>Twój kalendarz slotów</h2>

      <label>
        Filtruj po kategorii:&nbsp;
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
          <option value="">Wszystkie</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </label>

      <div style={{ margin: '1rem 0' }}>
        <button onClick={() => setWeekOffset(weekOffset - 1)}>← Poprzedni tydzień</button>
        <button onClick={() => setWeekOffset(weekOffset + 1)}>Następny tydzień →</button>
      </div>

      {groupedDays.map(day => (
        <div key={day.date.toISOString()} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '0.5rem', borderRadius: '8px' }}>
          <h3>{day.date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          {day.slots.length === 0 ? <p>Brak slotów</p> : (
            <ul>
              {day.slots.map(slot => (
                <li key={slot.id}>
                  <strong>{slot.category.name}</strong> | {new Date(slot.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} – {new Date(slot.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  <br />
                  {(() => {
                      console.log("Slot user:", slot.user, "| Current username:", username);

                      if (!slot.user) {
                        return <button onClick={() => handleBook(slot.id)}>Zapisz się</button>;
                      }

                      if (slot.user === username) {
                        return <button onClick={() => handleUnsubscribe(slot.id)}>Wypisz się</button>;
                      }

                      return <em>Zajęte</em>;
                    })()}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default UserView;
