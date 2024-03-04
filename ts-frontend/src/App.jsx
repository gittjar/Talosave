import { PropertyProvider } from './hooks/PropertyProvider.jsx';
import { ElectricityConsumptionProvider } from './hooks/ElectricityConsumptionProvider.jsx';
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
import ConsumptionDetails from './components/ConsumptionDetails.jsx';
import ShowElectricityConsumption from './consumptions/ShowElectricityConsumption';



function App() {
  return (
   
 <>
    <Toast />
    <Router>
        <NavBar />
        <section className="main">
        <PropertyProvider>
              <ElectricityConsumptionProvider>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
                  <Route path="/home" element={<HomePage />} />
                  <Route path="/create-user" element={<CreateUser />} />
                  <Route path="/add-property" element={<AddPropertyForm />} />
                  <Route path="/properties/:id" element={<PropertyDetails />} />
                  <Route path="/consumptions/:id" element={<ConsumptionDetails />} />
                  <Route path="/electricity/:id" element={<ShowElectricityConsumption />} />
                  <Route path="/" element={<HomePage />} />
                  <Route path="*" element={<LoginPage />} />
                </Routes>
              </ElectricityConsumptionProvider>
            </PropertyProvider>
        </section>
      </Router>
   </>
  );
}

export default App;