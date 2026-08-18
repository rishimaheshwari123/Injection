import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { ambassadorAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Wallet, Users, Award, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { updateUserInState } from '../../store/slices/authSlice';

const AmbassadorDashboardPage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [walletDetails, setWalletDetails] = useState<any>({
    walletBalance: 0,
    walletHistory: []
  });
  const [vendors, setVendors] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [walletRes, vendorsRes, meRes] = await Promise.all([
        ambassadorAPI.getWalletHistory(),
        ambassadorAPI.getVendors(),
        ambassadorAPI.getMe()
      ]);

      if (walletRes.data.success) {
        setWalletDetails(walletRes.data.data);
      }
      if (vendorsRes.data.success) {
        setVendors(vendorsRes.data.data);
      }
      if (meRes.data.success) {
        dispatch(updateUserInState(meRes.data.data));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const copyReferralCode = () => {
    if (user?.referralCode) {
      navigator.clipboard.writeText(user.referralCode);
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Metrics calculations
  const totalVendors = vendors.length;
  const verifiedVendors = vendors.filter(v => v.isVerified).length;
  const pendingVendors = vendors.filter(v => !v.isVerified && v.verificationStatus !== 'rejected').length;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3DB9A6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Ambassador Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Hello, {user?.name}. Monitor your referrals, earnings, and wallet rewards.</p>
        </div>
        
        {/* Referral Card */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 shrink-0">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">My Referral Code</span>
            <span className="text-base font-extrabold text-slate-700 tracking-wide">{user?.referralCode}</span>
          </div>
          <button 
            onClick={copyReferralCode}
            className="p-2 bg-white rounded-lg border border-slate-200 hover:bg-slate-150 transition active:scale-95"
            title="Copy referral link"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} className="text-slate-650" />}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-[#63D64F] to-[#3DB9A6] text-white p-6 rounded-2xl shadow-md flex justify-between items-start">
          <div className="flex-1">
            <span className="text-xs font-semibold text-white/80 uppercase tracking-wider block">Wallet Balance</span>
            <span className="text-3xl font-extrabold block mt-2">₹{walletDetails.walletBalance}</span>
            <span className="text-xs text-white/90 mt-2 block font-medium">Verified payout earnings</span>
            <Link
              to="/ambassador/wallet"
              className="mt-4 inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white font-bold text-xs py-1.5 px-3 rounded-lg transition"
            >
              Withdraw / View Wallet &rarr;
            </Link>
          </div>
          <div className="p-3 bg-white/20 rounded-xl">
            <Wallet size={24} />
          </div>
        </div>

        {/* Total Vendors Card */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Registered</span>
            <span className="text-3xl font-extrabold text-slate-800 block mt-2">{totalVendors}</span>
            <span className="text-xs text-slate-500 mt-2 block">Vendors created by you</span>
          </div>
          <div className="p-3 bg-[#3DB9A6]/10 text-[#3DB9A6] rounded-xl">
            <Users size={24} />
          </div>
        </div>

        {/* Verified Vendors */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Verified (Credited)</span>
            <span className="text-3xl font-extrabold text-green-600 block mt-2">{verifiedVendors}</span>
            <span className="text-xs text-slate-500 mt-2 block">₹100 reward credited each</span>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <Award size={24} />
          </div>
        </div>

        {/* Pending Verification */}
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex justify-between items-start">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Approval</span>
            <span className="text-3xl font-extrabold text-amber-500 block mt-2">{pendingVendors}</span>
            <span className="text-xs text-slate-500 mt-2 block">Awaiting admin review</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <Users size={24} />
          </div>
        </div>

      </div>

      {/* Main Grid: Registered Vendors & Wallet History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Registered Vendors Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800">My Registered Vendors</h2>
              <p className="text-xs text-slate-500 mt-0.5">List of service partners registered under your code.</p>
            </div>
            <Link 
              to="/ambassador/register-vendor"
              className="px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white text-xs font-bold rounded-lg hover:shadow-md hover:scale-[1.02] transition"
            >
              + Register Vendor
            </Link>
          </div>

          {vendors.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No vendors registered yet. Use "+ Register Vendor" to add your first partner!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 pr-4">Vendor Info</th>
                    <th className="py-3 px-4">Business Details</th>
                    <th className="py-3 px-4">Phone / City</th>
                    <th className="py-3 pl-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {vendors.map((vendor) => (
                    <tr key={vendor._id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 pr-4">
                        <div className="font-semibold text-slate-800">{vendor.name}</div>
                        <div className="text-xs text-slate-400">{vendor.email}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-700">{vendor.businessName}</div>
                        <div className="text-[10px] font-bold text-[#3DB9A6] bg-[#3DB9A6]/5 px-2 py-0.5 rounded-full inline-block mt-0.5">{vendor.businessType}</div>
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <div className="text-slate-650">{vendor.phone}</div>
                        <div className="text-slate-400 mt-0.5">{vendor.city}, {vendor.state}</div>
                      </td>
                      <td className="py-4 pl-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          vendor.verificationStatus === 'verified'
                            ? 'bg-green-100 text-green-700'
                            : vendor.verificationStatus === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}>
                          {vendor.verificationStatus === 'verified' ? 'Verified' : vendor.verificationStatus === 'rejected' ? 'Rejected' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Wallet History Ledger */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Wallet History</h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time reward payouts transaction log.</p>
          </div>
          <hr className="border-slate-100" />

          {walletDetails.walletHistory.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No transactions recorded.
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {walletDetails.walletHistory.map((history: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-150">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-700 block leading-tight">{history.vendorName}</span>
                    <span className="text-[10px] text-slate-400 block">{new Date(history.date).toLocaleDateString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-extrabold text-[#3DB9A6] block leading-tight">+₹{history.amount}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider inline-block mt-1 ${
                      history.status === 'credited' ? 'text-green-600' : 'text-amber-500'
                    }`}>
                      {history.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default AmbassadorDashboardPage;
