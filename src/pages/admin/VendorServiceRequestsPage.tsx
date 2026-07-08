import { useState, useEffect } from 'react';
import { vendorServiceRequestAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Search, Check, X, Eye, ClipboardList } from 'lucide-react';

interface VendorServiceRequest {
  _id: string;
  vendor: {
    _id: string;
    name: string;
    businessName: string;
    email: string;
    phone: string;
    vendorId?: string;
  };
  services: Array<{
    _id: string;
    serviceName: string;
    category: string;
    basePrice: number;
    duration: number;
  }>;
  status: 'pending' | 'approved' | 'rejected';
  adminRemarks?: string;
  processedAt?: string;
  processedBy?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function VendorServiceRequestsPage() {
  const [requests, setRequests] = useState<VendorServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<VendorServiceRequest | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [processData, setProcessData] = useState({
    status: '' as 'approved' | 'rejected' | '',
    adminRemarks: ''
  });

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter !== 'All') {
        params.status = statusFilter.toLowerCase();
      }
      const response = await vendorServiceRequestAPI.getAllRequests(params);
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch service requests');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !processData.status) return;

    try {
      const response = await vendorServiceRequestAPI.processRequest(
        selectedRequest._id,
        processData.status,
        processData.adminRemarks
      );
      if (response.data.success) {
        toast.success(`Request successfully ${processData.status}!`);
        setShowProcessModal(false);
        setSelectedRequest(null);
        setProcessData({ status: '', adminRemarks: '' });
        fetchRequests();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process request');
    }
  };

  const openProcessModal = (req: VendorServiceRequest, status: 'approved' | 'rejected') => {
    setSelectedRequest(req);
    setProcessData({
      status,
      adminRemarks: ''
    });
    setShowProcessModal(true);
  };

