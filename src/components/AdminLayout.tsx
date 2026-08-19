import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Building2,
  Package,
  Calendar,
  LogOut,
  LayoutDashboard,
  FileText,
  FileBarChart,
  FlaskConical,
  Shield,
  HelpCircle,
  Menu,
  X,
  UserCog,
  Ticket,
  Headphones,
  MessageSquare,
  Image,
  Briefcase,
  BookOpen,
  Settings,
  ClipboardList,
  Bell,
  Award,
  Wallet,
  Eye,
} from "lucide-react";
import { logout } from "../store/slices/authSlice";
import { RootState } from "../store/store";
import { toast } from "react-toastify";
import { useState } from "react";

const AdminLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully!");
    setTimeout(() => {
      navigate("/login");
    }, 500);
  };

  const menuItems = [
    {
      path: "/admin",
      icon: LayoutDashboard,
      label: "Dashboard",
      permission: "dashboard",
    },
    { path: "/admin/users", icon: Users, label: "Users", permission: "users" },

    {
      path: "/admin/vendors",
      icon: Building2,
      label: "Vendors",
      permission: "vendors",
    },
    {
      path: "/admin/ambassadors",
      icon: Users,
      label: "Ambassadors",
      permission: "users",
    },
    {
      path: "/admin/withdrawals",
      icon: Wallet,
      label: "Withdrawals Requests",
      permission: "users",
    },
    {
      path: "/admin/vendor-service-requests",
      icon: ClipboardList,
      label: "Service Requests",
      permission: "vendors",
    },
    {
      path: "/admin/services",
      icon: Package,
      label: "Services",
      permission: "services",
    },
    {
      path: "/admin/bookings",
      icon: Calendar,
      label: "Bookings",
      permission: "bookings",
    },
    {
      path: "/admin/prescriptions",
      icon: FileText,
      label: "Prescriptions",
      permission: "prescriptions",
    },
    {
      path: "/admin/reports",
      icon: FileBarChart,
      label: "Reports",
      permission: "reports",
    },
    {
      path: "/admin/lab-partners",
      icon: FlaskConical,
      label: "Lab Partners",
      permission: "labPartners",
    },
    {
      path: "/admin/insurance-claims",
      icon: Shield,
      label: "Insurance Claims",
      permission: "insuranceClaims",
    },
    {
      path: "/admin/faqs",
      icon: HelpCircle,
      label: "FAQs",
      permission: "faqs",
    },
    {
      path: "/admin/coupons",
      icon: Ticket,
      label: "Coupons",
      permission: "coupons",
    },
    {
      path: "/admin/support-tickets",
      icon: Headphones,
      label: "Support Tickets",
      permission: "supportTickets",
    },
    {
      path: "/admin/contact-inquiries",
      icon: MessageSquare,
      label: "Contact Inquiries",
      permission: "contactInquiries",
    },
    {
      path: "/admin/advertisements",
      icon: Image,
      label: "Advertisements",
      permission: "advertisements",
    },
    {
      path: "/admin/jobs",
      icon: Briefcase,
      label: "Job Postings",
      permission: "dashboard",
    },
    {
      path: "/admin/blogs",
      icon: BookOpen,
      label: "Blogs",
      permission: "dashboard",
    },
    {
      path: "/admin/gallery",
      icon: Image,
      label: "Gallery",
      permission: "dashboard",
    },
    {
      path: "/admin/hero",
      icon: Image,
      label: "Hero Slider",
      permission: "dashboard",
    },
    {
      path: "/admin/team",
      icon: Users,
      label: "Team Management",
      permission: "dashboard",
    },
    {
      path: "/admin/staff",
      icon: UserCog,
      label: "Staff Management",
      permission: "staff",
    },
    {
      path: "/admin/notifications",
      icon: Bell,
      label: "Notifications",
      permission: "dashboard",
    },
    {
      path: "/admin/settings",
      icon: Settings,
      label: "Settings",
      permission: "dashboard",
    },
    {
      path: "/admin/vendor-id-card",
      icon: Award,
      label: "Vendor ID Card",
      permission: "vendors",
    },
    {
      path: "/admin/website-counter",
      icon: Eye,
      label: "Visits & Web Analytics",
      permission: "dashboard",
    },
  ];

  const hasPermission = (permission: string) => {
    // Super admin has all permissions
    if (user?.role === "admin" && !user?.isStaff) {
      return true;
    }
    // Check staff permissions
    return (
      user?.isStaff &&
      user?.permissions?.[permission as keyof typeof user.permissions]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`${sidebarCollapsed ? "w-20" : "w-64"} bg-white shadow-lg fixed top-0 left-0 h-screen flex flex-col transition-all duration-300 z-30`}
      >
        <div className="p-6 border-b flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] bg-clip-text text-transparent">
                Admin Panel
              </h1>
              <p className="text-sm text-gray-600 mt-1">{user?.name}</p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${sidebarCollapsed ? "mx-auto" : ""}`}
          >
            {sidebarCollapsed ? <Menu size={24} /> : <X size={24} />}
          </button>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            if (!hasPermission(item.permission)) return null;

            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-lg mb-2 transition-colors ${isActive
                  ? "bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
                title={sidebarCollapsed ? item.label : ""}
              >
                <Icon size={24} className="flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button - Fixed at Bottom */}
        <div className="p-4 border-t bg-white">
          <button
            onClick={handleLogout}
            className={`flex items-center ${sidebarCollapsed ? "justify-center" : "gap-3"} px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors`}
            title={sidebarCollapsed ? "Logout" : ""}
          >
            <LogOut size={24} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 min-w-0 ${sidebarCollapsed ? "ml-20" : "ml-64"} p-3 transition-[margin] duration-300 overflow-x-hidden`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
