import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import HealthcareServicesPage from './pages/HealthcareServicesPage'
import ResearchServicesPage from './pages/ResearchServicesPage'
import TrainingPlacementPage from './pages/TrainingPlacementPage'
import ResearchPage from './pages/ResearchPage'
import BlogPage from './pages/BlogPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import AdminLayout from './components/AdminLayout'
import ProtectedRoute from './components/ProtectedRoute'
import DashboardPage from './pages/admin/DashboardPage'
import UsersPage from './pages/admin/UsersPage'
import VendorsPage from './pages/admin/VendorsPage'
import ServicesAdminPage from './pages/admin/ServicesPage'
import BookingsPage from './pages/admin/BookingsPage'
import PrescriptionsPage from './pages/admin/PrescriptionsPage'
import ReportsPage from './pages/admin/ReportsPage'
import LabPartnersPage from './pages/admin/LabPartnersPage'
import InsuranceClaimsPage from './pages/admin/InsuranceClaimsPage'
import FAQsPage from './pages/admin/FAQsPage'
import StaffPage from './pages/admin/StaffPage'
import CouponsPage from './pages/admin/CouponsPage'
import PermissionGuard from './components/PermissionGuard'

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      
      <Route path="/" element={
        <div className="min-h-screen bg-white">
          <Navigation />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/services/healthcare" element={<HealthcareServicesPage />} />
            <Route path="/services/research" element={<ResearchServicesPage />} />
            <Route path="/services/training" element={<TrainingPlacementPage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
          <Footer />
        </div>
      } />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin={true}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<PermissionGuard permission="dashboard"><DashboardPage /></PermissionGuard>} />
        <Route path="users" element={<PermissionGuard permission="users"><UsersPage /></PermissionGuard>} />
        <Route path="vendors" element={<PermissionGuard permission="vendors"><VendorsPage /></PermissionGuard>} />
        <Route path="services" element={<PermissionGuard permission="services"><ServicesAdminPage /></PermissionGuard>} />
        <Route path="bookings" element={<PermissionGuard permission="bookings"><BookingsPage /></PermissionGuard>} />
        <Route path="prescriptions" element={<PermissionGuard permission="prescriptions"><PrescriptionsPage /></PermissionGuard>} />
        <Route path="reports" element={<PermissionGuard permission="reports"><ReportsPage /></PermissionGuard>} />
        <Route path="lab-partners" element={<PermissionGuard permission="labPartners"><LabPartnersPage /></PermissionGuard>} />
        <Route path="insurance-claims" element={<PermissionGuard permission="insuranceClaims"><InsuranceClaimsPage /></PermissionGuard>} />
        <Route path="faqs" element={<PermissionGuard permission="faqs"><FAQsPage /></PermissionGuard>} />
        <Route path="coupons" element={<PermissionGuard permission="coupons"><CouponsPage /></PermissionGuard>} />
        <Route path="staff" element={<PermissionGuard permission="staff"><StaffPage /></PermissionGuard>} />
      </Route>
    </Routes>
  )
}

export default App