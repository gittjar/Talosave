import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { PropertyProvider } from './hooks/PropertyProvider.jsx';
import NavBar from './components/Navbar';
import Toast from './notifications/Toast.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import '../src/assets/styles.css';

// Dynamic imports
const LoginPage = lazy(() => import('./components/LoginPage'));
const MyPage = lazy(() => import('./components/MyPage'));
const HomePage = lazy(() => import('./components/HomePage'));
const AddPropertyForm = lazy(() => import('./forms/AddPropertyForm.jsx'));
const PropertyDetails = lazy(() => import('./components/PropertyDetails'));
const CreateUser = lazy(() => import('./components/CreateUser'));
const ConsumptionDetails = lazy(() => import('./components/ConsumptionDetails.jsx'));
const ShowElectricityConsumption = lazy(() => import('./consumptions/ShowElectricityConsumption'));
const ResearchPage = lazy(() => import('./components/ResearchPage'));
const UserSettings = lazy(() => import('./components/UserSettings.jsx'));
const ProgramInfoPage = lazy(() => import('./components/ProgramInfoPage.jsx'));
const DataProtection = lazy(() => import('./components/DataProtection.jsx'));
const ElectricityPrice = lazy(() => import('./components/ElectricityPrice.jsx'));

function App() {
  return (
    <>
      <Toast />
      <Router>
        <NavBar />
        <section className="main">
          <PropertyProvider>
            <Suspense fallback={<div>Loading...</div>}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/mypage" element={<PrivateRoute><MyPage /></PrivateRoute>} />
                <Route path="/usersettings" element={<PrivateRoute><UserSettings /></PrivateRoute>} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/create-user" element={<CreateUser />} />
                <Route path="/add-property" element={<AddPropertyForm />} />
                <Route path="/properties/:id" element={<PropertyDetails />} />
                <Route path="/consumptions/:id" element={<ConsumptionDetails />} />
                <Route path="/electricity/:id" element={<ShowElectricityConsumption />} />
                <Route path="/research" element={<ResearchPage />} />
                <Route path="/program-info" element={<ProgramInfoPage />} />
                <Route path="/data-protection" element={<DataProtection />} />
                <Route path="/electricity-price" element={<ElectricityPrice />} />
                <Route path="/" element={<HomePage />} />
                <Route path="*" element={<LoginPage />} />
              </Routes>
            </Suspense>
          </PropertyProvider>
        </section>
      </Router>
    </>
  );
}

export default App;