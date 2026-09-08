import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import {
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  KeyRound,
  Eye,
  EyeOff,
  CheckSquare,
  Square
} from 'lucide-react';

export interface PermissionsMap {
  dashboard: boolean;
  users: boolean;
  vendors: boolean;
  ambassadors: boolean;
  withdrawals: boolean;
  vendorServiceRequests: boolean;
  vendorIdCard: boolean;
  services: boolean;
  bookings: boolean;
  prescriptions: boolean;
  reports: boolean;
  labPartners: boolean;
  insuranceClaims: boolean;
  faqs: boolean;
  coupons: boolean;
  supportTickets: boolean;
  contactInquiries: boolean;
  advertisements: boolean;
  jobs: boolean;
  blogs: boolean;
  gallery: boolean;
  hero: boolean;
  team: boolean;
  staff: boolean;
  notifications: boolean;
  settings: boolean;
  websiteCounter: boolean;
}

export const DEFAULT_PERMISSIONS: PermissionsMap = {
  dashboard: false,
  users: false,
  vendors: false,
  ambassadors: false,
  withdrawals: false,
  vendorServiceRequests: false,
  vendorIdCard: false,
  services: false,
  bookings: false,
  prescriptions: false,
  reports: false,
  labPartners: false,
  insuranceClaims: false,
  faqs: false,
  coupons: false,
  supportTickets: false,
  contactInquiries: false,
  advertisements: false,
  jobs: false,
  blogs: false,
  gallery: false,
  hero: false,
  team: false,
  staff: false,
  notifications: false,
  settings: false,
  websiteCounter: false,
};

interface PermissionCategory {
  category: string;
  items: { key: keyof PermissionsMap; label: string; desc: string }[];
}

const PERMISSION_GROUPS: PermissionCategory[] = [
  {
    category: 'Dashboard & Analytics',
    items: [
      { key: 'dashboard', label: 'Dashboard', desc: 'View statistics and overall overview' },
      { key: 'websiteCounter', label: 'Visits & Analytics', desc: 'Website counter and visitor metrics' },
    ],
  },
  {
    category: 'Users & Partners',
    items: [
      { key: 'users', label: 'Users / Patients', desc: 'Manage user profiles & patient data' },
      { key: 'vendors', label: 'Vendors', desc: 'Manage vendor accounts and approvals' },
      { key: 'ambassadors', label: 'Ambassadors', desc: 'Ambassador network & performance' },
      { key: 'labPartners', label: 'Lab Partners', desc: 'Laboratory partner management' },
      { key: 'team', label: 'Team Management', desc: 'Internal team member directory' },
      { key: 'staff', label: 'Staff Management', desc: 'Manage staff roles and access control' },
    ],
  },
  {
    category: 'Operations & Service Flow',
    items: [
      { key: 'bookings', label: 'Bookings', desc: 'Track, assign & manage bookings' },
      { key: 'services', label: 'Services', desc: 'Manage medical and healthcare services' },
      { key: 'vendorServiceRequests', label: 'Service Requests', desc: 'Vendor submitted service requests' },
      { key: 'withdrawals', label: 'Withdrawal Requests', desc: 'Wallet payout and withdrawal requests' },
      { key: 'prescriptions', label: 'Prescriptions', desc: 'Prescription uploads and orders' },
      { key: 'reports', label: 'Reports', desc: 'Medical and diagnostic test reports' },
      { key: 'insuranceClaims', label: 'Insurance Claims', desc: 'Insurance claims and document review' },
      { key: 'vendorIdCard', label: 'Vendor ID Card', desc: 'Generate & review Vendor ID cards' },
    ],
  },
  {
    category: 'Marketing & Content',
    items: [
      { key: 'coupons', label: 'Coupons & Promos', desc: 'Discount vouchers and promotions' },
      { key: 'advertisements', label: 'Advertisements', desc: 'Banner and sponsored ads' },
      { key: 'jobs', label: 'Jobs & Applications', desc: 'Postings and job applications' },
      { key: 'blogs', label: 'Blogs & Articles', desc: 'Publish and manage health articles' },
      { key: 'gallery', label: 'Gallery', desc: 'Photo gallery and image assets' },
      { key: 'hero', label: 'Hero Slider', desc: 'Homepage banner hero slides' },
    ],
  },
  {
    category: 'Support & Administration',
    items: [
      { key: 'supportTickets', label: 'Support Tickets', desc: 'Customer support helpdesk' },
      { key: 'contactInquiries', label: 'Contact Inquiries', desc: 'Messages received from contact forms' },
      { key: 'faqs', label: 'FAQs', desc: 'Frequently asked questions' },
      { key: 'notifications', label: 'Notifications', desc: 'Send push alerts and announcements' },
      { key: 'settings', label: 'System Settings', desc: 'Global application configuration' },
    ],
  },
];

