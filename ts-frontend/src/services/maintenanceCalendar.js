import axios from 'axios';
import config from '../configuration/config';

const API_URL = config.apiUrl + '/maintenancecalendar';

// Hae kaikki vuosihuoltokalenterin rivit (propertyid, userid, year)
export const fetchMaintenanceCalendar = async (propertyid, userid, year) => {
  const params = { propertyid, userid };
  if (year) params.year = year;
  const res = await axios.get(API_URL, { params });
  return res.data;
};

// Lisää uusi rivi (myös omat rivit)
export const addMaintenanceCalendarEntry = async (entry) => {
  const res = await axios.post(API_URL, entry);
  return res.data;
};

// Päivitä rivi (esim. rastitus, tekstin muutos)
export const updateMaintenanceCalendarEntry = async (id, update) => {
  const res = await axios.put(`${API_URL}/${id}`, update);
  return res.data;
};

// Poista rivi
export const deleteMaintenanceCalendarEntry = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
