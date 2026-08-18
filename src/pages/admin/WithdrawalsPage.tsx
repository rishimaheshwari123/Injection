import { useState, useEffect } from 'react';
import { ambassadorAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Wallet, Search, CheckCircle, XCircle, Clock, X, ShieldAlert, ArrowUpRight } from 'lucide-react';

const AdminWithdrawalsPage = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

  // Modal State
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [processingStatus, setProcessingStatus] = useState<'completed' | 'cancelled'>('completed');
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const response = await ambassadorAPI.adminGetWithdrawals();
      if (response.data.success) {
        setRequests(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleProcessRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      const response = await ambassadorAPI.adminUpdateWithdrawal(
        selectedRequest.ambassador._id,
        selectedRequest.requestId,
        processingStatus,
        adminNotes
      );

      if (response.data.success) {
        toast.success(`Withdrawal request marked as ${processingStatus} successfully!`);
        setSelectedRequest(null);
        setAdminNotes('');
        fetchWithdrawals();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process request');
    } finally {
      setProcessing(false);
    }
  };

  // Filters
  const filteredRequests = requests.filter((req) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      req.ambassador.name.toLowerCase().includes(query) ||
      req.ambassador.email.toLowerCase().includes(query) ||
      (req.ambassador.ambassadorId && req.ambassador.ambassadorId.toLowerCase().includes(query)) ||
      (req.ambassador.upiId && req.ambassador.upiId.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate metrics
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const completedCount = requests.filter((r) => r.status === 'completed').length;
  const cancelledCount = requests.filter((r) => r.status === 'cancelled').length;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3DB9A6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[95vw] mx-auto p-4 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Wallet Withdrawals Management</h1>
        <p className="text-sm text-slate-500 mt-1">Review referral balance cashout requests, audit bank / UPI credentials, and approve payouts.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Requests</span>
            <span className="text-3xl font-extrabold text-slate-800 block mt-1">{totalCount}</span>
          </div>
          <div className="p-3 bg-slate-50 text-slate-650 rounded-xl">
            <Wallet size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Approval</span>
            <span className="text-3xl font-extrabold text-amber-500 block mt-1">{pendingCount}</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <Clock size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Completed Payouts</span>
            <span className="text-3xl font-extrabold text-green-600 block mt-1">{completedCount}</span>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle size={22} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cancelled / Refunded</span>
            <span className="text-3xl font-extrabold text-red-650 block mt-1">{cancelledCount}</span>
          </div>
          <div className="p-3 bg-red-50 text-red-650 rounded-xl">
            <XCircle size={22} />
          </div>
        </div>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b pb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by ID, Ambassador name, UPI..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none text-sm transition"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2">
            {(['all', 'pending', 'completed', 'cancelled'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                  statusFilter === filter
                    ? 'bg-[#3DB9A6] text-white'
                    : 'bg-slate-50 text-slate-650 hover:bg-slate-100'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No withdrawal requests match the selection.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 pr-4">Request Date</th>
                  <th className="py-3 px-4">Ambassador Details</th>
                  <th className="py-3 px-4">Bank / UPI Credentials</th>
                  <th className="py-3 px-4 text-center">Cashout Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredRequests.map((req) => (
                  <tr key={req.requestId} className="hover:bg-slate-55/50 transition">
                    <td className="py-4 pr-4 text-xs text-slate-500">
                      {new Date(req.date).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800">{req.ambassador.name}</div>
                      <div className="text-xs text-slate-400">ID: {req.ambassador.ambassadorId || 'PENDING'}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{req.ambassador.phone}</div>
                    </td>
                    <td className="py-4 px-4 text-xs">
                      {req.ambassador.upiId ? (
                        <div>
                          <span className="text-slate-400 block mb-0.5">UPI ID:</span>
                          <span className="font-extrabold text-[#3DB9A6] bg-[#3DB9A6]/5 px-2 py-0.5 rounded border border-[#3DB9A6]/20">{req.ambassador.upiId}</span>
                        </div>
                      ) : req.ambassador.bankDetails?.accountNumber ? (
                        <div className="space-y-0.5 text-slate-650">
                          <div><span className="text-slate-400">Ac Name:</span> {req.ambassador.bankDetails.accountHolderName}</div>
                          <div><span className="text-slate-400">Ac No:</span> {req.ambassador.bankDetails.accountNumber} ({req.ambassador.bankDetails.bankName})</div>
                          <div><span className="text-slate-400">IFSC:</span> {req.ambassador.bankDetails.ifscCode}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No payout details provided</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center font-extrabold text-slate-850 text-base">
                      ₹{req.amount}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        req.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : req.status === 'cancelled'
                            ? 'bg-red-100 text-red-750'
                            : 'bg-amber-100 text-amber-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      {req.status === 'pending' ? (
                        <button
                          onClick={() => {
                            setSelectedRequest(req);
                            setProcessingStatus('completed');
                            setAdminNotes('');
                          }}
                          className="px-3.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-650 text-xs font-bold transition flex items-center gap-1.5 ml-auto active:scale-95"
                        >
                          <ArrowUpRight size={14} className="text-[#3DB9A6]" /> Process Payout
                        </button>
                      ) : (
                        <div className="text-xs text-slate-400 max-w-[200px] ml-auto truncate font-medium" title={req.notes}>
                          Note: {req.notes || 'N/A'}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Process Payout Dialog Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition"
            >
              <X size={18} />
            </button>

            <div>
              <h2 className="text-lg font-bold text-slate-800">Process Withdrawal request</h2>
              <p className="text-xs text-slate-500 mt-1">Update status for ₹{selectedRequest.amount} cashout requested by {selectedRequest.ambassador.name}.</p>
            </div>

            {/* Account Audit Details */}
            <div className="bg-slate-50 border rounded-xl p-4 text-xs space-y-2">
              <span className="font-bold text-slate-400 uppercase tracking-wider block">Ambassador Payout Details</span>
              {selectedRequest.ambassador.upiId ? (
                <div><span className="text-slate-500 font-semibold">UPI Address:</span> <span className="font-bold text-slate-800">{selectedRequest.ambassador.upiId}</span></div>
              ) : null}
              {selectedRequest.ambassador.bankDetails?.accountNumber ? (
                <div className="space-y-1 mt-1 pt-1 border-t">
                  <div><span className="text-slate-500 font-semibold">Beneficiary Account Name:</span> {selectedRequest.ambassador.bankDetails.accountHolderName}</div>
                  <div><span className="text-slate-500 font-semibold">Bank Name:</span> {selectedRequest.ambassador.bankDetails.bankName}</div>
                  <div><span className="text-slate-500 font-semibold">Account Number:</span> <span className="font-bold text-slate-800">{selectedRequest.ambassador.bankDetails.accountNumber}</span></div>
                  <div><span className="text-slate-500 font-semibold">IFSC Code:</span> <span className="font-bold text-slate-800">{selectedRequest.ambassador.bankDetails.ifscCode}</span></div>
                </div>
              ) : null}
            </div>

            <form onSubmit={handleProcessRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payout Action *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProcessingStatus('completed')}
                    className={`p-3 border rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                      processingStatus === 'completed'
                        ? 'border-green-500 bg-green-50/50 text-green-700'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-650'
                    }`}
                  >
                    <CheckCircle size={18} />
                    Complete payout
                  </button>
                  <button
                    type="button"
                    onClick={() => setProcessingStatus('cancelled')}
                    className={`p-3 border rounded-xl text-xs font-bold flex flex-col items-center gap-1 transition ${
                      processingStatus === 'cancelled'
                        ? 'border-red-500 bg-red-50/50 text-red-700'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-650'
                    }`}
                  >
                    <XCircle size={18} />
                    Cancel & Refund
                  </button>
                </div>
              </div>

              {processingStatus === 'cancelled' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[11px] text-red-750 flex gap-2">
                  <ShieldAlert className="shrink-0" size={15} />
                  <div>
                    Cancelling this withdrawal request will automatically credit the amount (₹{selectedRequest.amount}) back to the Ambassador's wallet.
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Custom Remarks / Notes</label>
                <textarea
                  required={processingStatus === 'cancelled'}
                  rows={3}
                  placeholder={processingStatus === 'completed' ? 'e.g. UPI Ref No: 618729381203 settled.' : 'Provide details regarding withdrawal rejection...'}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3DB9A6] outline-none text-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 border rounded-lg text-slate-550 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className={`px-5 py-2 text-white text-xs font-bold rounded-lg hover:shadow-md transition disabled:opacity-50 ${
                    processingStatus === 'completed'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {processing ? 'Processing...' : 'Submit Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminWithdrawalsPage;