interface Staff {
  _id: string;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  age?: number;
  address?: string;
  pincode?: string;
  role: string;
  isStaff: boolean;
  isActive: boolean;
  permissions?: PermissionsMap;
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: 'Male',
    age: 25,
    address: '',
    pincode: '',
    role: 'admin',
    isStaff: true,
    permissions: { ...DEFAULT_PERMISSIONS },
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      const allUsers = response.data?.data || [];
      const staff = allUsers.filter((user: Staff) => user.isStaff === true || user.role === 'staff');
      setStaffList(staff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Error loading staff list');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingStaff) {
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          gender: formData.gender,
          age: formData.age,
          address: formData.address || 'N/A',
          pincode: formData.pincode || '000000',
          role: formData.role,
          isStaff: true,
          permissions: formData.permissions,
        };
        if (formData.password && formData.password.trim().length > 0) {
          updateData.password = formData.password.trim();
        }

        await api.put(`/users/${editingStaff._id}`, updateData);
        toast.success('Staff member updated successfully!');
      } else {
        if (!formData.password || formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setSubmitting(false);
          return;
        }

        const createData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          gender: formData.gender,
          age: formData.age || 25,
          address: formData.address || 'N/A',
          pincode: formData.pincode || '000000',
          role: 'admin',
          isStaff: true,
          permissions: formData.permissions,
        };

        await api.post('/users/admin/create', createData);
        toast.success('Staff member created successfully!');
      }
      await fetchStaff();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving staff:', error);
      toast.error(error.response?.data?.message || 'Error saving staff member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (staff: Staff) => {
    try {
      const response = await api.get(`/users/${staff._id}`);
      const fullStaff = response.data.data;

      setEditingStaff(staff);
      setFormData({
        name: fullStaff.name || '',
        email: fullStaff.email || '',
        password: '',
        phone: fullStaff.phone || '',
        gender: fullStaff.gender || 'Male',
        age: fullStaff.age || 25,
        address: fullStaff.address || '',
        pincode: fullStaff.pincode || '',
        role: fullStaff.role || 'admin',
        isStaff: true,
        permissions: {
          ...DEFAULT_PERMISSIONS,
          ...(fullStaff.permissions || {}),
        },
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching staff details:', error);
      toast.error('Error loading staff details');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff member? This action cannot be undone.')) {
      setLoading(true);
      try {
        await api.delete(`/users/${id}`);
        toast.success('Staff deleted successfully!');
        await fetchStaff();
      } catch (error) {
        console.error('Error deleting staff:', error);
        toast.error('Error deleting staff');
        setLoading(false);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingStaff(null);
    setShowPassword(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      gender: 'Male',
      age: 25,
      address: '',
      pincode: '',
      role: 'admin',
      isStaff: true,
      permissions: { ...DEFAULT_PERMISSIONS },
    });
  };

  const handlePermissionChange = (permission: keyof PermissionsMap, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: value,
      },
    }));
  };

  const toggleAllPermissions = (value: boolean) => {
    const newPerms = { ...DEFAULT_PERMISSIONS };
    (Object.keys(newPerms) as Array<keyof PermissionsMap>).forEach((key) => {
      newPerms[key] = value;
    });
    setFormData((prev) => ({
      ...prev,
      permissions: newPerms,
    }));
  };

  const toggleCategoryPermissions = (category: PermissionCategory, selectAll: boolean) => {
    setFormData((prev) => {
      const updated = { ...prev.permissions };
      category.items.forEach((item) => {
        updated[item.key] = selectAll;
      });
      return { ...prev, permissions: updated };
    });
  };

  const countGrantedPermissions = (perms?: PermissionsMap) => {
    if (!perms) return 0;
    return Object.values(perms).filter(Boolean).length;
  };

  const filteredStaffList = useMemo(() => {
    if (!searchQuery.trim()) return staffList;
    const q = searchQuery.toLowerCase();
    return staffList.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.phone?.includes(q)
    );
  }, [staffList, searchQuery]);

  const activeGrantedCount = useMemo(() => {
    return countGrantedPermissions(formData.permissions);
  }, [formData.permissions]);

  const totalPermissionsCount = Object.keys(DEFAULT_PERMISSIONS).length;

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] bg-clip-text text-transparent">
            Staff & Permission Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create staff accounts and control their access permissions across all admin modules
          </p>
        </div>
        <button
          onClick={() => {
            setEditingStaff(null);
            setFormData({
              name: '',
              email: '',
              password: '',
              phone: '',
              gender: 'Male',
              age: 25,
              address: '',
              pincode: '',
              role: 'admin',
              isStaff: true,
              permissions: { ...DEFAULT_PERMISSIONS },
            });
            setShowModal(true);
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] hover:opacity-95 text-white font-medium px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
        >
          <UserPlus size={18} />
          <span>Add New Staff</span>
        </button>
      </div>

      {/* Staff Stats and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Shield className="text-[#3DB9A6]" size={18} />
            <span>Total Staff Members: <strong className="text-gray-900">{staffList.length}</strong></span>
          </div>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search staff by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6] transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-[#3DB9A6] border-t-transparent"></div>
            <p className="mt-3 text-sm text-gray-500 font-medium">Loading staff members...</p>
          </div>
        ) : filteredStaffList.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Shield className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-base font-semibold text-gray-700">No staff members found</h3>
            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
              {searchQuery ? 'No staff member matching your search query.' : 'Click "Add New Staff" to create a staff member and grant custom permissions.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/75">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Staff Member
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Contact Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Granted Permissions
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredStaffList.map((staff) => {
                  const grantedCount = countGrantedPermissions(staff.permissions);
                  return (
                    <tr key={staff._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#63D64F] to-[#3DB9A6] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {staff.name?.charAt(0)?.toUpperCase() || 'S'}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{staff.name}</div>
                            <div className="text-xs text-gray-500">Staff Admin</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{staff.email}</div>
                        <div className="text-xs text-gray-500">{staff.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              grantedCount === totalPermissionsCount
                                ? 'bg-emerald-100 text-emerald-800'
                                : grantedCount > 0
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {grantedCount} / {totalPermissionsCount} Modules Allowed
                          </span>
                        </div>
                        {staff.permissions && grantedCount > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5 max-w-xs">
                            {Object.entries(staff.permissions)
                              .filter(([_, val]) => val)
                              .slice(0, 3)
                              .map(([key]) => (
                                <span
                                  key={key}
                                  className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded capitalize"
                                >
                                  {key.replace(/([A-Z])/g, ' $1')}
                                </span>
                              ))}
                            {grantedCount > 3 && (
                              <span className="text-[11px] text-gray-500 font-medium self-center">
                                +{grantedCount - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                            staff.isActive !== false
                              ? 'bg-green-50 text-green-700 border border-green-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {staff.isActive !== false ? (
                            <>
                              <CheckCircle2 size={13} className="text-green-600" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle size={13} className="text-red-600" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(staff)}
                            disabled={submitting}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Staff & Permissions"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(staff._id)}
                            disabled={submitting}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Staff"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#63D64F] to-[#3DB9A6] flex items-center justify-center text-white shadow-md">
                  <Shield size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingStaff ? 'Edit Staff Member & Access Permissions' : 'Create Staff Member & Grant Permissions'}
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Configure staff details and assign permissions for each section
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Details Section */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
                  <KeyRound size={16} className="text-[#3DB9A6]" />
                  Basic Account Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6] focus:outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="staff@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6] focus:outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500"
                      required
                      disabled={!!editingStaff}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      {editingStaff ? 'Reset Password (optional)' : 'Password *'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={editingStaff ? 'Leave empty to keep unchanged' : 'Min 6 characters'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 pr-10 text-sm focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6] focus:outline-none transition-all"
                        required={!editingStaff}
                        minLength={editingStaff ? 0 : 6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Phone Number (10 Digits) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6] focus:outline-none transition-all"
                      required
                      pattern="[0-9]{10}"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Gender</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6] focus:outline-none transition-all bg-white"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Age</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 25 })}
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6] focus:outline-none transition-all"
                      min="18"
                      max="100"
                    />
                  </div>
                </div>
              </div>

              {/* Permissions Header & Global Controls */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <Shield className="text-[#3DB9A6]" size={18} />
                      <h3 className="text-sm font-bold text-gray-800">Module Access & Permissions</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Selected: <strong className="text-[#3DB9A6]">{activeGrantedCount}</strong> of{' '}
                      <strong>{totalPermissionsCount}</strong> modules
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleAllPermissions(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-all"
                    >
                      <CheckSquare size={14} />
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAllPermissions(false)}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-xl transition-all"
                    >
                      <Square size={14} />
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* Categorized Permissions Grid */}
                <div className="space-y-5">
                  {PERMISSION_GROUPS.map((group) => {
                    const groupSelectedCount = group.items.filter(
                      (item) => formData.permissions[item.key]
                    ).length;
                    const allGroupSelected = groupSelectedCount === group.items.length;

                    return (
                      <div
                        key={group.category}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs"
                      >
                        {/* Group Header */}
                        <div className="bg-gray-50/80 px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                              {group.category}
                            </span>
                            <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-medium">
                              {groupSelectedCount} / {group.items.length}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleCategoryPermissions(group, !allGroupSelected)}
                            className="text-xs text-[#3DB9A6] hover:underline font-semibold"
                          >
                            {allGroupSelected ? 'Uncheck Category' : 'Check Category'}
                          </button>
                        </div>

                        {/* Group Items */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3.5">
                          {group.items.map((item) => {
                            const isChecked = !!formData.permissions[item.key];
                            return (
                              <label
                                key={item.key}
                                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                  isChecked
                                    ? 'bg-emerald-50/50 border-[#3DB9A6] shadow-xs'
                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => handlePermissionChange(item.key, e.target.checked)}
                                  className="mt-0.5 h-4 w-4 rounded text-[#3DB9A6] focus:ring-[#3DB9A6] accent-[#3DB9A6] cursor-pointer"
                                />
                                <div className="flex-1">
                                  <div className="text-xs font-semibold text-gray-900 leading-tight">
                                    {item.label}
                                  </div>
                                  <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                                    {item.desc}
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-medium text-sm transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-xl font-medium text-sm shadow-md hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
                >
                  {submitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  )}
                  {submitting ? 'Saving Staff...' : editingStaff ? 'Update Staff Permissions' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
