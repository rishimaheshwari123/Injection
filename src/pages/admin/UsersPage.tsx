import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserCheck, UserX, Download, Plus, Edit, Trash2, X, Eye, MoreVertical, Check } from 'lucide-react';
import { userAPI, otpAPI } from '../../services/api';
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
  city: string;
  state: string;
  pincode: string;
  longitude: string;
  latitude: string;
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

interface MedicalEntry {
  name: string;
  since: string;
}

interface FileUploadCardProps {
  label: string;
  accept: string;
  url: string;
  uploading: boolean;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

const FileUploadCard: React.FC<FileUploadCardProps> = ({
  label,
  accept,
  url,
  uploading,
  onFileSelect,
  onClear
}) => {
  return (
    <div className="border border-dashed border-gray-300 hover:border-[#63D64F] rounded-xl p-4 transition-all bg-gray-50 flex flex-col items-center justify-center min-h-[140px] relative group shadow-sm">
      {uploading ? (
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-[#63D64F] rounded-full animate-spin"></div>
          <span className="text-xs text-gray-500 font-semibold animate-pulse">Uploading file...</span>
        </div>
      ) : url ? (
        <div className="w-full flex flex-col items-center gap-2">
          {accept.includes("image") && !url.toLowerCase().endsWith(".pdf") ? (
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-md bg-white">
              <img src={url} alt={label} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center text-[#63D64F]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}
          <span className="text-xs font-bold text-gray-700 max-w-[180px] truncate text-center">{label}</span>
          <div className="flex items-center gap-2.5 mt-1">
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" /> View
            </a>
            <button type="button" onClick={onClear} className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="w-full h-full cursor-pointer flex flex-col items-center justify-center gap-2 py-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 group-hover:bg-[#63D64F]/10 group-hover:text-[#63D64F] transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <span className="text-xs font-bold text-gray-700">Upload {label}</span>
          <span className="text-[10px] text-gray-400">PDF, JPG, PNG up to 10MB</span>
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                onFileSelect(e.target.files[0]);
              }
            }}
          />
        </label>
      )}
    </div>
  );
};

const UsersPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { users, loading } = useAppSelector((state: any) => state.users);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [jumpPage, setJumpPage] = useState('');
  const [customLimit, setCustomLimit] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState<UserFormData>({
    name: '', email: '', password: '', phone: '', gender: 'Male', age: '',
    address: '', city: '', state: '', pincode: '', longitude: '', latitude: '', alternateMobile: '', currentLocation: '',
    hasInsurance: false, insurancePolicyNumber: '', insuranceProvider: '',
    bloodGroup: 'Unknown', emergencyContactName: '', emergencyContactPhone: '',
    emergencyContactRelation: '', additionalNotes: '', role: 'user', isActive: true
  });
  const [allergies, setAllergies] = useState<MedicalEntry[]>([]);
  const [chronicDiseases, setChronicDiseases] = useState<MedicalEntry[]>([]);
  const [currentMedications, setCurrentMedications] = useState<MedicalEntry[]>([]);
  const [insuranceType, setInsuranceType] = useState('Primary');

  // File upload URL states
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [medicalReportUrl, setMedicalReportUrl] = useState<string>('');
  const [bloodReportUrl, setBloodReportUrl] = useState<string>('');
  const [historyDocumentUrl, setHistoryDocumentUrl] = useState<string>('');
  const [otherDocumentUrl, setOtherDocumentUrl] = useState<string>('');

  // Uploading loading states
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [uploadingMedicalReport, setUploadingMedicalReport] = useState(false);
  const [uploadingBloodReport, setUploadingBloodReport] = useState(false);
  const [uploadingHistoryDocument, setUploadingHistoryDocument] = useState(false);
  const [uploadingOtherDocument, setUploadingOtherDocument] = useState(false);

  // OTP Verification States
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [lastVerifiedPhone, setLastVerifiedPhone] = useState('');

  const handleSendOtp = async () => {
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setSendingOtp(true);
    try {
      const response = await otpAPI.sendOtp(formData.phone);
      if (response.data.success) {
        setOtpSent(true);
        toast.success('OTP sent successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^[0-9]{6}$/.test(otpCode)) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setVerifyingOtp(true);
    try {
      const response = await otpAPI.verifyOtp(formData.phone, otpCode);
      if (response.data.success) {
        setIsPhoneVerified(true);
        setLastVerifiedPhone(formData.phone);
        setOtpSent(false);
        setOtpCode('');
        toast.success('Phone number verified successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleFileUpload = async (
    file: File | null,
    folder: string,
    setLoadingState: React.Dispatch<React.SetStateAction<boolean>>,
    setUrlState: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (!file) return;
    setLoadingState(true);
    try {
      const response = await userAPI.uploadUserFile(file, folder);
      if (response.data && response.data.success) {
        setUrlState(response.data.url);
        toast.success(`${file.name} uploaded successfully!`);
      } else {
        toast.error(`Failed to upload ${file.name}`);
      }
    } catch (error: any) {
      console.error('File upload error:', error);
      toast.error(error.response?.data?.message || `Failed to upload ${file.name}`);
    } finally {
      setLoadingState(false);
    }
  };

  // Helper helper to parse database medical array (defensively handling strings or objects)
  const parseMedicalEntries = (entries: any): MedicalEntry[] => {
    if (!entries || !Array.isArray(entries)) return [];
    return entries.map((entry: any) => {
      if (typeof entry === 'string') {
        return { name: entry, since: '' };
      }
      return { name: entry.name || '', since: entry.since || '' };
    });
  };
  // Remove redundant viewUser/showViewModal states
  const [submitting, setSubmitting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  console.log('UsersPage render - users count:', users.length);
  console.log('Users:', users);

  useEffect(() => {
    fetchUsers(1, limit, activeSearch);
  }, []);

  const fetchUsers = async (page = currentPage, pageSize = limit, searchVal = activeSearch) => {
    dispatch(setLoading(true));
    try {
      const response = await userAPI.getPaginatedUsers({
        page,
        limit: pageSize,
        search: searchVal
      });
      if (response.data.success) {
        dispatch(setUsers(response.data.data));
        setTotalPages(response.data.totalPages || 1);
        setTotalUsers(response.data.totalUsers || 0);
        setCurrentPage(response.data.currentPage || 1);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearch = () => {
    setActiveSearch(searchTerm);
    fetchUsers(1, limit, searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveSearch('');
    fetchUsers(1, limit, '');
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
                    fetchUsers(currentPage, limit, activeSearch);
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
    // Reset file URLs and uploading states
    setProfileImageUrl('');
    setMedicalReportUrl('');
    setBloodReportUrl('');
    setHistoryDocumentUrl('');
    setOtherDocumentUrl('');

    setUploadingProfileImage(false);
    setUploadingMedicalReport(false);
    setUploadingBloodReport(false);
    setUploadingHistoryDocument(false);
    setUploadingOtherDocument(false);

    if (user) {
      setEditMode(true);
      setSelectedUser(user);
      setFormData({ ...user, password: '' });
      setAllergies(parseMedicalEntries(user.allergies));
      setChronicDiseases(parseMedicalEntries(user.chronicDiseases));
      setCurrentMedications(parseMedicalEntries(user.currentMedications));
      setInsuranceType(user.insuranceType || 'Primary');
      setProfileImageUrl(user.profileImage || '');
      setMedicalReportUrl(user.medicalReport || '');
      setBloodReportUrl(user.bloodReport || '');
      setHistoryDocumentUrl(user.historyDocument || '');
      setOtherDocumentUrl(user.otherDocument || '');
      setIsPhoneVerified(true);
      setLastVerifiedPhone(user.phone || '');
      setOtpSent(false);
      setOtpCode('');
    } else {
      setEditMode(false);
      setSelectedUser(null);
      setFormData({
        name: '', email: '', password: '', phone: '', gender: 'Male', age: '',
        address: '', city: '', state: '', pincode: '', longitude: '75.8577', latitude: '22.7196', alternateMobile: '', currentLocation: '',
        hasInsurance: false, insurancePolicyNumber: '', insuranceProvider: '',
        bloodGroup: 'Unknown', emergencyContactName: '', emergencyContactPhone: '',
        emergencyContactRelation: '', additionalNotes: '', role: 'user', isActive: true
      });
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setFormData(prev => ({
              ...prev,
              longitude: pos.coords.longitude.toString(),
              latitude: pos.coords.latitude.toString()
            }));
          },
          (err) => console.error(err)
        );
      }
      setAllergies([]);
      setChronicDiseases([]);
      setCurrentMedications([]);
      setInsuranceType('Primary');
      setIsPhoneVerified(false);
      setLastVerifiedPhone('');
      setOtpSent(false);
      setOtpCode('');
    }
    setShowModal(true);
  };

  const handleViewUser = (user: any) => {
    navigate(`/admin/users/${user._id}`);
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
    if (!isPhoneVerified) {
      toast.error('Please verify the phone number via OTP first');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        insuranceType,
        allergies,
        chronicDiseases,
        currentMedications,
        profileImage: profileImageUrl,
        medicalReport: medicalReportUrl,
        bloodReport: bloodReportUrl,
        historyDocument: historyDocumentUrl,
        otherDocument: otherDocumentUrl
      };

      console.log('Submitting JSON payload:', payload);

      if (editMode && selectedUser) {
        console.log('Updating user:', selectedUser._id);
        const response = await userAPI.updateUser(selectedUser._id, payload);
        console.log('Update response:', response.data);
        if (response.data.success) {
          dispatch(updateUser(response.data.data));
          console.log('User updated in Redux');
          toast.success('User updated successfully!');
          setShowModal(false);
          fetchUsers(currentPage, limit, activeSearch);
        }
      } else {
        console.log('Creating new user');
        const response = await userAPI.createUser(payload);
        console.log('Create response:', response.data);
        if (response.data.success) {
          dispatch(addUser(response.data.data));
          console.log('User added to Redux:', response.data.data);
          toast.success('User created successfully!');
          setShowModal(false);
          fetchUsers(1, limit, activeSearch);
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

  const filteredUsers = users;

  return (
    <>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold text-gray-800">Users/Patients Management</h1>
        <div className="flex items-center gap-3">

          <button onClick={handleExportToExcel} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            <Download size={20} /> Export
          </button>
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all font-medium">
            <Plus size={20} /> Add User
          </button>
        </div>
      </div>

      {/* Search Bar - Full Width Row */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by Patient ID, Name, Email, or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
            className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none text-sm"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-6 py-2.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
        >
          Search
        </button>
        {activeSearch && (
          <button
            onClick={handleClearSearch}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium text-sm transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#63D64F]"></div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[1100px] divide-y divide-gray-200">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Patient ID</th>
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
                      <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                        {user.patientId ? (
                          <span
                            onClick={() => handleViewUser(user)}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#e6f9e2] text-[#338024] border border-[#d2f4cc] cursor-pointer hover:bg-[#d5f5cd] transition-colors"
                          >
                            {user.patientId}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p onClick={() => handleViewUser(user)} className="font-medium text-gray-800 cursor-pointer hover:text-[#338024] hover:underline">{user.name}</p>
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

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 font-medium">Show:</span>
              <select
                value={[5, 10, 20, 50, 100].includes(limit) && !customLimit ? limit : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    const newLimit = parseInt(val);
                    setLimit(newLimit);
                    setCustomLimit('');
                    fetchUsers(1, newLimit, activeSearch);
                  }
                }}
                className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#63D64F] outline-none text-sm bg-white font-medium"
              >
                <option value="" disabled={!customLimit}>Select</option>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>

              <input
                type="number"
                min={1}
                placeholder="Custom"
                value={customLimit}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomLimit(val);
                  if (val) {
                    const newLimit = parseInt(val);
                    if (newLimit > 0) {
                      setLimit(newLimit);
                      fetchUsers(1, newLimit, activeSearch);
                    }
                  }
                }}
                className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#63D64F] outline-none text-sm text-center font-medium"
              />

              <span className="text-sm text-gray-500 ml-2 font-medium">
                Showing {users.length > 0 ? (currentPage - 1) * limit + 1 : 0} to {Math.min(currentPage * limit, totalUsers)} of {totalUsers} users
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => fetchUsers(currentPage - 1, limit, activeSearch)}
                  disabled={currentPage === 1 || loading}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Previous
                </button>

                <span className="px-4 py-1.5 text-sm text-gray-700 bg-gray-50 border rounded-lg font-medium">
                  Page {currentPage} of {totalPages || 1}
                </span>

                <button
                  onClick={() => fetchUsers(currentPage + 1, limit, activeSearch)}
                  disabled={currentPage === totalPages || totalPages === 0 || loading}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Next
                </button>
              </div>

              <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
                <span className="text-sm text-gray-600">Go to page:</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages || 1}
                  value={jumpPage}
                  onChange={(e) => setJumpPage(e.target.value)}
                  placeholder="Page"
                  className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#63D64F] outline-none text-sm text-center font-medium"
                />
                <button
                  onClick={() => {
                    const targetPage = parseInt(jumpPage);
                    if (targetPage >= 1 && targetPage <= totalPages) {
                      fetchUsers(targetPage, limit, activeSearch);
                      setJumpPage('');
                    } else {
                      toast.error(`Please enter a page between 1 and ${totalPages}`);
                    }
                  }}
                  disabled={loading || !jumpPage}
                  className="px-3 py-1 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg text-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Go
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      </div>

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
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  {!editMode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <input type="password" required={!editMode} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, phone: val });
                          if (val === lastVerifiedPhone && lastVerifiedPhone !== '') {
                            setIsPhoneVerified(true);
                          } else {
                            setIsPhoneVerified(false);
                          }
                        }}
                        disabled={otpSent}
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#63D64F] outline-none transition-all ${
                          isPhoneVerified ? 'border-green-300 bg-green-50' : 'border-gray-300'
                        }`}
                      />
                      {!isPhoneVerified ? (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={sendingOtp || otpSent || !/^[0-9]{10}$/.test(formData.phone)}
                          className="px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-semibold rounded-lg hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center min-w-[90px]"
                        >
                          {sendingOtp ? 'Sending...' : otpSent ? 'Sent' : 'Verify'}
                        </button>
                      ) : (
                        <span className="px-3 py-2 bg-green-100 text-green-700 font-bold rounded-lg text-xs flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {otpSent && (
                    <div className="md:col-span-2 bg-[#f4fbf3] border border-[#d2f4cc] rounded-xl p-4 mt-2 animate-fadeIn">
                      <p className="text-xs text-slate-600 mb-2 font-medium">An OTP has been sent to {formData.phone}. Please enter the 6-digit verification code below:</p>
                      <div className="flex gap-3 items-center">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="Enter OTP"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] outline-none text-center font-bold tracking-widest text-base"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={verifyingOtp || otpCode.length !== 6}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg hover:shadow-md transition disabled:opacity-50 text-xs"
                        >
                          {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-xs text-gray-500 hover:text-gray-700 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                    <select required value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                    <input type="number" required value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                    <select value={formData.bloodGroup} onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
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
                      {allergies.length > 0 && (
                        <div className="flex gap-2 mb-1 text-xs font-semibold text-gray-500">
                          <div className="flex-1 pl-1">Allergy Name</div>
                          <div className="w-1/3 pl-1">Since (Date)</div>
                          <div className="w-[76px]"></div>
                        </div>
                      )}
                      {allergies.map((allergy, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={allergy.name}
                            onChange={(e) => {
                              const newAllergies = [...allergies];
                              newAllergies[index] = { ...newAllergies[index], name: e.target.value };
                              setAllergies(newAllergies);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]"
                            placeholder="Allergy Name (e.g. Peanut)"
                          />
                          <input
                            type="date"
                            value={allergy.since}
                            onChange={(e) => {
                              const newAllergies = [...allergies];
                              newAllergies[index] = { ...newAllergies[index], since: e.target.value };
                              setAllergies(newAllergies);
                            }}
                            className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] outline-none text-sm bg-white"
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
                        onClick={() => setAllergies([...allergies, { name: '', since: '' }])}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        + Add Allergy
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Chronic Diseases</label>
                    <div className="space-y-2">
                      {chronicDiseases.length > 0 && (
                        <div className="flex gap-2 mb-1 text-xs font-semibold text-gray-500">
                          <div className="flex-1 pl-1">Disease Name</div>
                          <div className="w-1/3 pl-1">Since (Date)</div>
                          <div className="w-[76px]"></div>
                        </div>
                      )}
                      {chronicDiseases.map((disease, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={disease.name}
                            onChange={(e) => {
                              const newDiseases = [...chronicDiseases];
                              newDiseases[index] = { ...newDiseases[index], name: e.target.value };
                              setChronicDiseases(newDiseases);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]"
                            placeholder="Disease Name (e.g. Diabetes)"
                          />
                          <input
                            type="date"
                            value={disease.since}
                            onChange={(e) => {
                              const newDiseases = [...chronicDiseases];
                              newDiseases[index] = { ...newDiseases[index], since: e.target.value };
                              setChronicDiseases(newDiseases);
                            }}
                            className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] outline-none text-sm bg-white"
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
                        onClick={() => setChronicDiseases([...chronicDiseases, { name: '', since: '' }])}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        + Add Chronic Disease
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
                    <div className="space-y-2">
                      {currentMedications.length > 0 && (
                        <div className="flex gap-2 mb-1 text-xs font-semibold text-gray-500">
                          <div className="flex-1 pl-1">Medication Name</div>
                          <div className="w-1/3 pl-1">Since (Date)</div>
                          <div className="w-[76px]"></div>
                        </div>
                      )}
                      {currentMedications.map((medication, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={medication.name}
                            onChange={(e) => {
                              const newMedications = [...currentMedications];
                              newMedications[index] = { ...newMedications[index], name: e.target.value };
                              setCurrentMedications(newMedications);
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]"
                            placeholder="Medication Name (e.g. Metformin)"
                          />
                          <input
                            type="date"
                            value={medication.since}
                            onChange={(e) => {
                              const newMedications = [...currentMedications];
                              newMedications[index] = { ...newMedications[index], since: e.target.value };
                              setCurrentMedications(newMedications);
                            }}
                            className="w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] outline-none text-sm bg-white"
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
                        onClick={() => setCurrentMedications([...currentMedications, { name: '', since: '' }])}
                        className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        + Add Medication
                      </button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input type="text" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input type="text" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input type="text" required value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input type="text" required value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Mobile</label>
                    <input type="tel" value={formData.alternateMobile} onChange={(e) => setFormData({ ...formData, alternateMobile: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b">Documents & Profile Photo</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <FileUploadCard
                    label="Profile Photo"
                    accept="image/*"
                    url={profileImageUrl}
                    uploading={uploadingProfileImage}
                    onFileSelect={(file) => handleFileUpload(file, 'profiles', setUploadingProfileImage, setProfileImageUrl)}
                    onClear={() => setProfileImageUrl('')}
                  />
                  <FileUploadCard
                    label="Medical Report"
                    accept="application/pdf,image/*"
                    url={medicalReportUrl}
                    uploading={uploadingMedicalReport}
                    onFileSelect={(file) => handleFileUpload(file, 'documents', setUploadingMedicalReport, setMedicalReportUrl)}
                    onClear={() => setMedicalReportUrl('')}
                  />
                  <FileUploadCard
                    label="Blood Report"
                    accept="application/pdf,image/*"
                    url={bloodReportUrl}
                    uploading={uploadingBloodReport}
                    onFileSelect={(file) => handleFileUpload(file, 'documents', setUploadingBloodReport, setBloodReportUrl)}
                    onClear={() => setBloodReportUrl('')}
                  />
                  <FileUploadCard
                    label="History Document"
                    accept="application/pdf,image/*"
                    url={historyDocumentUrl}
                    uploading={uploadingHistoryDocument}
                    onFileSelect={(file) => handleFileUpload(file, 'documents', setUploadingHistoryDocument, setHistoryDocumentUrl)}
                    onClear={() => setHistoryDocumentUrl('')}
                  />
                  <div className="md:col-span-2 lg:col-span-2">
                    <FileUploadCard
                      label="Other Document"
                      accept="application/pdf,image/*"
                      url={otherDocumentUrl}
                      uploading={uploadingOtherDocument}
                      onFileSelect={(file) => handleFileUpload(file, 'documents', setUploadingOtherDocument, setOtherDocumentUrl)}
                      onClear={() => setOtherDocumentUrl('')}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Insurance & Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.hasInsurance} onChange={(e) => setFormData({ ...formData, hasInsurance: e.target.checked })}
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
                        <input type="text" value={formData.insurancePolicyNumber} onChange={(e) => setFormData({ ...formData, insurancePolicyNumber: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
                        <input type="text" value={formData.insuranceProvider} onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                      </div>
                    </>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
                    <input type="text" value={formData.emergencyContactName} onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
                    <input type="tel" value={formData.emergencyContactPhone} onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Relation</label>
                    <input type="text" value={formData.emergencyContactRelation} onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                    <textarea value={formData.additionalNotes} onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })} rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
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
                  disabled={submitting || !isPhoneVerified}
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
    </>
  );
};

export default UsersPage;
