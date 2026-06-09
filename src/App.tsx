import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import HealthcareServicesPage from './pages/HealthcareServicesPage'
import ResearchServicesPage from './pages/ResearchServicesPage'
import TrainingPlacementPage from './pages/TrainingPlacementPage'
import ResearchPage from './pages/ResearchPage'
import BlogPage from './pages/BlogPage'
import BlogDetailPage from './pages/BlogDetailPage'
import ContactPage from './pages/ContactPage'
import LoginPage from './pages/LoginPage'
import Navigation from './components/Navigation'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
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
import SupportTicketsPage from './pages/admin/SupportTicketsPage'
import ContactInquiriesPage from './pages/admin/ContactInquiriesPage'
import AdvertisementsPage from './pages/admin/AdvertisementsPage'
import JobsPage from './pages/admin/JobsPage'
import JobApplicationsPage from './pages/admin/JobApplicationsPage'
import BlogsPage from './pages/admin/BlogsPage'
import SettingsPage from './pages/admin/SettingsPage'
import SupportPage from './pages/SupportPage'
import PermissionGuard from './components/PermissionGuard'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsPage from './pages/TermsPage'

// Layout wrapper for public pages
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-white">
    <Navigation />
    {children}
    <Footer />
  </div>
)

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Public Routes with Navigation and Footer */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><AboutPage /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
        <Route path="/services/healthcare" element={<PublicLayout><HealthcareServicesPage /></PublicLayout>} />
        <Route path="/services/research" element={<PublicLayout><ResearchServicesPage /></PublicLayout>} />
        <Route path="/services/training" element={<PublicLayout><TrainingPlacementPage /></PublicLayout>} />
        <Route path="/research" element={<PublicLayout><ResearchPage /></PublicLayout>} />
        <Route path="/blog" element={<PublicLayout><BlogPage /></PublicLayout>} />
        <Route path="/blog/:slug" element={<PublicLayout><BlogDetailPage /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
        <Route path="/support" element={<PublicLayout><SupportPage /></PublicLayout>} />
        <Route path="/privacy" element={<PublicLayout><PrivacyPolicyPage /></PublicLayout>} />
        <Route path="/terms" element={<PublicLayout><TermsPage /></PublicLayout>} />

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
          <Route path="support-tickets" element={<PermissionGuard permission="supportTickets"><SupportTicketsPage /></PermissionGuard>} />
          <Route path="contact-inquiries" element={<PermissionGuard permission="contactInquiries"><ContactInquiriesPage /></PermissionGuard>} />
          <Route path="advertisements" element={<PermissionGuard permission="advertisements"><AdvertisementsPage /></PermissionGuard>} />
          <Route path="jobs" element={<PermissionGuard permission="dashboard"><JobsPage /></PermissionGuard>} />
          <Route path="job-applications" element={<PermissionGuard permission="dashboard"><JobApplicationsPage /></PermissionGuard>} />
          <Route path="job-applications/:jobId" element={<PermissionGuard permission="dashboard"><JobApplicationsPage /></PermissionGuard>} />
          <Route path="blogs" element={<PermissionGuard permission="dashboard"><BlogsPage /></PermissionGuard>} />
          <Route path="settings" element={<PermissionGuard permission="dashboard"><SettingsPage /></PermissionGuard>} />
        </Route>
      </Routes>
    </>
  )
}

export default App