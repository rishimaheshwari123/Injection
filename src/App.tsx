import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { dashboardAPI } from "./services/api";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import HealthcareServicesPage from "./pages/HealthcareServicesPage";
import ResearchServicesPage from "./pages/ResearchServicesPage";
import TrainingPlacementPage from "./pages/TrainingPlacementPage";
import ResearchPage from "./pages/ResearchPage";
import BlogPage from "./pages/BlogPage";
import BlogDetailPage from "./pages/BlogDetailPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/admin/DashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import UserDetailsPage from "./pages/admin/UserDetailsPage";
import VendorsPage from "./pages/admin/VendorsPage";
import VendorDetailsPage from "./pages/admin/VendorDetailsPage";
import ServicesAdminPage from "./pages/admin/ServicesPage";
import BookingsPage from "./pages/admin/BookingsPage";
import PrescriptionsPage from "./pages/admin/PrescriptionsPage";
import ReportsPage from "./pages/admin/ReportsPage";
import LabPartnersPage from "./pages/admin/LabPartnersPage";
import InsuranceClaimsPage from "./pages/admin/InsuranceClaimsPage";
import FAQsPage from "./pages/admin/FAQsPage";
import StaffPage from "./pages/admin/StaffPage";
import CouponsPage from "./pages/admin/CouponsPage";
import SupportTicketsPage from "./pages/admin/SupportTicketsPage";
import ContactInquiriesPage from "./pages/admin/ContactInquiriesPage";
import AdvertisementsPage from "./pages/admin/AdvertisementsPage";
import JobsPage from "./pages/admin/JobsPage";
import JobApplicationsPage from "./pages/admin/JobApplicationsPage";
import BlogsPage from "./pages/admin/BlogsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import NotificationsPage from "./pages/admin/NotificationsPage";
import GalleryPage from "./pages/admin/GalleryPage";
import HeroPage from "./pages/admin/HeroPage";
import TeamPage from "./pages/admin/TeamPage";
import SupportPage from "./pages/SupportPage";
import PermissionGuard from "./components/PermissionGuard";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import VendorServiceRequestsPage from "./pages/admin/VendorServiceRequestsPage";
import VendorProfilePage from "./pages/VendorProfilePage";
import AdminVendorIdCardPage from "./pages/admin/AdminVendorIdCardPage";
import BookingDetailPage from "./pages/BookingDetailPage";
import InjectionPage from "./pages/InjectionPage";
import FloatingDownloadButton from "./components/FloatingDownloadButton";
import VendorLayout from "./components/VendorLayout";
import VendorBookingsPage from "./pages/vendor/VendorBookingsPage";
import VendorServicesPage from "./pages/vendor/VendorServicesPage";
import VendorRequestsPage from "./pages/vendor/VendorRequestsPage";
import UserLayout from "./components/UserLayout";
import UserBookingsPage from "./pages/user/UserBookingsPage";
import UserProfilePage from "./pages/user/UserProfilePage";
import UserRegisterPage from "./pages/UserRegisterPage";
import VendorRegisterPage from "./pages/VendorRegisterPage";
import VendorIdCardPage from "./pages/VendorIdCardPage";
import UserIdCardPage from "./pages/UserIdCardPage";
import MyReferralsPage from "./pages/MyReferralsPage";
import AmbassadorRegisterPage from "./pages/AmbassadorRegisterPage";
import AmbassadorLayout from "./components/AmbassadorLayout";
import AmbassadorDashboardPage from "./pages/ambassador/AmbassadorDashboardPage";
import AmbassadorRegisterVendorPage from "./pages/ambassador/AmbassadorRegisterVendorPage";
import MyVendorsPage from "./pages/ambassador/MyVendorsPage";
import WalletPage from "./pages/ambassador/WalletPage";
import AdminAmbassadorsPage from "./pages/admin/AmbassadorsPage";
import AmbassadorDetailsPage from "./pages/admin/AmbassadorDetailsPage";
import AdminWithdrawalsPage from "./pages/admin/WithdrawalsPage";


