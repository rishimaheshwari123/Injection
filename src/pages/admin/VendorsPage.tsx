import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Plus, Edit, Trash2, X, Eye, MoreVertical, UserCheck, UserX, Package, Check, FileText, Key } from 'lucide-react';
import { vendorAPI, serviceAPI, vendorServiceRequestAPI, otpAPI } from '../../services/api';
import { setVendors, setLoading, updateVendorStatus, addVendor, updateVendor, removeVendor } from '../../store/slices/vendorSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { LocationAutocomplete } from '../../components/LocationAutocomplete';

const VendorsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { vendors, loading } = useAppSelector((state: any) => state.vendors);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalVendors, setTotalVendors] = useState(0);
  const [jumpPage, setJumpPage] = useState('');
  const [customLimit, setCustomLimit] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Service Request States
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [vendorRequests, setVendorRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedServicesToRequest, setSelectedServicesToRequest] = useState<string[]>([]);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Reset Password states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetVendorId, setResetVendorId] = useState('');
  const [resetVendorName, setResetVendorName] = useState('');
  const [resetVendorEmail, setResetVendorEmail] = useState('');
  const [resetPasswordVal, setResetPasswordVal] = useState('');
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  const handleResetPasswordClick = (vendor: any) => {
    setResetVendorId(vendor._id);
    setResetVendorName(vendor.name || vendor.businessName);
    setResetVendorEmail(vendor.email);
    setResetPasswordVal(Math.random().toString(36).substring(2, 10));
    setShowResetModal(true);
  };

  const handleResetPasswordSubmit = async () => {
    if (!resetPasswordVal || resetPasswordVal.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    setResetPasswordLoading(true);
    try {
      const response = await vendorAPI.adminResetPassword(resetVendorId, resetPasswordVal);
      if (response.data.success) {
        toast.success(`Password reset successfully! Account credentials sent to ${resetVendorEmail}`);
        setShowResetModal(false);
        setResetPasswordVal('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setResetPasswordLoading(false);
    }
  };

  console.log('VendorsPage render - vendors count:', vendors.length);
  console.log('Vendors:', vendors);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', alternatePhone: '',
    gender: 'Male',
    businessName: '', businessType: 'Individual', registrationNumber: '',
    gstNumber: '', experience: '', specialization: '', address: '',
    city: '', state: '', pincode: '', longitude: '', latitude: '', bio: '', profileImage: '',
    isActive: true, isVerified: false,
    services: [] as string[],
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: ''
    },
    documents: {
      identityProof: { type: 'Identity Proof', url: '' },
      qualificationCertificate: { type: 'Qualification Certificate', url: '' },
      businessLicense: { type: 'Business License', url: '' },
      insuranceCertificate: { type: 'Insurance Certificate', url: '' },
      policeVerification: { type: 'Police Verification', url: '' }
    }
  });
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);

  const [uploadingFiles, setUploadingFiles] = useState({
    profileImage: false,
    identityProof: false,
    qualificationCertificate: false,
    businessLicense: false,
    insuranceCertificate: false,
    policeVerification: false
  });

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
      const response = await otpAPI.sendOtp(formData.phone, 'vendor');
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    setUploadingFiles(prev => ({ ...prev, [fieldName]: true }));
    try {
      const response = await vendorAPI.uploadFile(file);
      if (response.data.success) {
        const fileUrl = response.data.data.url;
        if (fieldName === 'profileImage') {
          setFormData(prev => ({
            ...prev,
            profileImage: fileUrl
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            documents: {
              ...prev.documents,
              [fieldName]: {
                type: fieldName === 'identityProof' ? 'Identity Proof'
                  : fieldName === 'qualificationCertificate' ? 'Qualification Certificate'
                    : fieldName === 'businessLicense' ? 'Business License'
                      : fieldName === 'insuranceCertificate' ? 'Insurance Certificate'
                        : fieldName === 'policeVerification' ? 'Police Verification'
                          : 'Document',
                url: fileUrl
              }
            }
          }));
        }
        toast.success(`${file.name} uploaded successfully!`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'File upload failed');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  useEffect(() => {
    fetchVendors(1, limit, activeSearch);
    fetchServicesList();
  }, []);

  const fetchServicesList = async () => {
    try {
      const response = await serviceAPI.getAllServices();
      if (response.data.success) {
        setServicesList(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch services list:', error);
    }
  };

  const fetchVendors = async (page = currentPage, pageSize = limit, searchVal = activeSearch) => {
    dispatch(setLoading(true));
    try {
      const response = await vendorAPI.getPaginatedVendors({
        page,
        limit: pageSize,
        search: searchVal
      });
      if (response.data.success) {
        dispatch(setVendors(response.data.data));
        setTotalPages(response.data.totalPages || 1);
        setTotalVendors(response.data.totalVendors || 0);
        setCurrentPage(response.data.currentPage || 1);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch vendors');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleSearch = () => {
    setActiveSearch(searchTerm);
    fetchVendors(1, limit, searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveSearch('');
    fetchVendors(1, limit, '');
  };

  const handleToggleStatus = async (vendorId: string, currentStatus: boolean, businessName: string) => {
    try {
      const response = currentStatus
        ? await vendorAPI.deactivateVendor(vendorId)
        : await vendorAPI.activateVendor(vendorId);
      if (response.data.success) {
        dispatch(updateVendorStatus({ vendorId, isActive: !currentStatus, isVerified: !currentStatus }));
        toast.success(`${businessName} ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
        fetchVendors(currentPage, limit, activeSearch);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update vendor status');
    }
  };

  const handleDelete = async (vendorId: string, businessName: string) => {
    const confirmDelete = () => {
      toast.info(
        <div>
          <p className="font-semibold mb-2">Delete {businessName}?</p>
          <p className="text-sm mb-3">This action cannot be undone.</p>
          <div className="flex gap-2">
            <button onClick={async () => {
              toast.dismiss();
              try {
                const response = await vendorAPI.deleteVendor(vendorId);
                if (response.data.success) {
                  dispatch(removeVendor(vendorId));
                  toast.success(`${businessName} deleted successfully!`);
                  fetchVendors(currentPage, limit, activeSearch);
                }
              } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to delete vendor');
              }
            }} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
              Delete
            </button>
            <button onClick={() => toast.dismiss()} className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </div>,
        { position: 'top-center', autoClose: false, closeButton: false, draggable: false }
      );
    };
    confirmDelete();
  };

  const handleOpenModal = (vendor: any = null) => {
    if (vendor) {
      setEditMode(true);
      setSelectedVendor(vendor);
      setFormData({
        ...vendor,
        password: '',
        gender: vendor.gender || 'Male',
        services: vendor.services ? vendor.services.map((s: any) => s._id || s) : [],
        bankDetails: vendor.bankDetails || {
          accountHolderName: '',
          accountNumber: '',
          ifscCode: '',
          bankName: ''
        },
        documents: {
          identityProof: {
            type: 'Identity Proof',
            url: vendor.documents?.identityProof?.url || ''
          },
          qualificationCertificate: {
            type: 'Qualification Certificate',
            url: vendor.documents?.qualificationCertificate?.url || ''
          },
          businessLicense: {
            type: 'Business License',
            url: vendor.documents?.businessLicense?.url || ''
          },
          insuranceCertificate: {
            type: 'Insurance Certificate',
            url: vendor.documents?.insuranceCertificate?.url || ''
          },
          policeVerification: {
            type: 'Police Verification',
            url: vendor.documents?.policeVerification?.url || ''
          }
        },
        profileImage: vendor.profileImage || '',
        latitude: vendor.latitude ? vendor.latitude.toString() : '22.7196',
        longitude: vendor.longitude ? vendor.longitude.toString() : '75.8577'
      });
      setServiceAreas(vendor.serviceAreas || []);
      setIsPhoneVerified(true);
      setLastVerifiedPhone(vendor.phone || '');
      setOtpSent(false);
      setOtpCode('');
    } else {
      setEditMode(false);
      setSelectedVendor(null);
      setFormData({
        name: '', email: '', password: '', phone: '', alternatePhone: '',
        gender: 'Male',
        businessName: '', businessType: 'Individual', registrationNumber: '',
        gstNumber: '', experience: '', specialization: '', address: '',
        city: '', state: '', pincode: '', longitude: '75.8577', latitude: '22.7196', bio: '', profileImage: '',
        isActive: true, isVerified: false,
        services: [],
        bankDetails: {
          accountHolderName: '',
          accountNumber: '',
          ifscCode: '',
          bankName: ''
        },
        documents: {
          identityProof: { type: 'Identity Proof', url: '' },
          qualificationCertificate: { type: 'Qualification Certificate', url: '' },
          businessLicense: { type: 'Business License', url: '' },
          insuranceCertificate: { type: 'Insurance Certificate', url: '' },
          policeVerification: { type: 'Police Verification', url: '' }
        }
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
      setServiceAreas([]);
      setIsPhoneVerified(false);
      setLastVerifiedPhone('');
      setOtpSent(false);
      setOtpCode('');
    }
    setShowModal(true);
  };

  const handleViewVendor = (vendor: any) => {
    navigate(`/admin/vendors/${vendor._id}`);
  };

  const handleOpenRequestsModal = async (vendor: any) => {
    setSelectedVendor(vendor);
    setShowRequestsModal(true);
    setLoadingRequests(true);
    setSelectedServicesToRequest([]);
    try {
      const response = await vendorServiceRequestAPI.getAllRequests();
      if (response.data.success) {
        const filtered = response.data.data.filter((r: any) => r.vendor?._id === vendor._id);
        setVendorRequests(filtered);
      }
    } catch (error) {
      console.error('Failed to fetch requests for vendor:', error);
      toast.error('Failed to load service requests');
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleCreateRequestOnBehalf = async () => {
    if (selectedServicesToRequest.length === 0 || !selectedVendor) {
      toast.error('Please select at least one service');
      return;
    }
    setSubmittingRequest(true);
    try {
      const response = await vendorServiceRequestAPI.createRequest(selectedServicesToRequest, selectedVendor._id);
      if (response.data.success) {
        toast.success('Service request submitted successfully!');
        setSelectedServicesToRequest([]);
        // Re-fetch vendor requests
        const requestsRes = await vendorServiceRequestAPI.getAllRequests();
        if (requestsRes.data.success) {
          const filtered = requestsRes.data.data.filter((r: any) => r.vendor?._id === selectedVendor._id);
          setVendorRequests(filtered);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit service request');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleProcessRequestDirectly = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const remarks = status === 'approved'
        ? 'Approved directly by admin from vendor section.'
        : 'Rejected directly by admin from vendor section.';
      const response = await vendorServiceRequestAPI.processRequest(requestId, status, remarks);
      if (response.data.success) {
        toast.success(`Request ${status} successfully!`);
        // Re-fetch requests
        const requestsRes = await vendorServiceRequestAPI.getAllRequests();
        if (requestsRes.data.success) {
          const filtered = requestsRes.data.data.filter((r: any) => r.vendor?._id === selectedVendor._id);
          setVendorRequests(filtered);
        }
        // Fetch vendors to refresh their assigned services list
        fetchVendors(currentPage, limit, activeSearch);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process request');
    }
  };

  const getUnassignedServices = () => {
    if (!selectedVendor || !servicesList) return [];
    const assignedIds = selectedVendor.services ? selectedVendor.services.map((s: any) => (s._id || s).toString()) : [];
    return servicesList.filter(s => s.isActive && !assignedIds.includes(s._id.toString()));
  };

  const toggleDropdown = (vendorId: string) => {
    setOpenDropdown(openDropdown === vendorId ? null : vendorId);
  };

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
      const cleanedDocuments: any = {};
      Object.entries(formData.documents || {}).forEach(([key, value]: [string, any]) => {
        if (value && value.url) {
          cleanedDocuments[key] = value;
        }
      });

      const submitData = {
        ...formData,
        verificationStatus: formData.isVerified ? 'verified' : 'pending',
        serviceAreas,
        documents: Object.keys(cleanedDocuments).length > 0 ? cleanedDocuments : undefined,
        profileImage: formData.profileImage || undefined
      };

      console.log('Submitting vendor data:', submitData);

      if (editMode && selectedVendor) {
        console.log('Updating vendor:', selectedVendor._id);
        const response = await vendorAPI.updateVendor(selectedVendor._id, submitData);
        console.log('Update response:', response.data);
        if (response.data.success) {
          dispatch(updateVendor(response.data.data));
          console.log('Vendor updated in Redux');
          toast.success('Vendor updated successfully!');
          setShowModal(false);
          fetchVendors(currentPage, limit, activeSearch);
        }
      } else {
        console.log('Creating new vendor');
        const response = await vendorAPI.createVendor(submitData);
        console.log('Create response:', response.data);
        if (response.data.success) {
          dispatch(addVendor(response.data.data));
          console.log('Vendor added to Redux:', response.data.data);
          toast.success('Vendor created successfully!');
          setShowModal(false);
          fetchVendors(1, limit, activeSearch);
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
      const excelData = filteredVendors.map((vendor: any) => ({
        'Vendor ID': vendor.vendorId || '',
        'Business Name': vendor.businessName, 'Owner': vendor.name, 'Email': vendor.email,
        'Phone': vendor.phone, 'Type': vendor.businessType, 'City': vendor.city,
        'State': vendor.state, 'Status': vendor.isActive ? 'Active' : 'Inactive',
        'Verified': vendor.isVerified ? 'Yes' : 'No'
      }));
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Vendors');
      XLSX.writeFile(wb, `Vendors_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Vendors data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const filteredVendors = vendors;

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Vendors Management</h1>
          <div className="flex items-center gap-3">
            <button onClick={handleExportToExcel} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              <Download size={20} /> Export
            </button>
            <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all font-medium">
              <Plus size={20} /> Add Vendor
            </button>
          </div>
        </div>

        {/* Search Bar - Full Width Row */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by Vendor ID, Name, Email, or Phone..."
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
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] overflow-hidden transition-all duration-300">
              <div className="overflow-x-auto w-full">
                <table className="w-full min-w-[1000px] divide-y divide-slate-100">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-100">
                      <th className="w-[8%] px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vendor ID</th>
                      <th className="w-[15%] px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Business Info</th>
                      <th className="w-[12%] px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Location</th>
                      <th className="w-[12%] px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Owner</th>
                      <th className="w-[18%] px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Contact</th>
                      <th className="w-[8%] px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                      <th className="w-[18%] px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Services</th>
                      <th className="w-[6%] px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="w-[3%] px-4 py-3 text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100/80 bg-white">
                    {filteredVendors.map((vendor: any) => (
                      <tr
                        key={vendor._id}
                        className="hover:bg-slate-50/60 transition-colors duration-150 ease-in-out"
                      >
                        <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                          {vendor.vendorId ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-[#eefcf9] text-[#1e8a79] border border-[#d3f6f0] shadow-xs">
                              {vendor.vendorId}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-normal">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p
                            onClick={() => handleViewVendor(vendor)}
                            className="font-semibold text-slate-800 hover:text-[#3DB9A6] hover:underline cursor-pointer transition-colors duration-150 text-sm"
                          >
                            {vendor.businessName}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-700">{vendor.city || '-'}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{vendor.state || '-'}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p
                            onClick={() => handleViewVendor(vendor)}
                            className="text-sm font-medium text-slate-700 hover:text-[#3DB9A6] hover:underline cursor-pointer transition-colors duration-150"
                          >
                            {vendor.name}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-sm font-medium text-slate-800 break-all">{vendor.email}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{vendor.phone}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${vendor.businessType === 'Individual'
                            ? 'bg-sky-50 text-sky-700 border-sky-100/70'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-100/70'
                            }`}>
                            {vendor.businessType}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div
                            onClick={() => handleViewVendor(vendor)}
                            className="flex flex-wrap gap-1 items-center cursor-pointer max-w-[200px]"
                          >
                            {vendor.services && vendor.services.length > 0 ? (
                              <>
                                {vendor.services.slice(0, 2).map((s: any) => (
                                  <span
                                    key={s._id || s}
                                    className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 text-xs font-semibold border border-emerald-100/80 whitespace-nowrap transition-colors"
                                  >
                                    {s.serviceName || s}
                                  </span>
                                ))}
                                {vendor.services.length > 2 && (
                                  <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold border border-slate-200 whitespace-nowrap transition-colors">
                                    +{vendor.services.length - 2}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-slate-400 text-xs italic">No services</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${vendor.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-100'
                            }`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${vendor.isActive ? 'bg-emerald-500' : 'bg-rose-400'}`}></span>
                            {vendor.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleDropdown(vendor._id); }}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {openDropdown === vendor._id && (
                              <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-10 py-1 divide-y divide-slate-50 font-sans">
                                <button onClick={() => handleViewVendor(vendor)} className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                                  <Eye size={16} className="text-[#3DB9A6]" /> View Profile
                                </button>
                                <button onClick={() => { handleOpenModal(vendor); setOpenDropdown(null); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                                  <Edit size={16} className="text-blue-500" /> Edit Vendor
                                </button>
                                <button onClick={() => { handleOpenRequestsModal(vendor); setOpenDropdown(null); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                                  <FileText size={16} className="text-purple-500" /> Service Requests
                                </button>
                                <button onClick={() => { handleToggleStatus(vendor._id, vendor.isActive, vendor.businessName); setOpenDropdown(null); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                                  {vendor.isActive ? <><UserX size={16} className="text-orange-500" /> Deactivate</> : <><UserCheck size={16} className="text-emerald-500" /> Activate</>}
                                </button>
                                <button onClick={() => { handleResetPasswordClick(vendor); setOpenDropdown(null); }} className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                                  <Key size={16} className="text-[#3DB9A6]" /> Reset Password
                                </button>
                                <button onClick={() => { handleDelete(vendor._id, vendor.businessName); setOpenDropdown(null); }} className="w-full px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-rose-50/50 flex items-center gap-2 transition-colors">
                                  <Trash2 size={16} /> Delete Vendor
                                </button>
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
                      fetchVendors(1, newLimit, activeSearch);
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
                        fetchVendors(1, newLimit, activeSearch);
                      }
                    }
                  }}
                  className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#63D64F] outline-none text-sm text-center font-medium"
                />

                <span className="text-sm text-gray-500 ml-2 font-medium">
                  Showing {vendors.length > 0 ? (currentPage - 1) * limit + 1 : 0} to {Math.min(currentPage * limit, totalVendors)} of {totalVendors} vendors
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fetchVendors(currentPage - 1, limit, activeSearch)}
                    disabled={currentPage === 1 || loading}
                    className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Previous
                  </button>

                  <span className="px-4 py-1.5 text-sm text-gray-700 bg-gray-50 border rounded-lg font-medium">
                    Page {currentPage} of {totalPages || 1}
                  </span>

                  <button
                    onClick={() => fetchVendors(currentPage + 1, limit, activeSearch)}
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
                        fetchVendors(targetPage, limit, activeSearch);
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">{editMode ? 'Edit Vendor' : 'Add New Vendor'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
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
                        className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#63D64F] outline-none transition-all ${isPhoneVerified ? 'border-green-300 bg-green-50' : 'border-gray-300'
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
                    <input type="tel" value={formData.alternatePhone} onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                    <select required value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                    <input type="text" required value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Type *</label>
                    <select required value={formData.businessType} onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]">
                      <option value="Individual">Individual</option>
                      <option value="Clinic">Clinic</option>
                      <option value="Hospital">Hospital</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                    <input type="text" value={formData.registrationNumber} onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <input type="text" value={formData.gstNumber} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                    <input type="number" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <input type="text" value={formData.specialization} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Offered Services</h3>
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                  {servicesList.map((service) => (
                    <label key={service._id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded border border-slate-100">
                      <input
                        type="checkbox"
                        checked={formData.services.includes(service._id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            services: checked
                              ? [...prev.services, service._id]
                              : prev.services.filter(id => id !== service._id)
                          }));
                        }}
                        className="w-4 h-4 text-[#63D64F] border-gray-300 rounded focus:ring-[#63D64F]"
                      />
                      {service.image ? (
                        <img
                          src={service.image}
                          alt={service.serviceName}
                          className="w-10 h-10 object-cover rounded-md border"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-slate-100 rounded-md border flex items-center justify-center text-slate-400">
                          <Package size={20} />
                        </div>
                      )}
                      <div>
                        <span className="text-sm text-gray-700 font-semibold block">
                          {service.serviceName}
                        </span>
                        <span className="text-xs text-gray-500 block">
                          {typeof service.category === 'object' ? (service.category?.name || "N/A") : (service.category || "N/A")} - ₹{service.basePrice}
                        </span>
                      </div>
                    </label>
                  ))}
                  {servicesList.length === 0 && (
                    <p className="text-sm text-gray-500">No services created yet.</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Location Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input type="text" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div className="relative z-30">
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <LocationAutocomplete
                      value={formData.city}
                      onChange={(val) => setFormData({ ...formData, city: val })}
                      type="(cities)"
                      placeholder="Bhopal"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] outline-none"
                    />
                  </div>
                  <div className="relative z-30">
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <LocationAutocomplete
                      value={formData.state}
                      onChange={(val) => setFormData({ ...formData, state: val })}
                      type="(regions)"
                      placeholder="Madhya Pradesh"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] outline-none"
                    />
                  </div>
                  <div className="relative z-20">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <LocationAutocomplete
                      value={formData.pincode}
                      onChange={(val) => setFormData({ ...formData, pincode: val })}
                      type="postal_code"
                      placeholder="452001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] outline-none"
                    />
                  </div>

                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                    <input type="text" value={formData.bankDetails.accountHolderName}
                      onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountHolderName: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input type="text" value={formData.bankDetails.accountNumber}
                      onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, accountNumber: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                    <input type="text" value={formData.bankDetails.ifscCode}
                      onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, ifscCode: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input type="text" value={formData.bankDetails.bankName}
                      onChange={(e) => setFormData({ ...formData, bankDetails: { ...formData.bankDetails, bankName: e.target.value } })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile Image & Documents</h3>

                {/* Profile Image */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row items-center gap-6 mb-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-300 bg-gray-100 flex items-center justify-center flex-shrink-0 animate-pulse-slow">
                    {formData.profileImage ? (
                      <img src={formData.profileImage} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-gray-400 text-xs">No Image</span>
                    )}
                    {uploadingFiles.profileImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h4 className="text-sm font-semibold text-gray-800">Profile Image</h4>
                    <p className="text-xs text-gray-500 mt-1 mb-2">Upload a profile image. Max 5MB (JPG, PNG).</p>
                    <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition cursor-pointer text-xs font-semibold shadow-sm">
                      <Plus size={14} className="text-[#3DB9A6]" />
                      {formData.profileImage ? 'Change Image' : 'Choose Image'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'profileImage')} disabled={uploadingFiles.profileImage} />
                    </label>
                    {formData.profileImage && (
                      <button type="button" onClick={() => setFormData(prev => ({ ...prev, profileImage: '' }))} className="ml-3 inline-flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-semibold">
                        <X size={14} /> Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Documents Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'identityProof', label: 'Identity Proof', desc: 'Aadhaar, Passport, or Voter ID' },
                    { key: 'qualificationCertificate', label: 'Qualification Certificate', desc: 'Degree or Diploma certificate' },
                    { key: 'businessLicense', label: 'Business License', desc: 'Registration or Trade license' },
                    { key: 'insuranceCertificate', label: 'Insurance Certificate', desc: 'Professional indemnity or business insurance' },
                    { key: 'policeVerification', label: 'Police Verification Document', desc: 'Clearance certificate or verification report' }
                  ].map((doc) => {
                    const key = doc.key as 'identityProof' | 'qualificationCertificate' | 'businessLicense' | 'insuranceCertificate' | 'policeVerification';
                    const fileUrl = formData.documents?.[key]?.url;
                    const isUploading = (uploadingFiles as any)[key];
                    return (
                      <div key={doc.key} className="border border-gray-200 rounded-xl p-4 bg-white hover:border-gray-300 transition-all flex flex-col justify-between shadow-sm">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-sm font-semibold text-gray-800">{doc.label}</h4>
                            <p className="text-[11px] text-gray-500 mt-0.5">{doc.desc}</p>
                          </div>
                          {fileUrl && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-semibold rounded-full border border-green-200">
                              <Check size={10} /> Uploaded
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
                          {fileUrl ? (
                            <>
                              <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#3DB9A6] hover:underline font-semibold flex items-center gap-1">
                                <FileText size={14} /> View File
                              </a>
                              <button type="button" onClick={() => setFormData(prev => ({
                                ...prev,
                                documents: {
                                  ...prev.documents,
                                  [key]: { type: prev.documents[key].type, url: '' }
                                }
                              }))} className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1">
                                <X size={14} /> Remove
                              </button>
                            </>
                          ) : (
                            <label className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg transition cursor-pointer text-xs font-semibold shadow-sm w-full justify-center ${isUploading ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                              }`}>
                              {isUploading ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-400 border-t-transparent"></div>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Plus size={14} className="text-[#3DB9A6]" /> Upload
                                </>
                              )}
                              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, key)} disabled={isUploading} />
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Status</h3>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-[#63D64F] border-gray-300 rounded" />
                    <span className="text-sm font-medium text-gray-700">Active Account</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.isVerified} onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                      className="w-4 h-4 text-[#63D64F] border-gray-300 rounded" />
                    <span className="text-sm font-medium text-gray-700">Verified Account</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} disabled={submitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting || !isPhoneVerified}
                  className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center gap-2">
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>{editMode ? 'Update Vendor' : 'Create Vendor'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Service Requests Modal */}
      {showRequestsModal && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Service Requests</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedVendor.businessName} ({selectedVendor.name})</p>
              </div>
              <button onClick={() => { setShowRequestsModal(false); setSelectedVendor(null); }} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Submit New Request */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Submit Request on Behalf</h3>

                {getUnassignedServices().length === 0 ? (
                  <p className="text-sm text-gray-500 italic py-4">All available services are already assigned to this vendor.</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">Select services to request on behalf of this vendor:</p>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3 space-y-2">
                      {getUnassignedServices().map((service) => (
                        <label key={service._id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded border border-slate-100">
                          <input
                            type="checkbox"
                            checked={selectedServicesToRequest.includes(service._id)}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setSelectedServicesToRequest(prev =>
                                checked ? [...prev, service._id] : prev.filter(id => id !== service._id)
                              );
                            }}
                            className="w-4 h-4 text-[#63D64F] border-gray-300 rounded focus:ring-[#63D64F]"
                          />
                          <div>
                            <span className="text-sm text-gray-805 font-semibold block">{service.serviceName}</span>
                            <span className="text-xs text-gray-500 block">{typeof service.category === 'object' ? (service.category?.name || "N/A") : (service.category || "N/A")} • ₹{service.basePrice}</span>
                          </div>
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={handleCreateRequestOnBehalf}
                      disabled={submittingRequest || selectedServicesToRequest.length === 0}
                      className="w-full py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {submittingRequest ? 'Submitting...' : 'Submit Service Request'}
                    </button>
                  </>
                )}
              </div>

              {/* Right Column - Request History */}
              <div className="space-y-4 border-t lg:border-t-0 lg:border-l lg:pl-8 pt-6 lg:pt-0">
                <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Request History</h3>

                {loadingRequests ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#63D64F]"></div>
                  </div>
                ) : vendorRequests.length === 0 ? (
                  <p className="text-sm text-gray-500 italic py-4">No request history found for this vendor.</p>
                ) : (
                  <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                    {vendorRequests.map((req) => (
                      <div key={req._id} className="p-4 rounded-xl border border-gray-200 space-y-3 bg-slate-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs text-gray-500 block">Date: {new Date(req.createdAt).toLocaleDateString()}</span>
                            <span className="text-xs text-gray-500 block">Services: {req.services?.length || 0}</span>
                          </div>
                          <span className={`px-2 py-0.5 text-2xs font-bold rounded-full border uppercase ${req.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                            req.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                              'bg-yellow-100 text-yellow-800 border-yellow-200'
                            }`}>
                            {req.status}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {req.services?.map((s: any) => (
                            <span key={s._id} className="text-3xs px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-700 font-medium">
                              {s.serviceName || 'Service'}
                            </span>
                          ))}
                        </div>

                        {req.adminRemarks && (
                          <div className="text-xs italic bg-white p-2 border rounded-md text-gray-600">
                            "{req.adminRemarks}"
                          </div>
                        )}

                        {req.status === 'pending' && (
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleProcessRequestDirectly(req._id, 'approved')}
                              className="flex-1 py-1 px-3 bg-green-600 text-white rounded text-xs hover:bg-green-700 font-semibold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleProcessRequestDirectly(req._id, 'rejected')}
                              className="flex-1 py-1 px-3 bg-red-600 text-white rounded text-xs hover:bg-red-700 font-semibold"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
              <button
                onClick={() => { setShowRequestsModal(false); setSelectedVendor(null); }}
                className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setShowResetModal(false);
                setResetPasswordVal('');
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Reset Password</h2>
              <p className="text-sm text-gray-600 mb-4">
                Enter a new password for <strong>{resetVendorName}</strong>. The new password will be emailed to <strong>{resetVendorEmail}</strong>.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="text"
                    value={resetPasswordVal}
                    onChange={(e) => setResetPasswordVal(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] outline-none"
                    placeholder="At least 6 characters"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setResetPasswordVal(Math.random().toString(36).substring(2, 10))}
                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg font-semibold transition"
                  >
                    Generate Random Password
                  </button>
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    onClick={() => {
                      setShowResetModal(false);
                      setResetPasswordVal('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetPasswordSubmit}
                    disabled={resetPasswordLoading || !resetPasswordVal || resetPasswordVal.length < 6}
                    className="px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition disabled:opacity-50"
                  >
                    {resetPasswordLoading ? 'Resetting...' : 'Reset & Email'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VendorsPage;
