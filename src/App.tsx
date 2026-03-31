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
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="vendors" element={<VendorsPage />} />
        <Route path="services" element={<ServicesAdminPage />} />
        <Route path="bookings" element={<BookingsPage />} />
      </Route>
    </Routes>
  )
}

export default App