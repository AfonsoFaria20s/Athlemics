import './i18n'; // Isto inicializa o sistema de idiomas
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import DashBoard from './components/Dashboard/DashBoard'
import Account from './components/Account/Account'
import Navbar from './components/Navbar'
import Footer from './components/Footer';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path='/' element={<DashBoard/>} />
      <Route path='/dashboard' element={<DashBoard/>} />
      <Route path='/conta' element={<Account/>} />
    </Routes>
    <Footer/>
  </BrowserRouter>
)
