import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../configuration/config';
import { useAuth } from '../contexts/AuthContext.jsx';

const Huoltokirja = ({ propertyId: propPropertyId }) => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteInput, setNoteInput] = useState({});
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
      <ul>
        {entries.map(entry => {
          const checked = isChecked(entry);
          return (
            <li key={entry.id} style={{ marginBottom: '1em' }}>
              <label>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => checked ? handleUncheck(entry.id) : handleCheck(entry.id)}
                />
                {entry.task_name} <span style={{ color: '#888' }}>{entry.recommended_frequency}</span>
              </label>
              <div style={{ fontSize: '0.9em', color: '#555' }}>{entry.description}</div>
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
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Huoltokirja;
