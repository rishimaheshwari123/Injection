import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Users, Building2, Package, Calendar, LogOut, LayoutDashboard, FileText, FileBarChart, FlaskConical, Shield, HelpCircle, Menu, X, UserCog, Ticket } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { RootState } from '../store/store';
import { toast } from 'react-toastify';
import { useState } from 'react';

const AdminLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully!');
    setTimeout(() => {
      navigate('/login');
    }, 500);
  };

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', permission: 'dashboard' },
    { path: '/admin/users', icon: Users, label: 'Users', permission: 'users' },
    { path: '/admin/vendors', icon: Building2, label: 'Vendors', permission: 'vendors' },
    { path: '/admin/services', icon: Package, label: 'Services', permission: 'services' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings', permission: 'bookings' },
    { path: '/admin/prescriptions', icon: FileText, label: 'Prescriptions', permission: 'prescriptions' },
    { path: '/admin/reports', icon: FileBarChart, label: 'Reports', permission: 'reports' },
    { path: '/admin/lab-partners', icon: FlaskConical, label: 'Lab Partners', permission: 'labPartners' },
    { path: '/admin/insurance-claims', icon: Shield, label: 'Insurance Claims', permission: 'insuranceClaims' },
    { path: '/admin/faqs', icon: HelpCircle, label: 'FAQs', permission: 'faqs' },
    { path: '/admin/coupons', icon: Ticket, label: 'Coupons', permission: 'coupons' },
    { path: '/admin/staff', icon: UserCog, label: 'Staff Management', permission: 'staff' },
  ];

  const hasPermission = (permission: string) => {
    // Super admin has all permissions
    if (user?.role === 'admin' && !user?.isStaff) {
      return true;
    }
    // Check staff permissions
    return user?.isStaff && user?.permissions?.[permission];
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white shadow-lg fixed h-full flex flex-col transition-all duration-300`}>
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
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${sidebarCollapsed ? 'mx-auto' : ''}`}
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
                className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive
                    ? 'bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <Icon size={24} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button - Fixed at Bottom */}
        <div className="p-4 border-t bg-white">
          <button
            onClick={handleLogout}
            className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors`}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <LogOut size={24} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} p-8 transition-all duration-300`}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
