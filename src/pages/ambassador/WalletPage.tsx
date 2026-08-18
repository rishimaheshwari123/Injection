import { useState, useEffect } from 'react';
import { ambassadorAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Wallet, Clock, CheckCircle, Search, ArrowUpRight, ShieldAlert, X } from 'lucide-react';

const WalletPage = () => {
  const [loading, setLoading] = useState(true);
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  const [walletDetails, setWalletDetails] = useState<any>({
    walletBalance: 0,
    walletHistory: []
  });
  const [withdrawalsList, setWithdrawalsList] = useState<any[]>([]);
  
  const [statusFilter, setStatusFilter] = useState<'all' | 'credited' | 'pending'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletRes, withdrawalsRes] = await Promise.all([
        ambassadorAPI.getWalletHistory(),
        ambassadorAPI.getWithdrawals()
      ]);

      if (walletRes.data.success) {
        setWalletDetails(walletRes.data.data);
      }
      if (withdrawalsRes.data.success) {
        setWithdrawalsList(withdrawalsRes.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch wallet information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleWithdrawRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid withdrawal amount');
      return;
    }
    if (amount > walletDetails.walletBalance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    setSubmittingWithdrawal(true);
    try {
      const response = await ambassadorAPI.withdraw(amount);
      if (response.data.success) {
        toast.success(`Withdrawal request for ₹${amount} submitted successfully!`);
        setWithdrawAmount('');
        setShowWithdrawModal(false);
        fetchWalletData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Withdrawal request failed');
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  // Filtering ledger entries
  const filteredHistory = walletDetails.walletHistory.filter((tx: any) => {
    const matchesSearch = tx.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalCredited = walletDetails.walletHistory
    .filter((tx: any) => tx.status === 'credited')
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);

  const totalPending = walletDetails.walletHistory
    .filter((tx: any) => tx.status === 'pending')
    .reduce((sum: number, tx: any) => sum + tx.amount, 0);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3DB9A6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">My Referral Wallet</h1>
          <p className="text-sm text-slate-500 mt-1">Audit your referral reward payouts and withdraw earnings.</p>
        </div>
        <button
          onClick={() => setShowWithdrawModal(true)}
          disabled={walletDetails.walletBalance <= 0}
          className="px-5 py-2.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white text-xs font-bold rounded-lg hover:shadow-md transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
        >
          <ArrowUpRight size={16} /> Request Withdrawal
        </button>
      </div>

      {/* Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance */}
        <div className="bg-gradient-to-br from-[#63D64F] to-[#3DB9A6] text-white p-6 rounded-2xl shadow-md flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider block">Wallet Balance</span>
            <span className="text-4xl font-extrabold block">₹{walletDetails.walletBalance}</span>
            <span className="text-xs text-white/95 font-medium block">Approved instant cashouts available</span>
          </div>
          <div className="p-3 bg-white/20 rounded-xl">
            <Wallet size={26} />
          </div>
        </div>

        {/* Total Earned Payouts */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Credited</span>
            <span className="text-3xl font-extrabold text-green-600 block">₹{totalCredited}</span>
            <span className="text-xs text-slate-500 block">Rewards deposited in bank</span>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <CheckCircle size={26} />
          </div>
        </div>

        {/* Total Pending Payouts */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex justify-between items-start">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Approval</span>
            <span className="text-3xl font-extrabold text-amber-500 block">₹{totalPending}</span>
            <span className="text-xs text-slate-500 block">Awaiting referred vendor activation</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <Clock size={26} />
          </div>
        </div>
      </div>

      {/* Main Grid: Referral History & Withdrawal Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Referral Payouts Ledger (Left 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Referral Payouts Ledger</h2>
              <p className="text-xs text-slate-500 mt-0.5">List of reward payouts linked to vendor registration referrals.</p>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              {(['all', 'credited', 'pending'] as const).map((filter) => (
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

          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search by vendor name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none text-sm transition"
            />
          </div>

          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No transactions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 pr-4">Transaction Date</th>
                    <th className="py-3 px-4">Vendor Partner</th>
                    <th className="py-3 px-4 text-center">Reward Type</th>
                    <th className="py-3 px-4 text-center">Payout Status</th>
                    <th className="py-3 pl-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredHistory.map((tx: any, index: number) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 pr-4 text-slate-550 text-xs">
                        {new Date(tx.date).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 font-semibold text-slate-800">
                        {tx.vendorName}
                      </td>
                      <td className="py-4 px-4 text-center text-xs text-slate-600">
                        Referral Bonus
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          tx.status === 'credited' ? 'bg-green-100 text-green-700' : 'bg-amber-105 text-amber-700'
                        }`}>
                          {tx.status === 'credited' ? 'Credited' : 'Pending Verification'}
                        </span>
                      </td>
                      <td className="py-4 pl-4 text-right font-extrabold text-[#3DB9A6]">
                        +₹{tx.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Withdrawal Requests Ledger (Right 1 column) */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Withdrawals History</h2>
            <p className="text-xs text-slate-500 mt-0.5">Logs of your wallet withdrawal request processing.</p>
          </div>
          <hr className="border-slate-100" />

          {withdrawalsList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No withdrawals requested yet.
            </div>
          ) : (
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {withdrawalsList.map((req: any, index: number) => (
                <div key={req._id || index} className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="text-xs text-slate-450 block">{new Date(req.date).toLocaleDateString()}</span>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block ${
                        req.status === 'completed'
                          ? 'bg-green-100 text-green-750'
                          : req.status === 'cancelled'
                            ? 'bg-red-100 text-red-750'
                            : 'bg-amber-100 text-amber-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                    <span className="text-base font-extrabold text-slate-800">
                      ₹{req.amount}
                    </span>
                  </div>

                  {req.notes && (
                    <div className="text-[11px] bg-white border border-slate-200 rounded-lg p-2.5 text-slate-600 leading-relaxed font-medium">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Admin Note:</span>
                      {req.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Withdrawal Request Dialog Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/45 z-55 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-5 shadow-2xl relative animate-fadeIn">
            <button
              onClick={() => setShowWithdrawModal(false)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition"
            >
              <X size={18} />
            </button>

            <div>
              <h2 className="text-lg font-bold text-slate-800">Withdraw Referral Balance</h2>
              <p className="text-xs text-slate-500 mt-1">Cash out approved rewards. Funds will be settled directly to your registered UPI ID or Bank Details.</p>
            </div>

            <div className="bg-amber-50 border border-amber-250 rounded-xl p-3 text-xs text-amber-700 flex gap-2">
              <ShieldAlert className="shrink-0" size={16} />
              <div>
                Deducted immediately from balance. If cancelled by administration, the balance will be refunded.
              </div>
            </div>

            <form onSubmit={handleWithdrawRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Available Balance: ₹{walletDetails.walletBalance}</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-extrabold text-lg">₹</span>
                  <input
                    type="number"
                    required
                    min={1}
                    max={walletDetails.walletBalance}
                    placeholder="Enter cashout amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#3DB9A6] outline-none text-base font-bold text-slate-800"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-550 hover:bg-slate-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingWithdrawal || !withdrawAmount || Number(withdrawAmount) <= 0 || Number(withdrawAmount) > walletDetails.walletBalance}
                  className="px-5 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white text-xs font-bold rounded-lg hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submittingWithdrawal ? 'Requesting...' : 'Request Cashout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default WalletPage;
