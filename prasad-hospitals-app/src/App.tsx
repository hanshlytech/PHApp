// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { BranchProvider, useBranch } from './context/BranchContext'
import { VipWizardProvider } from './context/VipWizardContext'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import BookingFlow from './pages/BookingFlow'
import ReviewFlow from './pages/ReviewFlow'
import VipLogin from './pages/vip/VipLogin'
import ScanStep from './pages/vip/ScanStep'
import MemberStep from './pages/vip/MemberStep'
import ServiceStep from './pages/vip/ServiceStep'
import ConfirmStep from './pages/vip/ConfirmStep'
import AdminLogin from './pages/admin/AdminLogin'
import CardsList from './pages/admin/CardsList'
import CreateCard from './pages/admin/CreateCard'
import CardDetail from './pages/admin/CardDetail'

function RequireBranch({ children }: { children: React.ReactNode }) {
  const { branch } = useBranch()
  if (!branch) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/home"
        element={
          <RequireBranch>
            <HomePage />
          </RequireBranch>
        }
      />
      <Route
        path="/book"
        element={
          <RequireBranch>
            <BookingFlow />
          </RequireBranch>
        }
      />
      <Route
        path="/review"
        element={
          <RequireBranch>
            <ReviewFlow />
          </RequireBranch>
        }
      />
      <Route
        path="/vip"
        element={
          <VipWizardProvider>
            <Outlet />
          </VipWizardProvider>
        }
      >
        <Route path="login" element={<VipLogin />} />
        <Route path="scan" element={<ScanStep />} />
        <Route path="member" element={<MemberStep />} />
        <Route path="service" element={<ServiceStep />} />
        <Route path="confirm" element={<ConfirmStep />} />
      </Route>
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/cards" element={<CardsList />} />
      <Route path="/admin/cards/new" element={<CreateCard />} />
      <Route path="/admin/cards/:id" element={<CardDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <BranchProvider>
        <AppRoutes />
      </BranchProvider>
    </BrowserRouter>
  )
}
