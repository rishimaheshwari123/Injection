import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Calendar,
  Package,
  User,
  Home,
  LogOut,
  Menu,
  X,
  Award,
  Share2,
  Inbox,
} from "lucide-react";
import { logout } from "../store/slices/authSlice";
import { RootState } from "../store/store";
import { toast } from "react-toastify";
import { useState } from "react";

const VendorLayout = () => {
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
      path: "/",
      icon: Home,
      label: "Go to Home",
    },
    {
      path: "/vendor/profile",
      icon: User,
      label: "My Profile",
    },
    {
      path: "/vendor/bookings",
      icon: Calendar,
      label: "Booking Management",
    },
    {
      path: "/vendor/requests",
      icon: Inbox,
      label: "Booking Requests",
    },
    {
      path: "/vendor/services",
      icon: Package,
      label: "Service Management",
    },
    {
      path: "/vendor/id-card",
      icon: Award,
      label: "My ID Card",
    },
    {
      path: "/vendor/referrals",
      icon: Share2,
      label: "My Referrals",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? "w-20" : "w-64"
        } bg-white shadow-lg fixed top-0 left-0 h-screen flex flex-col transition-all duration-300 z-30`}
      >
        <div className="p-6 border-b flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] bg-clip-text text-transparent truncate">
                Vendor Panel
              </h1>
              <p className="text-xs text-gray-500 mt-1 truncate max-w-[180px]">
                {user?.name}
              </p>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`p-2 hover:bg-slate-100 rounded-lg transition-colors ${
              sidebarCollapsed ? "mx-auto" : ""
            }`}
          >
            {sidebarCollapsed ? <Menu size={24} /> : <X size={24} />}
          </button>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center ${
                  sidebarCollapsed ? "justify-center" : "gap-3"
                } px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? "bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white"
                    : "text-gray-700 hover:bg-slate-100"
                }`}
                title={sidebarCollapsed ? item.label : ""}
              >
                <Icon size={22} className="flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-semibold text-sm">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t bg-white">
          <button
            onClick={handleLogout}
            className={`flex items-center ${
              sidebarCollapsed ? "justify-center" : "gap-3"
            } px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors`}
            title={sidebarCollapsed ? "Logout" : ""}
          >
            <LogOut size={22} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-semibold text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-1 min-w-0 ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        } p-6 transition-[margin] duration-300 overflow-x-hidden`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default VendorLayout;
