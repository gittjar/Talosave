import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../configuration/config';
import { useAuth } from '../contexts/AuthContext.jsx';

const Huoltokirja = () => {
  const [tasks, setTasks] = useState([]);
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteInput, setNoteInput] = useState({});
  const { user } = useAuth();
  const propertyId = user?.propertyid;

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const tasksRes = await axios.get(`${config.apiUrl}/maintenance/tasks`);
        const checksRes = await axios.get(`${config.apiUrl}/maintenance/checks`, {
            params: { propertyid: propertyId, user_id: user.userid }
          });
        setTasks(tasksRes.data);
        setChecks(checksRes.data);
      } catch (err) {
        // handle error
      }
      setLoading(false);
    };
    fetchData();
  }, [user, propertyId]);

  const handleCheck = async (taskId) => {
      try {
        await axios.post('/api/maintenance/checks', {
          task_id: taskId,
          propertyid: propertyId,
          user_id: user.userid,
          check_date: new Date().toISOString().slice(0, 10),
          year: new Date().getFullYear(),
          period: '',
          note: noteInput[taskId] || ''
        });
        await axios.post(`${config.apiUrl}/maintenance/checks`, {
          task_id: taskId,
          propertyid: propertyId,
          user_id: user.userid,
          check_date: new Date().toISOString().slice(0, 10),
          year: new Date().getFullYear(),
          period: '',
          note: noteInput[taskId] || ''
        });
        const checksRes = await axios.get(`${config.apiUrl}/maintenance/checks`, {
          params: { propertyid: propertyId, user_id: user.userid }
        });
          setChecks(checksRes.data);
        setNoteInput({ ...noteInput, [taskId]: '' });
      } catch (err) {
        // handle error
      }
    };

    const handleUncheck = async (taskId) => {
      try {
        const check = checks.find(c => c.task_id === taskId);
        if (!check) return;
          await axios.delete(`${config.apiUrl}/maintenance/checks/${check.id}`);
          const checksRes = await axios.get(`${config.apiUrl}/maintenance/checks`, {
            params: { propertyid: propertyId, user_id: user.userid }
          });
          setChecks(checksRes.data);
      } catch (err) {
        // handle error
      }
    };

  const isChecked = (taskId) => {
    return checks.some(check => check.task_id === taskId);
  };

  if (!user) return <div>Kirjaudu sisään nähdäksesi huoltokirjan.</div>;
  if (loading) return <div>Ladataan...</div>;

  return (
      <div>
        <h2>Huoltokirja</h2>
        <ul>
          {tasks.map(task => {
            const checked = isChecked(task.id);
            return (
              <li key={task.id} style={{ marginBottom: '1em' }}>
                <label>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => checked ? handleUncheck(task.id) : handleCheck(task.id)}
                  />
                  {task.name} <span style={{ color: '#888' }}>{task.recommended_frequency}</span>
                </label>
                <div style={{ fontSize: '0.9em', color: '#555' }}>{task.description}</div>
                {!checked && (
                  <input
                    type="text"
                    placeholder="Lisää huomio..."
                    value={noteInput[task.id] || ''}
                    onChange={e => setNoteInput({ ...noteInput, [task.id]: e.target.value })}
                    style={{ marginTop: '0.5em', width: '100%' }}
                  />
                )}
                {checked && (
                  <div style={{ fontSize: '0.9em', color: '#007bff', marginTop: '0.5em' }}>
                    Huomio: {checks.find(c => c.task_id === task.id)?.note || '-'}
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
