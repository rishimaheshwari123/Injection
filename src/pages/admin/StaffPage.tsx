import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

interface Staff {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isStaff: boolean;
  isActive: boolean;
  permissions: {
    dashboard: boolean;
    users: boolean;
    vendors: boolean;
    services: boolean;
    bookings: boolean;
    prescriptions: boolean;
    reports: boolean;
    labPartners: boolean;
    insuranceClaims: boolean;
    faqs: boolean;
    coupons: boolean;
    staff: boolean;
  };
}

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
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
    permissions: {
      dashboard: false,
      users: false,
      vendors: false,
      services: false,
      bookings: false,
      prescriptions: false,
      reports: false,
      labPartners: false,
      insuranceClaims: false,
      faqs: false,
      coupons: false,
      staff: false
    }
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await api.get('/users');
      const staff = response.data.data.filter((user: Staff) => user.isStaff === true);
      setStaffList(staff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Error loading staff');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingStaff) {
        // Remove password field if empty during edit
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }
        await api.put(`/users/${editingStaff._id}`, updateData);
        toast.success('Staff updated successfully!');
      } else {
        await api.post('/users/admin/create', formData);
        toast.success('Staff created successfully!');
      }
      await fetchStaff();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving staff:', error);
      toast.error(error.response?.data?.message || 'Error saving staff');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (staff: Staff) => {
    try {
      // Fetch full staff details
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
        role: 'admin',
        isStaff: true,
        permissions: fullStaff.permissions || {
          dashboard: false,
          users: false,
          vendors: false,
          services: false,
          bookings: false,
          prescriptions: false,
          reports: false,
          labPartners: false,
          insuranceClaims: false,
          faqs: false,
          staff: false
        }
      });
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching staff details:', error);
      toast.error('Error loading staff details');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
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
      permissions: {
        dashboard: false,
        users: false,
        vendors: false,
        services: false,
        bookings: false,
        prescriptions: false,
        reports: false,
        labPartners: false,
        insuranceClaims: false,
        faqs: false,
        staff: false
      }
    });
  };

  const handlePermissionChange = (permission: string, value: boolean) => {
    setFormData({
      ...formData,
      permissions: {
        ...formData.permissions,
        [permission]: value
      }
    });
  };

  const toggleAllPermissions = (value: boolean) => {
    setFormData({
      ...formData,
      permissions: {
        dashboard: value,
        users: value,
        vendors: value,
        services: value,
        bookings: value,
        prescriptions: value,
        reports: value,
        labPartners: value,
        insuranceClaims: value,
        faqs: value,
        coupons: value,
        staff: value
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Staff
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staffList.map((staff) => (
              <tr key={staff._id}>
                <td className="px-6 py-4 text-sm text-gray-900">{staff.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{staff.email}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{staff.phone}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 rounded ${staff.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => handleEdit(staff)}
                    disabled={submitting}
                    className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(staff._id)}
                    disabled={submitting}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingStaff ? 'Edit Staff' : 'Add Staff'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                    disabled={!!editingStaff}
                  />
                </div>
              </div>

              {!editingStaff && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Password *</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required={!editingStaff}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Phone *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                    pattern="[0-9]{10}"
                    placeholder="10 digit number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Age *</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) })}
                    className="w-full border rounded px-3 py-2"
                    required
                    min="18"
                    max="100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pincode *</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                    pattern="[0-9]{6}"
                    placeholder="6 digit pincode"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                  required
                />
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium">Permissions</label>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => toggleAllPermissions(true)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleAllPermissions(false)}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 border rounded p-4">
                  {Object.keys(formData.permissions).map((permission) => (
                    <label key={permission} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions[permission as keyof typeof formData.permissions]}
                        onChange={(e) => handlePermissionChange(permission, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{permission.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {submitting ? 'Saving...' : (editingStaff ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
