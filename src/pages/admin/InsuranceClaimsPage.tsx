import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';

interface InsuranceClaim {
  _id: string;
  claimNumber: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  patientName: string;
  patientAge: number;
  patientGender: string;
  contactNumber: string;
  email: string;
  insuranceProvider: string;
  policyNumber: string;
  claimType: string;
  claimAmount: number;
  treatmentDate: string;
  diagnosis: string;
  description: string;
  documents: Array<{ name: string; url: string; uploadedAt: string }>;
  status: string;
  adminNotes: string;
  rejectionReason: string;
  approvedAmount: number;
  createdBy: string;
  processedBy?: { name: string };
  processedAt?: string;
  createdAt: string;
}

const InsuranceClaimsPage: React.FC = () => {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    userId: '',
    claimNumber: '',
    patientName: '',
    patientAge: '',
    patientGender: 'Male',
    contactNumber: '',
    email: '',
    insuranceProvider: '',
    policyNumber: '',
    claimType: 'Diagnostic Tests',
    claimAmount: '',
    treatmentDate: '',
    diagnosis: '',
    description: '',
    createdBy: 'Admin'
  });

  const [statusUpdateData, setStatusUpdateData] = useState({
    status: '',
    adminNotes: '',
    rejectionReason: '',
    approvedAmount: ''
  });

  useEffect(() => {
    fetchClaims();
    fetchUsers();
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await api.get('/insurance/claims', {
        params: { status: statusFilter, search: searchTerm }
      });
      setClaims(response.data.claims);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch claims');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users');
    }
  };

  const handleUserSelect = (userId: string) => {
    const selectedUser = users.find(user => user._id === userId);
    if (selectedUser) {
      setFormData({
        ...formData,
        userId: userId,
        patientName: selectedUser.name || '',
        patientAge: selectedUser.age?.toString() || '',
        patientGender: selectedUser.gender || 'Male',
        contactNumber: selectedUser.phone || '',
        email: selectedUser.email || ''
      });
    } else {
      setFormData({
        ...formData,
        userId: userId
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/insurance/claims', formData);
      toast.success('Insurance claim created successfully');
      setShowModal(false);
      resetForm();
      fetchClaims();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create claim');
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaim) return;

    try {
      await api.put(`/insurance/claims/${selectedClaim._id}/status`, statusUpdateData);
      toast.success('Claim status updated successfully');
      setShowStatusModal(false);
      setSelectedClaim(null);
      fetchClaims();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      claimNumber: '',
      patientName: '',
      patientAge: '',
      patientGender: 'Male',
      contactNumber: '',
      email: '',
      insuranceProvider: '',
      policyNumber: '',
      claimType: 'Diagnostic Tests',
      claimAmount: '',
      treatmentDate: '',
      diagnosis: '',
      description: '',
      createdBy: 'Admin'
    });
  };

  const openStatusModal = (claim: InsuranceClaim) => {
    setSelectedClaim(claim);
    setStatusUpdateData({
      status: claim.status,
      adminNotes: claim.adminNotes || '',
      rejectionReason: claim.rejectionReason || '',
      approvedAmount: claim.approvedAmount?.toString() || ''
    });
    setShowStatusModal(true);
    setOpenDropdownId(null);
  };

  const openViewModal = (claim: InsuranceClaim) => {
    setSelectedClaim(claim);
    setShowViewModal(true);
    setOpenDropdownId(null);
  };

  const toggleDropdown = (claimId: string) => {
    setOpenDropdownId(openDropdownId === claimId ? null : claimId);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Under Review': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'More Info Required': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 max-w-[78vw]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Insurance Claims Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Create Claim (On Behalf)
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="All">All Claims</option>
              <option value="Pending">Pending</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="More Info Required">More Info Required</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by claim number, patient name, policy..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Claims Table */}
<div className="bg-white rounded-lg shadow max-w-[78vw] w-full overflow-x-auto">      {loading ? (
          <div className="p-8 text-center">Loading claims...</div>
        ) : claims.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No claims found</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Claim #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {claims.map((claim) => (
                  <tr key={claim._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{claim.claimNumber}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{claim.patientName}</div>
                      <div className="text-sm text-gray-500">{claim.contactNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{claim.userId?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{claim.userId?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{claim.claimType}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">₹{claim.claimAmount.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(claim.status)}`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{claim.createdBy}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm relative">
                      <button
                        onClick={() => toggleDropdown(claim._id)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      
                      {openDropdownId === claim._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                          <div className="py-1">
                            <button
                              onClick={() => openViewModal(claim)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Details
                            </button>
                            <button
                              onClick={() => openStatusModal(claim)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Update Status
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        )}
      </div>

      {/* Create Claim Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Create Insurance Claim (On Behalf of User)</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Select User *</label>
                    <select
                      required
                      value={formData.userId}
                      onChange={(e) => handleUserSelect(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="">Select User</option>
                      {users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name} - {user.email}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Patient Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.patientName}
                      onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Patient Age *</label>
                    <input
                      type="number"
                      required
                      value={formData.patientAge}
                      onChange={(e) => setFormData({ ...formData, patientAge: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Gender *</label>
                    <select
                      required
                      value={formData.patientGender}
                      onChange={(e) => setFormData({ ...formData, patientGender: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Contact Number *</label>
                    <input
                      type="tel"
                      required
                      value={formData.contactNumber}
                      onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Insurance Provider *</label>
                    <input
                      type="text"
                      required
                      value={formData.insuranceProvider}
                      onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="e.g., HDFC ERGO, Star Health"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Policy Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.policyNumber}
                      onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Claim Number *</label>
                    <input
                      type="text"
                      required
                      value={formData.claimNumber}
                      onChange={(e) => setFormData({ ...formData, claimNumber: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      placeholder="e.g., CLM2024001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Claim Type *</label>
                    <select
                      required
                      value={formData.claimType}
                      onChange={(e) => setFormData({ ...formData, claimType: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="Hospitalization">Hospitalization</option>
                      <option value="Diagnostic Tests">Diagnostic Tests</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Consultation">Consultation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Claim Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      value={formData.claimAmount}
                      onChange={(e) => setFormData({ ...formData, claimAmount: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Treatment Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.treatmentDate}
                      onChange={(e) => setFormData({ ...formData, treatmentDate: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Diagnosis *</label>
                  <input
                    type="text"
                    required
                    value={formData.diagnosis}
                    onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    placeholder="e.g., Fever, Blood Test"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Provide detailed description of the claim"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Claim
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Update Claim Status</h2>
                <button onClick={() => setShowStatusModal(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">Claim #:</span> {selectedClaim.claimNumber}</div>
                  <div><span className="font-medium">Patient:</span> {selectedClaim.patientName}</div>
                  <div><span className="font-medium">Amount:</span> ₹{selectedClaim.claimAmount.toLocaleString()}</div>
                  <div><span className="font-medium">Type:</span> {selectedClaim.claimType}</div>
                </div>
              </div>

              <form onSubmit={handleStatusUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status *</label>
                  <select
                    required
                    value={statusUpdateData.status}
                    onChange={(e) => setStatusUpdateData({ ...statusUpdateData, status: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="">Select Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                    <option value="More Info Required">More Info Required</option>
                  </select>
                </div>

                {statusUpdateData.status === 'Approved' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Approved Amount (₹) *</label>
                    <input
                      type="number"
                      required
                      value={statusUpdateData.approvedAmount}
                      onChange={(e) => setStatusUpdateData({ ...statusUpdateData, approvedAmount: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                )}

                {statusUpdateData.status === 'Rejected' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Rejection Reason *</label>
                    <textarea
                      required
                      value={statusUpdateData.rejectionReason}
                      onChange={(e) => setStatusUpdateData({ ...statusUpdateData, rejectionReason: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      rows={3}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-1">Admin Notes</label>
                  <textarea
                    value={statusUpdateData.adminNotes}
                    onChange={(e) => setStatusUpdateData({ ...statusUpdateData, adminNotes: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Add any internal notes..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Update Status
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Claim Details Modal */}
      {showViewModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Claim Details</h2>
                <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Claim Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Claim Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Claim Number</p>
                      <p className="font-medium text-gray-900">{selectedClaim.claimNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <span className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(selectedClaim.status)}`}>
                        {selectedClaim.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Claim Type</p>
                      <p className="font-medium text-gray-900">{selectedClaim.claimType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Claim Amount</p>
                      <p className="font-medium text-gray-900">₹{selectedClaim.claimAmount.toLocaleString()}</p>
                    </div>
                    {selectedClaim.approvedAmount > 0 && (
                      <div>
                        <p className="text-sm text-gray-600">Approved Amount</p>
                        <p className="font-medium text-green-600">₹{selectedClaim.approvedAmount.toLocaleString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Treatment Date</p>
                      <p className="font-medium text-gray-900">{new Date(selectedClaim.treatmentDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Patient Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Patient Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Patient Name</p>
                      <p className="font-medium text-gray-900">{selectedClaim.patientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Age</p>
                      <p className="font-medium text-gray-900">{selectedClaim.patientAge} years</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Gender</p>
                      <p className="font-medium text-gray-900">{selectedClaim.patientGender}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Contact Number</p>
                      <p className="font-medium text-gray-900">{selectedClaim.contactNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium text-gray-900">{selectedClaim.email}</p>
                    </div>
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Insurance Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Insurance Provider</p>
                      <p className="font-medium text-gray-900">{selectedClaim.insuranceProvider}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Policy Number</p>
                      <p className="font-medium text-gray-900">{selectedClaim.policyNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Medical Information */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Medical Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Diagnosis</p>
                      <p className="font-medium text-gray-900">{selectedClaim.diagnosis}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Description</p>
                      <p className="font-medium text-gray-900">{selectedClaim.description}</p>
                    </div>
                  </div>
                </div>

                {/* User Information */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">User Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">User Name</p>
                      <p className="font-medium text-gray-900">{selectedClaim.userId?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">User Email</p>
                      <p className="font-medium text-gray-900">{selectedClaim.userId?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">User Phone</p>
                      <p className="font-medium text-gray-900">{selectedClaim.userId?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Created By</p>
                      <p className="font-medium text-gray-900">{selectedClaim.createdBy}</p>
                    </div>
                  </div>
                </div>

                {/* Admin Notes & Processing Info */}
                {(selectedClaim.adminNotes || selectedClaim.rejectionReason || selectedClaim.processedBy) && (
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Admin Information</h3>
                    <div className="space-y-3">
                      {selectedClaim.adminNotes && (
                        <div>
                          <p className="text-sm text-gray-600">Admin Notes</p>
                          <p className="font-medium text-gray-900">{selectedClaim.adminNotes}</p>
                        </div>
                      )}
                      {selectedClaim.rejectionReason && (
                        <div>
                          <p className="text-sm text-gray-600">Rejection Reason</p>
                          <p className="font-medium text-red-600">{selectedClaim.rejectionReason}</p>
                        </div>
                      )}
                      {selectedClaim.processedBy && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Processed By</p>
                            <p className="font-medium text-gray-900">{selectedClaim.processedBy.name}</p>
                          </div>
                          {selectedClaim.processedAt && (
                            <div>
                              <p className="text-sm text-gray-600">Processed At</p>
                              <p className="font-medium text-gray-900">
                                {new Date(selectedClaim.processedAt).toLocaleString()}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="bg-gray-100 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Created At</p>
                      <p className="font-medium text-gray-900">{new Date(selectedClaim.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-6 border-t">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    openStatusModal(selectedClaim);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsuranceClaimsPage;
