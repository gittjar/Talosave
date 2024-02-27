import { PropertyProvider } from './hooks/PropertyProvider.jsx';
import NavBar from './components/Navbar';
import LoginPage  from './components/LoginPage'
import MyPage from './components/MyPage';
import HomePage from './components/HomePage';
import AddPropertyForm from './forms/AddPropertyForm.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import PropertyDetails from './components/PropertyDetails';
import CreateUser from './components/CreateUser'; // Import the CreateUser component
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Toast from './notifications/Toast.jsx';

function App() {
  return (
   
 <>
    <Toast />
    <Router>
    <NavBar />
    <section className="main">
      <PropertyProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/create-user" element={<CreateUser />} />
          <Route path="/add-property" element={<AddPropertyForm />} />
          <Route path="/properties/:id" element={<PropertyDetails />} />
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </PropertyProvider>
    </section>
    </Router>
   </>
  );
}

export default App;