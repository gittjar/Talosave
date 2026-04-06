import React from 'react';
import { toast } from 'react-toastify';

const TaskNameRequiredNotification = () => {
  React.useEffect(() => {
    toast.error('Tehtävän nimi on pakollinen!');
  }, []);
  return null;
};

export default TaskNameRequiredNotification;
