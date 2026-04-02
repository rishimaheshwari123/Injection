import { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, Download, Plus, Edit, Trash2, X, Eye, MoreVertical } from 'lucide-react';
import { userAPI } from '../../services/api';
import { setUsers, setLoading, updateUserStatus, addUser, updateUser, removeUser } from '../../store/slices/userSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

interface UserFormData {
  name: string;
  email: string;
  password: string;
  phone: string;
  gender: string;
  age: string;
  address: string;
  pincode: string;
  alternateMobile: string;
  currentLocation: string;
  hasInsurance: boolean;
  insurancePolicyNumber: string;
  insuranceProvider: string;
  bloodGroup: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  additionalNotes: string;
  role: string;
  isActive: boolean;
}

const UsersPage = () => {
  const dispatch = useAppDispatch();
  const { users, loading } = useAppSelector((state: any) => state.users);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '', email: '', password: '', phone: '', gender: 'Male', age: '',
    address: '', pincode: '', alternateMobile: '', currentLocation: '',
    hasInsurance: false, insurancePolicyNumber: '', insuranceProvider: '',
    bloodGroup: 'Unknown', emergencyContactName: '', emergencyContactPhone: '',
    emergencyContactRelation: '', additionalNotes: '', role: 'user', isActive: true
  });
  const [allergies, setAllergies] = useState<string[]>([]);
  const [chronicDiseases, setChronicDiseases] = useState<string[]>([]);
  const [currentMedications, setCurrentMedications] = useState<string[]>([]);
  const [insuranceType, setInsuranceType] = useState('Primary');
  const [submitting, setSubmitting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewUser, setViewUser] = useState<any>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  console.log('UsersPage render - users count:', users.length);
  console.log('Users:', users);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    dispatch(setLoading(true));
    try {
      const response = await userAPI.getAllUsers();
      if (response.data.success) {
        dispatch(setUsers(response.data.data));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean, userName: string) => {
    try {
      const response = await userAPI.toggleUserStatus(userId);
      if (response.data.success) {
        dispatch(updateUserStatus({ userId, isActive: !currentStatus }));
        toast.success(`${userName} ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    // Show confirmation toast
    const confirmDelete = () => {
      toast.info(
        <div>
          <p className="font-semibold mb-2">Delete {userName}?</p>
          <p className="text-sm mb-3">This action cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss();
                try {
                  const response = await userAPI.deleteUser(userId);
                  if (response.data.success) {
                    dispatch(removeUser(userId));
                    toast.success(`${userName} deleted successfully!`);
                  }
                } catch (error: any) {
                  toast.error(error.response?.data?.message || 'Failed to delete user');
                }
              }}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss()}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>,
        {
          position: 'top-center',
          autoClose: false,
          closeButton: false,
          draggable: false,
        }
      );
    };
    
    confirmDelete();
  };

  const handleOpenModal = (user: any = null) => {
    if (user) {
      setEditMode(true);
      setSelectedUser(user);
      setFormData({ ...user, password: '' });
      setAllergies(user.allergies || []);
      setChronicDiseases(user.chronicDiseases || []);
      setCurrentMedications(user.currentMedications || []);
      setInsuranceType(user.insuranceType || 'Primary');
    } else {
      setEditMode(false);
      setSelectedUser(null);
      setFormData({
        name: '', email: '', password: '', phone: '', gender: 'Male', age: '',
        address: '', pincode: '', alternateMobile: '', currentLocation: '',
        hasInsurance: false, insurancePolicyNumber: '', insuranceProvider: '',
        bloodGroup: 'Unknown', emergencyContactName: '', emergencyContactPhone: '',
        emergencyContactRelation: '', additionalNotes: '', role: 'user', isActive: true
      });
      setAllergies([]);
      setChronicDiseases([]);
      setCurrentMedications([]);
      setInsuranceType('Primary');
    }
    setShowModal(true);
  };

  const handleViewUser = (user: any) => {
    setViewUser(user);
    setShowViewModal(true);
    setOpenDropdown(null);
  };

  const toggleDropdown = (userId: string) => {
    setOpenDropdown(openDropdown === userId ? null : userId);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const submitData = {
        ...formData,
        allergies,
        chronicDiseases,
        currentMedications,
        insuranceType
      };
      
      console.log('Submitting data:', submitData);
      
      if (editMode && selectedUser) {
        console.log('Updating user:', selectedUser._id);
        const response = await userAPI.updateUser(selectedUser._id, submitData);
        console.log('Update response:', response.data);
        if (response.data.success) {
          dispatch(updateUser(response.data.data));
          console.log('User updated in Redux');
          toast.success('User updated successfully!');
          setShowModal(false);
        }
      } else {
        console.log('Creating new user');
        const response = await userAPI.createUser(submitData);
        console.log('Create response:', response.data);
        if (response.data.success) {
          dispatch(addUser(response.data.data));
          console.log('User added to Redux:', response.data.data);
          toast.success('User created successfully!');
          setShowModal(false);
        }
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportToExcel = () => {
    try {
      const excelData = filteredUsers.map((user: any) => ({
        'Name': user.name, 'Email': user.email, 'Phone': user.phone,
        'Gender': user.gender, 'Age': user.age, 'Blood Group': user.bloodGroup || 'Unknown',
        'Insurance': user.hasInsurance ? 'Yes' : 'No', 'Role': user.role,
        'Status': user.isActive ? 'Active' : 'Inactive'
      }));
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Users');
      XLSX.writeFile(wb, `Users_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Users data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const filteredUsers = users.filter((user: any) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Users/Patients Management</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all">
            <Plus size={20} /> Add User
          </button>
          <button onClick={handleExportToExcel} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download size={20} /> Export
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#63D64F]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md ">
          <div className="">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Patient Info</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Medical</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user: any) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{user.name}</p>
                      <p className="text-sm text-gray-600">{user.age} years, {user.gender}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{user.email}</p>
                      <p className="text-sm text-gray-600">{user.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">Blood: {user.bloodGroup || 'Unknown'}</p>
                      <p className="text-sm text-gray-600">Insurance: {user.hasInsurance ? 'Yes' : 'No'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDropdown(user._id);
                          }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Actions"
                        >
                          <MoreVertical size={20} />
                        </button>
                        
                        {openDropdown === user._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  handleViewUser(user);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Eye size={16} className="text-green-600" />
                                View Profile
                              </button>
                              <button
                                onClick={() => {
                                  handleOpenModal(user);
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Edit size={16} className="text-blue-600" />
                                Edit User
                              </button>
                              <button
                                onClick={() => {
                                  handleToggleStatus(user._id, user.isActive, user.name);
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                {user.isActive ? (
                                  <>
                                    <UserX size={16} className="text-orange-600" />
                                    Deactivate User
                                  </>
                                ) : (
                                  <>
                                    <UserCheck size={16} className="text-green-600" />
                                    Activate User
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => {
                                  handleDelete(user._id, user.name);
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t"
                              >
                                <Trash2 size={16} />
                                Delete User
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">{editMode ? 'Edit User/Patient' : 'Add New User/Patient'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  {!editMode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <input type="password" required={!editMode} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                    <select required value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                    <input type="number" required value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                    <select value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]">
                      <option value="Unknown">Unknown</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
                    <div className="space-y-2">
                      {allergies.map((allergy, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={allergy}
                            onChange={(e) => {
                              const newAllergies = [...allergies];
                              newAllergies[index] = e.target.value;
                              setAllergies(newAllergies);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]"
                            placeholder="Enter allergy"
                          />
                          <button
                            type="button"
                            onClick={() => setAllergies(allergies.filter((_, i) => i !== index))}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setAllergies([...allergies, ''])}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        + Add Allergy
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chronic Diseases</label>
                    <div className="space-y-2">
                      {chronicDiseases.map((disease, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={disease}
                            onChange={(e) => {
                              const newDiseases = [...chronicDiseases];
                              newDiseases[index] = e.target.value;
                              setChronicDiseases(newDiseases);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]"
                            placeholder="Enter chronic disease"
                          />
                          <button
                            type="button"
                            onClick={() => setChronicDiseases(chronicDiseases.filter((_, i) => i !== index))}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setChronicDiseases([...chronicDiseases, ''])}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        + Add Chronic Disease
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
                    <div className="space-y-2">
                      {currentMedications.map((medication, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={medication}
                            onChange={(e) => {
                              const newMedications = [...currentMedications];
                              newMedications[index] = e.target.value;
                              setCurrentMedications(newMedications);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]"
                            placeholder="Enter medication"
                          />
                          <button
                            type="button"
                            onClick={() => setCurrentMedications(currentMedications.filter((_, i) => i !== index))}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setCurrentMedications([...currentMedications, ''])}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        + Add Medication
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input type="text" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input type="text" required value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Mobile</label>
                    <input type="tel" value={formData.alternateMobile} onChange={(e) => setFormData({...formData, alternateMobile: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Insurance & Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.hasInsurance} onChange={(e) => setFormData({...formData, hasInsurance: e.target.checked})}
                        className="w-4 h-4 text-[#63D64F] border-gray-300 rounded" />
                      <span className="text-sm font-medium text-gray-700">Has Insurance</span>
                    </label>
                  </div>
                  {formData.hasInsurance && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Type</label>
                        <select value={insuranceType} onChange={(e) => setInsuranceType(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]">
                          <option value="Primary">Primary</option>
                          <option value="Secondary">Secondary</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                        <input type="text" value={formData.insurancePolicyNumber} onChange={(e) => setFormData({...formData, insurancePolicyNumber: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                        <input type="text" value={formData.insuranceProvider} onChange={(e) => setFormData({...formData, insuranceProvider: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                    <input type="text" value={formData.emergencyContactName} onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                    <input type="tel" value={formData.emergencyContactPhone} onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Relation</label>
                    <input type="text" value={formData.emergencyContactRelation} onChange={(e) => setFormData({...formData, emergencyContactRelation: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                    <textarea value={formData.additionalNotes} onChange={(e) => setFormData({...formData, additionalNotes: e.target.value})} rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="w-4 h-4 text-[#63D64F] border-gray-300 rounded" />
                      <span className="text-sm font-medium text-gray-700">Active Account</span>
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} disabled={submitting} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>{editMode ? 'Update User' : 'Create User'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* View Modal */}
      {showViewModal && viewUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">User/Patient Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-800">{viewUser.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-800">{viewUser.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-800">{viewUser.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Alternate Mobile</p>
                    <p className="font-medium text-gray-800">{viewUser.alternateMobile || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium text-gray-800">{viewUser.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium text-gray-800">{viewUser.age} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Blood Group</p>
                    <p className="font-medium text-gray-800">{viewUser.bloodGroup || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Preferred Language</p>
                    <p className="font-medium text-gray-800">{viewUser.preferredLanguage || 'English'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="font-medium text-gray-800">{viewUser.address}, {viewUser.pincode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Location</p>
                    <p className="font-medium text-gray-800">{viewUser.currentLocation || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Role</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${viewUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {viewUser.role}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Account Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${viewUser.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {viewUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Medical Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Allergies</p>
                    {viewUser.allergies && viewUser.allergies.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {viewUser.allergies.map((allergy: string, idx: number) => (
                          <li key={idx} className="font-medium text-gray-800">{allergy}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="font-medium text-gray-800">None</p>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Chronic Diseases</p>
                    {viewUser.chronicDiseases && viewUser.chronicDiseases.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {viewUser.chronicDiseases.map((disease: string, idx: number) => (
                          <li key={idx} className="font-medium text-gray-800">{disease}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="font-medium text-gray-800">None</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-600">Current Medications</p>
                    {viewUser.currentMedications && viewUser.currentMedications.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {viewUser.currentMedications.map((medication: string, idx: number) => (
                          <li key={idx} className="font-medium text-gray-800">{medication}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="font-medium text-gray-800">None</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Insurance Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Insurance Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Has Insurance</p>
                    <p className="font-medium text-gray-800">{viewUser.hasInsurance ? 'Yes' : 'No'}</p>
                  </div>
                  {viewUser.hasInsurance && (
                    <>
                      <div>
                        <p className="text-sm text-gray-600">Insurance Type</p>
                        <p className="font-medium text-gray-800">{viewUser.insuranceType || 'Primary'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Policy Number</p>
                        <p className="font-medium text-gray-800">{viewUser.insurancePolicyNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Insurance Provider</p>
                        <p className="font-medium text-gray-800">{viewUser.insuranceProvider || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Expiry Date</p>
                        <p className="font-medium text-gray-800">
                          {viewUser.insuranceExpiryDate ? new Date(viewUser.insuranceExpiryDate).toLocaleDateString('en-IN') : 'N/A'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Contact Name</p>
                    <p className="font-medium text-gray-800">{viewUser.emergencyContactName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Contact Phone</p>
                    <p className="font-medium text-gray-800">{viewUser.emergencyContactPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Relation</p>
                    <p className="font-medium text-gray-800">{viewUser.emergencyContactRelation || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              {viewUser.additionalNotes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Additional Notes</h3>
                  <p className="text-gray-700">{viewUser.additionalNotes}</p>
                </div>
              )}

              {/* Account Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Created At</p>
                    <p className="font-medium text-gray-800">{new Date(viewUser.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="font-medium text-gray-800">{new Date(viewUser.updatedAt).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
