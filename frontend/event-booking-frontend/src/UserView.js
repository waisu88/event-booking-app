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

const formatFullDate = (date) => {
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const weekday = d.toLocaleDateString('pl-PL', { weekday: 'long' });
  const time = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `${day}.${month} (${weekday}) ${time}`;
};

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

function UserView({ categories }) {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [slots, setSlots] = useState([]);
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
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [weekOffset]);

  const fetchSlots = () => {
    setLoading(true);
    let url = `/api/slots/?week=${weekOffset}`;
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
      .then(fetchSlots)
      .catch(console.error);
  };

  const handleUnsubscribe = (id) => {
    axios.post(`/api/slots/${id}/unsubscribe/`)
      .then(fetchSlots)
      .catch(console.error);
  };

  const isHighlighted = (categoryId) =>
    selectedCategories.length === 0 || selectedCategories.includes(categoryId);

  const groupedDays = groupSlotsByDay(slots, weekOffset);

  if (loading) return <p>Ładowanie slotów...</p>;

  return (
    <div>
      <Preferences
        selectedIds={selectedCategories}
        setSelectedIds={setSelectedCategories}
      />

      <h2>Twój kalendarz slotów</h2>

      <div style={{ margin: '1rem 0' }}>
        <button onClick={() => setWeekOffset(weekOffset - 1)}>← Poprzedni tydzień</button>
        <button onClick={() => setWeekOffset(weekOffset + 1)}>Następny tydzień →</button>
      </div>

      {groupedDays.map(day => (
        <div key={day.date.toISOString()} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '0.5rem', borderRadius: '8px' }}>
          <h3>{day.date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          {day.slots.length === 0 ? (
            <p>Brak slotów</p>
          ) : (
            <ul>
              {day.slots.map(slot => {
                let backgroundColor = ''; // domyślnie brak koloru

                if (slot.user === username) {
                  backgroundColor = '#4D8A4F'; // zielony (moje)
                } else if (slot.user) {
                  backgroundColor = '#E15759'; // czerwony (czyjeś)
                } else if (isHighlighted(slot.category?.id || slot.category_id)) {
                  backgroundColor = '#E6E753'; // niebookowane, zgodne z preferencją
                }
                const highlight = isHighlighted(slot.category?.id || slot.category_id);
                return (
                  <li key={slot.id} style={{ backgroundColor, padding: '0.5rem', borderRadius: '4px', marginBottom: '0.25rem' }}>
                    <span>{slot.category.name}</span> {formatFullDate(slot.start_time)} – {formatFullDate(slot.end_time)}
                    <br />
                    {(() => {
                      if (!slot.user) {
                        return <button onClick={() => handleBook(slot.id)}>Zapisz się</button>;
                      }

                      if (slot.user === username) {
                        return <button onClick={() => handleUnsubscribe(slot.id)}>Wypisz się</button>;
                      }

                      return <em>Zajęte</em>;
                    })()}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}


export default UserView;
