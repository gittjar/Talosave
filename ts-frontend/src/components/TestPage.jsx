import { useHistory } from 'react-router-dom';

const TestPage = () => {
  const token = localStorage.getItem('userToken');
  const history = useHistory();

  if (!token) {
    history.push('/login');
    return null;
  }

  return (
    <div>
      <h2>Welcome! logged in!</h2>
    </div>
  );
};

export default TestPage;