  const openViewModal = (req: VendorServiceRequest) => {
    setSelectedRequest(req);
    setShowViewModal(true);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'approved': 'bg-green-100 text-green-800 border-green-200',
      'rejected': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredRequests = requests.filter(req => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      req.vendor?.name?.toLowerCase().includes(term) ||
      req.vendor?.businessName?.toLowerCase().includes(term) ||
      req.vendor?.email?.toLowerCase().includes(term) ||
      req.vendor?.phone?.includes(term) ||
      req.vendor?.vendorId?.toLowerCase().includes(term) ||
      req.services?.some(s => s.serviceName.toLowerCase().includes(term))
    );
  });

  return (
    <div className="p-6 max-w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] bg-clip-text text-transparent">
          Vendor Service Requests
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-md border border-slate-100 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by Vendor ID, vendor, business, service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <div className="flex rounded-lg border p-1 bg-gray-50">
            {['All', 'Pending', 'Approved', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#63D64F]"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading requests...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md border border-slate-100 overflow-hidden">
          {filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium">
              <ClipboardList size={48} className="mx-auto text-gray-300 mb-4" />
              No service requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Vendor Info</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Requested Services</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        {req.vendor?.vendorId && (
                          <div className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#e6f9e2] text-[#338024] border border-[#d2f4cc] mb-1">
                            {req.vendor.vendorId}
                          </div>
                        )}
                        <div className="text-sm font-semibold text-gray-900">{req.vendor?.businessName}</div>
                        <div className="text-sm text-gray-600">{req.vendor?.name}</div>
                        <div className="text-xs text-gray-500">{req.vendor?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-md">
                          {req.services?.map((s) => (
                            <span key={s._id} className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs border border-green-200 font-medium">
                              {s.serviceName}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusColor(req.status)}`}>
                          {req.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openViewModal(req)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          
                          {req.status === 'pending' && (
                            <>
                              <button
                                onClick={() => openProcessModal(req, 'approved')}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-green-200"
                                title="Approve Request"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={() => openProcessModal(req, 'rejected')}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                                title="Reject Request"
                              >
                                <X size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Process Request Modal */}
      {showProcessModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">
                {processData.status === 'approved' ? 'Approve Service Request' : 'Reject Service Request'}
              </h2>
              <button onClick={() => setShowProcessModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleProcessRequest} className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-2 text-sm text-gray-700">
                <div><span className="font-semibold text-gray-900">Vendor:</span> {selectedRequest.vendor?.businessName} ({selectedRequest.vendor?.name})</div>
                <div>
                  <span className="font-semibold text-gray-900">Requested Services:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedRequest.services?.map(s => (
                      <span key={s._id} className="px-2 py-0.5 rounded bg-green-50 text-green-700 text-xs border border-green-150 font-semibold">{s.serviceName}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">
                  Admin Remarks {processData.status === 'rejected' ? '*' : '(Optional)'}
                </label>
                <textarea
                  value={processData.adminRemarks}
                  onChange={(e) => setProcessData({ ...processData, adminRemarks: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#63D64F] outline-none"
                  rows={4}
                  placeholder={processData.status === 'approved' ? "Add any approval notes..." : "Enter reason for rejection..."}
                  required={processData.status === 'rejected'}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProcessModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white rounded-lg font-medium text-sm transition-colors shadow-md ${
                    processData.status === 'approved'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Confirm {processData.status === 'approved' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Request Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Vendor Info */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Vendor Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <span className="text-gray-500 block">Business Name</span>
                    <span className="font-semibold text-gray-900">{selectedRequest.vendor?.businessName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Owner Name</span>
                    <span className="font-semibold text-gray-900">{selectedRequest.vendor?.name}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Email Address</span>
                    <span className="font-medium text-gray-900">{selectedRequest.vendor?.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Phone Number</span>
                    <span className="font-medium text-gray-900">{selectedRequest.vendor?.phone}</span>
                  </div>
                </div>
              </div>

              {/* Services List */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Requested Services ({selectedRequest.services?.length})</h3>
                <div className="space-y-2">
                  {selectedRequest.services?.map((s) => (
                    <div key={s._id} className="p-3 bg-white rounded-lg border border-gray-150 flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-gray-900 block text-sm">{s.serviceName}</span>
                        <span className="text-xs text-gray-500">{s.category} • {s.duration} mins</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-green-600 block text-sm">₹{s.basePrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Process Status */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Processing Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div>
                    <span className="text-gray-500 block">Request Status</span>
                    <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full border mt-1 uppercase ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Created At</span>
                    <span className="font-medium text-gray-900">{new Date(selectedRequest.createdAt).toLocaleString()}</span>
                  </div>
                  {selectedRequest.status !== 'pending' && (
                    <>
                      <div>
                        <span className="text-gray-500 block">Processed At</span>
                        <span className="font-medium text-gray-900">
                          {selectedRequest.processedAt ? new Date(selectedRequest.processedAt).toLocaleString() : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Processed By</span>
                        <span className="font-medium text-gray-900">{selectedRequest.processedBy?.name || 'N/A'}</span>
                      </div>
                    </>
                  )}
                </div>

                {selectedRequest.adminRemarks && (
                  <div className="pt-2 border-t text-sm">
                    <span className="text-gray-500 block font-semibold">Admin Remarks</span>
                    <p className="text-gray-800 bg-white p-2.5 border rounded-lg mt-1 italic whitespace-pre-wrap">
                      "{selectedRequest.adminRemarks}"
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-2">
              {selectedRequest.status === 'pending' && (
                <>
                  <button
                    onClick={() => { setShowViewModal(false); openProcessModal(selectedRequest, 'rejected'); }}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 font-medium text-sm transition-colors"
                  >
                    Reject Request
                  </button>
                  <button
                    onClick={() => { setShowViewModal(false); openProcessModal(selectedRequest, 'approved'); }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm transition-colors shadow-md"
                  >
                    Approve Request
                  </button>
                </>
              )}
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
