import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import RoleSelect from './pages/RoleSelect'
import Portal from './pages/Portal'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/portal/:role" element={<Portal />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
