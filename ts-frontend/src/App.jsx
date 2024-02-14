import LoginPage  from './components/LoginPage'
import TestPage from './components/TestPage';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
        {/* other routes... */}
      </Routes>
    </Router>
  );
}

export default App;