import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { groupSlotsByDay, formatFullDate } from './helpers';

function AdminView({ isAdmin }) {
  const [slots, setSlots] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    id: null,
    category: '',
    start_time: '',
    end_time: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState({});

  useEffect(() => {
    if (!isAdmin) return;
    fetchSlots();
    fetchCategories();
    fetchUsers();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchSlots();
  }, [weekOffset]);

  const formRef = useRef(null);

  const fetchSlots = () => {
    setLoading(true);
    axios
      .get(`/api/slots/?week=${weekOffset}`)
      .then(res => {
        setSlots(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const fetchCategories = () => {
    axios.get('/api/categories/').then(res => setCategories(res.data));
  };

  const fetchUsers = () => {
    axios.get('/api/users/').then(res => setUsers(res.data));
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm({ id: null, category: '', start_time: '', end_time: '' });
    setError('');
  };

  const handleSubmit = e => {
    e.preventDefault();
    setError('');

    if (!form.category || !form.start_time || !form.end_time) {
      setError('Please fill out all fields.');
      return;
    }

    const data = {
      category_id: form.category,
      start_time: form.start_time,
      end_time: form.end_time,
    };

    if (form.id) {
      axios
        .patch(`/api/slots/${form.id}/`, data)
        .then(() => {
          fetchSlots();
          resetForm();
        })
        .catch(() => setError('Error updating slot.'));
    } else {
      axios
        .post('/api/slots/', data)
        .then(() => {
          fetchSlots();
          resetForm();
        })
        .catch(() => setError('Error creating slot.'));
    }
  };

  const handleEdit = slot => {
    setForm({
      id: slot.id,
      category: slot.category.id,
      start_time: slot.start_time.slice(0, 16),
      end_time: slot.end_time.slice(0, 16),
    });
    setError('');
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDelete = id => {
    if (!window.confirm('Are you sure you want to delete this slot?')) return;
    axios.delete(`/api/slots/${id}/`).then(fetchSlots).catch(() => setError('Error deleting slot.'));
  };

  const handleUserSelectChange = (slotId, userId) => {
    setSelectedUsers(prev => ({ ...prev, [slotId]: userId }));
  };

  const handleAssignUser = (slotId) => {
    const userId = selectedUsers[slotId];

    if (!userId) {
      setError('Select a user to assign.');
      return;
    }

    axios
      .patch(`/api/slots/${slotId}/`, { user_id: userId })
      .then(() => {
        fetchSlots();
        setSelectedUsers(prev => ({ ...prev, [slotId]: '' }));
        setError('');
      })
      .catch(() => setError('Error assigning user.'));
  };

  const handleUnassignUser = slotId => {
    axios
      .patch(`/api/slots/${slotId}/`, { user_id: null })
      .then(fetchSlots)
      .catch(() => setError('Error unassigning user.'));
  };

  if (!isAdmin) return <p>Access denied.</p>;
  if (loading) return <p>Loading...</p>;

  return (
    <div className="section">
      <h2>Admin Panel - Slot Management</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit} ref={formRef} style={{ marginBottom: '2rem' }}>
        <label>
          Category:
          <select name="category" value={form.category} onChange={handleChange}>
            <option value="">-- select --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </label>

        <label>
          Start:
          <input type="datetime-local" name="start_time" value={form.start_time} onChange={handleChange} />
        </label>

        <label>
          End:
          <input type="datetime-local" name="end_time" value={form.end_time} onChange={handleChange} />
        </label>

        <button type="submit" className="primary">
          {form.id ? 'Save changes' : 'Add slot'}
        </button>
        {form.id && (
          <button type="button" onClick={resetForm} className="cancel" style={{ marginLeft: '1rem' }}>
            Cancel
          </button>
        )}
      </form>

      <h3>Slot Calendar</h3>

      <div style={{ margin: '1rem 0' }}>
        <button onClick={() => setWeekOffset(weekOffset - 1)}>← Previous week</button>
        <button onClick={() => setWeekOffset(weekOffset + 1)}>Next week →</button>
      </div>

      {groupSlotsByDay(slots, weekOffset).map(day => (
        <div
          key={day.date.toISOString()}
          style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '0.5rem', borderRadius: '8px' }}
        >
          <h3>{day.date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
          {day.slots.length === 0 ? (
            <p>No slots</p>
          ) : (
            <ul>
              {day.slots.map(slot => {
                const backgroundColor = slot.user ? '#4D8A4F' : '';
                return (
                  <li
                    key={slot.id}
                    style={{
                      backgroundColor,
                      padding: '0.5rem',
                      borderRadius: '4px',
                      marginBottom: '0.25rem',
                      color: slot.user ? 'white' : 'inherit',
                    }}
                  >
                    <strong>{slot.category.name}</strong> {formatFullDate(slot.start_time)} – {formatFullDate(slot.end_time)}
                    <br />
                    {slot.user ? (
                      <>
                        <p><em>User: {slot.user}</em></p>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button type="button" onClick={() => handleUnassignUser(slot.id)}>Unassign</button>
                          <button type="button" onClick={() => handleEdit(slot)}>Edit</button>
                        </div>
                      </>
                    ) : (
                      <>
                        <select
                          value={selectedUsers[slot.id] || ''}
                          onChange={e => handleUserSelectChange(slot.id, e.target.value)}
                        >
                          <option value="">-- select user --</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>{user.username}</option>
                          ))}
                        </select>
                        <div style={{ display: 'inline-flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <button type="button" onClick={() => handleAssignUser(slot.id)} disabled={!selectedUsers[slot.id]}>
                            Assign
                          </button>
                          <button type="button" onClick={() => handleEdit(slot)}>Edit</button>
                        </div>
                      </>
                    )}
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

export default AdminView;