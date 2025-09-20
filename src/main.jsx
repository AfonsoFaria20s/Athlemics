import './i18n';
import './index.css';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';

import DashBoard from './components/Dashboard/DashBoard';
import Account from './components/Account/Account';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home/Home';

import PrivateRoute from './routes/PrivateRoute';
import PublicRoute from './routes/PublicRoute';
import Health from './components/Health/Health';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />

        <Route path="/home" element={
          <PublicRoute>
            <Home />
          </PublicRoute>
        } />

        <Route path="/dashboard" element={
          <PrivateRoute>
            <Navbar />
            <DashBoard />
          </PrivateRoute>
        } />

        <Route path="/account" element={
          <PrivateRoute>
            <Navbar />
            <Account />
          </PrivateRoute>
        } />
        <Route path="/" element={
          <PrivateRoute>
            <Navbar/>
            <Health/>
          </PrivateRoute>
        }
        />
      </Routes>
      <Footer />
    </BrowserRouter>
  </AuthProvider>
);