// Layout wrapper for public pages
const PublicLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-white relative">
    <Navigation />
    {children}
    <Footer />
    <FloatingDownloadButton />
  </div>
);

function App() {
  useEffect(() => {
    const recordVisit = async () => {
      try {
        const visited = sessionStorage.getItem("visitor_counted");
        if (!visited) {
          await dashboardAPI.incrementVisitor();
          sessionStorage.setItem("visitor_counted", "true");
        }
      } catch (err) {
        console.error("Failed to record visit:", err);
      }
    };
    recordVisit();
  }, []);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Navigate to="/register/user" replace />} />
        <Route path="/register/user" element={<UserRegisterPage />} />
        <Route
          path="/register/ambassador"
          element={
            <PublicLayout>
              <AmbassadorRegisterPage />
            </PublicLayout>
          }
        />
        <Route
          path="/vendor/register"
          element={
            <PublicLayout>
              <VendorRegisterPage />
            </PublicLayout>
          }
        />

        {/* Public Routes with Navigation and Footer */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          }
        />
        <Route
          path="/about"
          element={
            <PublicLayout>
              <AboutPage />
            </PublicLayout>
          }
        />
        <Route
          path="/services"
          element={
            <PublicLayout>
              <ServicesPage />
            </PublicLayout>
          }
        />
        <Route
          path="/services/healthcare"
          element={
            <PublicLayout>
              <HealthcareServicesPage />
            </PublicLayout>
          }
        />
        <Route
          path="/services/injection"
          element={
            <PublicLayout>
              <InjectionPage />
            </PublicLayout>
          }
        />
        <Route
          path="/services/research"
          element={
            <PublicLayout>
              <ResearchServicesPage />
            </PublicLayout>
          }
        />
        <Route
          path="/services/training"
          element={
            <PublicLayout>
              <TrainingPlacementPage />
            </PublicLayout>
          }
        />
        <Route
          path="/research"
          element={
            <PublicLayout>
              <ResearchPage />
            </PublicLayout>
          }
        />
        <Route
          path="/blog"
          element={
            <PublicLayout>
              <BlogPage />
            </PublicLayout>
          }
        />
        <Route
          path="/blog/:slug"
          element={
            <PublicLayout>
              <BlogDetailPage />
            </PublicLayout>
          }
        />
        <Route
          path="/contact"
          element={
            <PublicLayout>
              <ContactPage />
            </PublicLayout>
          }
        />
        <Route
          path="/support"
          element={
            <PublicLayout>
              <SupportPage />
            </PublicLayout>
          }
        />
        <Route
          path="/privacy"
          element={
            <PublicLayout>
              <PrivacyPolicyPage />
            </PublicLayout>
          }
        />
        <Route
          path="/terms"
          element={
            <PublicLayout>
              <TermsPage />
            </PublicLayout>
          }
        />

        {/* Vendor Routes */}
        <Route
          path="/vendor"
          element={
            <ProtectedRoute requireVendor={true}>
              <VendorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="bookings" replace />} />
          <Route path="bookings" element={<VendorBookingsPage />} />
          <Route path="bookings/:id" element={<BookingDetailPage />} />
          <Route path="services" element={<VendorServicesPage />} />
          <Route path="requests" element={<VendorRequestsPage />} />
          <Route path="profile" element={<VendorProfilePage />} />
          <Route path="id-card" element={<VendorIdCardPage />} />
          <Route path="referrals" element={<MyReferralsPage />} />
        </Route>

        {/* User Routes */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="bookings" replace />} />
          <Route path="bookings" element={<UserBookingsPage />} />
          <Route path="bookings/:id" element={<BookingDetailPage />} />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="id-card" element={<UserIdCardPage />} />
          <Route path="referrals" element={<MyReferralsPage />} />
        </Route>

        {/* Ambassador Routes */}
        <Route
          path="/ambassador"
          element={
            <ProtectedRoute requireAmbassador={true}>
              <AmbassadorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AmbassadorDashboardPage />} />
          <Route path="register-vendor" element={<AmbassadorRegisterVendorPage />} />
          <Route path="my-vendors" element={<MyVendorsPage />} />
          <Route path="wallet" element={<WalletPage />} />
        </Route>

        <Route
          path="/booking/:id"
          element={
            <ProtectedRoute>
              <BookingDetailPage />
            </ProtectedRoute>
          }
        />



        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <PermissionGuard permission="dashboard">
                <DashboardPage />
              </PermissionGuard>
            }
          />
          <Route
            path="users"
            element={
              <PermissionGuard permission="users">
                <UsersPage />
              </PermissionGuard>
            }
          />
          <Route
            path="users/:id"
            element={
              <PermissionGuard permission="users">
                <UserDetailsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="vendors"
            element={
              <PermissionGuard permission="vendors">
                <VendorsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="ambassadors"
            element={
              <PermissionGuard permission="users">
                <AdminAmbassadorsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="ambassadors/:id"
            element={
              <PermissionGuard permission="users">
                <AmbassadorDetailsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="withdrawals"
            element={
              <PermissionGuard permission="users">
                <AdminWithdrawalsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="vendors/:id"
            element={
              <PermissionGuard permission="vendors">
                <VendorDetailsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="vendor-service-requests"
            element={
              <PermissionGuard permission="vendors">
                <VendorServiceRequestsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="vendor-id-card"
            element={
              <PermissionGuard permission="vendors">
                <AdminVendorIdCardPage />
              </PermissionGuard>
            }
          />
          <Route
            path="services"
            element={
              <PermissionGuard permission="services">
                <ServicesAdminPage />
              </PermissionGuard>
            }
          />
          <Route
            path="bookings"
            element={
              <PermissionGuard permission="bookings">
                <BookingsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="bookings/:id"
            element={
              <PermissionGuard permission="bookings">
                <BookingDetailPage />
              </PermissionGuard>
            }
          />
          <Route
            path="prescriptions"
            element={
              <PermissionGuard permission="prescriptions">
                <PrescriptionsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="reports"
            element={
              <PermissionGuard permission="reports">
                <ReportsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="lab-partners"
            element={
              <PermissionGuard permission="labPartners">
                <LabPartnersPage />
              </PermissionGuard>
            }
          />
          <Route
            path="insurance-claims"
            element={
              <PermissionGuard permission="insuranceClaims">
                <InsuranceClaimsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="faqs"
            element={
              <PermissionGuard permission="faqs">
                <FAQsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="coupons"
            element={
              <PermissionGuard permission="coupons">
                <CouponsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="staff"
            element={
              <PermissionGuard permission="staff">
                <StaffPage />
              </PermissionGuard>
            }
          />
          <Route
            path="support-tickets"
            element={
              <PermissionGuard permission="supportTickets">
                <SupportTicketsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="contact-inquiries"
            element={
              <PermissionGuard permission="contactInquiries">
                <ContactInquiriesPage />
              </PermissionGuard>
            }
          />
          <Route
            path="advertisements"
            element={
              <PermissionGuard permission="advertisements">
                <AdvertisementsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="jobs"
            element={
              <PermissionGuard permission="dashboard">
                <JobsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="job-applications"
            element={
              <PermissionGuard permission="dashboard">
                <JobApplicationsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="job-applications/:jobId"
            element={
              <PermissionGuard permission="dashboard">
                <JobApplicationsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="blogs"
            element={
              <PermissionGuard permission="dashboard">
                <BlogsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="gallery"
            element={
              <PermissionGuard permission="dashboard">
                <GalleryPage />
              </PermissionGuard>
            }
          />
          <Route
            path="hero"
            element={
              <PermissionGuard permission="dashboard">
                <HeroPage />
              </PermissionGuard>
            }
          />
          <Route
            path="team"
            element={
              <PermissionGuard permission="dashboard">
                <TeamPage />
              </PermissionGuard>
            }
          />
          <Route
            path="notifications"
            element={
              <PermissionGuard permission="dashboard">
                <NotificationsPage />
              </PermissionGuard>
            }
          />
          <Route
            path="settings"
            element={
              <PermissionGuard permission="dashboard">
                <SettingsPage />
              </PermissionGuard>
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;
