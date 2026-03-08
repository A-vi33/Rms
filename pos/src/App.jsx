import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import POSPage from './components/pages/POSPage'
import KitchenDisplay from './components/pages/KitchenDisplay'
import BillingPage from './components/pages/BillingPage'

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<POSPage />} />
        <Route path="/kitchen" element={<KitchenDisplay />} />
        <Route path="/billing" element={<BillingPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
