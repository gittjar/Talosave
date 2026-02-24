import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../configuration/config';
import { useAuth } from '../contexts/AuthContext.jsx';

const Huoltokirja = ({ propertyId: propPropertyId }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteInput, setNoteInput] = useState({});
  const currentYear = new Date().getFullYear();
  const [newEntry, setNewEntry] = useState({
    task_name: '',
    description: '',
    recommended_frequency: '',
    note: '',
    is_recurring: false,
    recurring_months: [],
    year: currentYear
  });
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editEntry, setEditEntry] = useState({ task_name: '', description: '', recommended_frequency: '' });
      const handleEditClick = (entry) => {
        setEditId(entry.id);
        setEditEntry({
          task_name: entry.task_name,
          description: entry.description,
          recommended_frequency: entry.recommended_frequency
        });
      };

      const handleEditSave = async (entryId) => {
        try {
          await axios.put(`${config.apiUrl}/maintenance/entries/${entryId}`, {
            task_name: editEntry.task_name,
            description: editEntry.description,
            recommended_frequency: editEntry.recommended_frequency
          });
          const entriesRes = await axios.get(`${config.apiUrl}/maintenance/entries/${propertyId}`);
          setEntries(entriesRes.data);
          setEditId(null);
        } catch (err) {
          // handle error
        }
      };

      const handleEditCancel = () => {
        setEditId(null);
      };
    const handleAddEntry = async (e) => {
      e.preventDefault();
      setAdding(true);
      try {
        await axios.post(`${config.apiUrl}/maintenance/entries`, {
          propertyid: propertyId,
          task_name: newEntry.task_name,
          description: newEntry.description,
          recommended_frequency: newEntry.recommended_frequency,
          note: newEntry.note,
          user_id: user?.userid,
          is_recurring: newEntry.is_recurring,
          recurring_months: newEntry.recurring_months.join(','),
          year: newEntry.year
        });
        setNewEntry({ task_name: '', description: '', recommended_frequency: '', note: '', is_recurring: false, recurring_months: [], year: currentYear });
        const entriesRes = await axios.get(`${config.apiUrl}/maintenance/entries/${propertyId}`);
        setEntries(entriesRes.data);
      } catch (err) {
        // handle error
      }
      setAdding(false);
    };

    const handleDeleteEntry = async (entryId) => {
      if (!window.confirm('Poistetaanko tämä huolto/tehtävä?')) return;
      try {
        await axios.delete(`${config.apiUrl}/maintenance/entries/${entryId}`);
        const entriesRes = await axios.get(`${config.apiUrl}/maintenance/entries/${propertyId}`);
        setEntries(entriesRes.data);
      } catch (err) {
        // handle error
      }
    };
  const { user } = useAuth();
  const propertyId = propPropertyId || user?.propertyid;

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const entriesRes = await axios.get(`${config.apiUrl}/maintenance/entries/${propertyId}`);
        setEntries(entriesRes.data);
      } catch (err) {
        // handle error
      }
      setLoading(false);
    };
    fetchData();
  }, [user, propertyId]);

  const handleCheck = async (entryId) => {
    try {
      await axios.put(`${config.apiUrl}/maintenance/entries/${entryId}`, {
        done: true,
        done_date: new Date().toISOString().slice(0, 10),
        note: noteInput[entryId] || ''
      });
      const entriesRes = await axios.get(`${config.apiUrl}/maintenance/entries/${propertyId}`);
      setEntries(entriesRes.data);
      setNoteInput({ ...noteInput, [entryId]: '' });
    } catch (err) {
      // handle error
    }
  };

  const handleUncheck = async (entryId) => {
    try {
      await axios.put(`${config.apiUrl}/maintenance/entries/${entryId}`, {
        done: false,
        done_date: null,
        note: noteInput[entryId] || ''
      });
      const entriesRes = await axios.get(`${config.apiUrl}/maintenance/entries/${propertyId}`);
      setEntries(entriesRes.data);
    } catch (err) {
      // handle error
    }
  };

  const isChecked = (entry) => {
    return !!entry.done;
  };

  if (!propertyId) return <div>Valitse kiinteistö nähdäksesi huoltokirjan.</div>;
  if (loading) return <div>Ladataan...</div>;

  return (
    <div>
      <h2>Huoltokirja</h2>
      <form onSubmit={handleAddEntry} style={{ marginBottom: '2em', background: '#f8f9fa', padding: '1em', borderRadius: '8px' }}>
        <h4>Lisää uusi huolto/tehtävä</h4>
        <input
          type="text"
          placeholder="Tehtävän nimi"
          value={newEntry.task_name}
          onChange={e => setNewEntry({ ...newEntry, task_name: e.target.value })}
          required
          style={{ marginBottom: '0.5em', width: '100%' }}
        />
        <input
          type="text"
          placeholder="Kuvaus"
          value={newEntry.description}
          onChange={e => setNewEntry({ ...newEntry, description: e.target.value })}
          style={{ marginBottom: '0.5em', width: '100%' }}
        />
        <input
          type="text"
          placeholder="Suositeltu taajuus (esim. vuosittain, kevät, ... )"
          value={newEntry.recommended_frequency}
          onChange={e => setNewEntry({ ...newEntry, recommended_frequency: e.target.value })}
          style={{ marginBottom: '0.5em', width: '100%' }}
        />
        <input
          type="text"
          placeholder="Huomio (valinnainen)"
          value={newEntry.note}
          onChange={e => setNewEntry({ ...newEntry, note: e.target.value })}
          style={{ marginBottom: '0.5em', width: '100%' }}
        />
        <div style={{ marginBottom: '0.5em' }}>
          <label>
            <input
              type="checkbox"
              checked={newEntry.is_recurring}
              onChange={e => setNewEntry({ ...newEntry, is_recurring: e.target.checked })}
              style={{ marginRight: '0.5em' }}
            />
            Toistuva vuosittain
          </label>
        </div>
        <div style={{ marginBottom: '0.5em' }}>
          <span>Vuosi: </span>
          <input
            type="number"
            min={currentYear}
            value={newEntry.year}
            onChange={e => setNewEntry({ ...newEntry, year: parseInt(e.target.value) })}
            style={{ width: '90px', marginLeft: '0.5em' }}
          />
        </div>
        <div style={{ marginBottom: '0.5em' }}>
          <span>Kuukaudet: </span>
          {[...Array(12)].map((_, i) => (
            <label key={i} style={{ marginRight: '0.5em' }}>
              <input
                type="checkbox"
                checked={newEntry.recurring_months.includes(i + 1)}
                onChange={e => {
                  const months = newEntry.recurring_months.includes(i + 1)
                    ? newEntry.recurring_months.filter(m => m !== i + 1)
                    : [...newEntry.recurring_months, i + 1];
                  setNewEntry({ ...newEntry, recurring_months: months });
                }}
              />
              {i + 1}
            </label>
          ))}
        </div>
        <button type="submit" disabled={adding} style={{ marginTop: '0.5em' }}>Lisää huolto</button>
      </form>
      <ul>
        {entries.map(entry => {
          const checked = isChecked(entry);
          return (
            <li key={entry.id} style={{ marginBottom: '1em', borderBottom: '1px solid #eee', paddingBottom: '1em' }}>
              {editId === entry.id ? (
                <div style={{ marginBottom: '0.5em' }}>
                  <input
                    type="text"
                    value={editEntry.task_name}
                    onChange={e => setEditEntry({ ...editEntry, task_name: e.target.value })}
                    style={{ marginBottom: '0.5em', width: '100%' }}
                  />
                  <input
                    type="text"
                    value={editEntry.description}
                    onChange={e => setEditEntry({ ...editEntry, description: e.target.value })}
                    style={{ marginBottom: '0.5em', width: '100%' }}
                  />
                  <input
                    type="text"
                    value={editEntry.recommended_frequency}
                    onChange={e => setEditEntry({ ...editEntry, recommended_frequency: e.target.value })}
                    style={{ marginBottom: '0.5em', width: '100%' }}
                  />
                  <button onClick={() => handleEditSave(entry.id)} style={{ marginRight: '0.5em' }}>Tallenna</button>
                  <button onClick={handleEditCancel}>Peruuta</button>
                </div>
              ) : (
                <>
                  <label>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => checked ? handleUncheck(entry.id) : handleCheck(entry.id)}
                    />
                    {entry.task_name} <span style={{ color: '#888' }}>{entry.recommended_frequency}</span>
                  </label>
                  <div style={{ fontSize: '0.9em', color: '#555' }}>{entry.description}</div>
                  <button onClick={() => handleEditClick(entry)} style={{ marginTop: '0.5em', marginRight: '0.5em' }}>Muokkaa</button>
                </>
              )}
              {!checked && (
                <input
                  type="text"
                  placeholder="Lisää huomio..."
                  value={noteInput[entry.id] || ''}
                  onChange={e => setNoteInput({ ...noteInput, [entry.id]: e.target.value })}
                  style={{ marginTop: '0.5em', width: '100%' }}
                />
              )}
              {checked && (
                <div style={{ fontSize: '0.9em', color: '#007bff', marginTop: '0.5em' }}>
                  Huomio: {entry.note || '-'}
                </div>
              )}
              <button onClick={() => handleDeleteEntry(entry.id)} style={{ marginTop: '0.5em', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', padding: '0.3em 0.8em', cursor: 'pointer' }}>Poista</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Huoltokirja;
