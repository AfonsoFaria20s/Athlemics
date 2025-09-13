import './i18n'; // Isto inicializa o sistema de idiomas
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import DashBoard from './pages/DashBoard'
import Conta from './pages/Conta'
import Navbar from './components/Navbar'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Navbar/>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path='/' element={<DashBoard/>} />
      <Route path='/dashboard' element={<DashBoard/>} />
      {/*
      <Route path='/horario' element={<Horario/>} />
      <Route path='/metas' element={<Metas/>} />
      */}
      <Route path='/conta' element={<Conta/>} />
    </Routes>
  </BrowserRouter>
)
