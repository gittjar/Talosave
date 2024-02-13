


const TestPage = () => {
  const token = localStorage.getItem('userToken');

  if (!token) {
    return <h2>Please log in to view this page.</h2>;
  }

  return (
    <div>
      <h2>Welcome, youre logged in!</h2>
    </div>
  );
};

export default TestPage;