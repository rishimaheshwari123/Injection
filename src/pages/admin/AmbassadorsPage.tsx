import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ambassadorAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Users, UserCheck, UserX, Search, Eye } from 'lucide-react';

const AdminAmbassadorsPage = () => {
  const [ambassadors, setAmbassadors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAmbassadors = async () => {
    try {
      setLoading(true);
      const response = await ambassadorAPI.adminGetAll();
      if (response.data.success) {
        setAmbassadors(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch Ambassadors list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmbassadors();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await ambassadorAPI.adminToggleStatus(id);
      if (response.data.success) {
        toast.success(`Ambassador account has been ${!currentStatus ? 'Activated' : 'Deactivated'} successfully!`);
        fetchAmbassadors();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update Ambassador status');
    }
  };

  // Search filtering
  const filteredAmbassadors = ambassadors.filter((amb) => {
    const query = searchQuery.toLowerCase();
    return (
      amb.name.toLowerCase().includes(query) ||
      amb.email.toLowerCase().includes(query) ||
      amb.phone.includes(query) ||
      (amb.ambassadorId && amb.ambassadorId.toLowerCase().includes(query)) ||
      (amb.referralCode && amb.referralCode.toLowerCase().includes(query))
    );
  });

  // Calculate metrics
  const totalAmbassadors = ambassadors.length;
  const activeCount = ambassadors.filter((a) => a.isActive).length;
  const inactiveCount = totalAmbassadors - activeCount;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3DB9A6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[95vw] mx-auto p-4">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Ambassador Management</h1>
        <p className="text-sm text-slate-500 mt-1">Review registrations, activate logins, track wallets, and audit associated vendors.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Ambassadors</span>
            <span className="text-3xl font-extrabold text-slate-800 block mt-1">{totalAmbassadors}</span>
          </div>
          <div className="p-3 bg-[#3DB9A6]/10 text-[#3DB9A6] rounded-xl">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active Accounts</span>
            <span className="text-3xl font-extrabold text-green-600 block mt-1">{activeCount}</span>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending / Inactive</span>
            <span className="text-3xl font-extrabold text-amber-500 block mt-1">{inactiveCount}</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <UserX size={24} />
          </div>
        </div>
      </div>

      {/* Controls: Search & List */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, name, email, phone..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none text-sm transition"
            />
          </div>
        </div>

        {filteredAmbassadors.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No Ambassadors found matching the query.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 pr-4">Ambassador ID</th>
                  <th className="py-3 px-4">Personal Info</th>
                  <th className="py-3 px-4">Location & Target Area</th>
                  <th className="py-3 px-4">Wallet Balance</th>
                  <th className="py-3 px-4 text-center">Referral Code</th>
                  <th className="py-3 px-4 text-center">Vendors</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAmbassadors.map((amb) => (
                  <tr key={amb._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 pr-4 font-bold text-slate-800">
                      {amb.ambassadorId || 'PENDING'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-slate-800">{amb.name}</div>
                      <div className="text-xs text-slate-400">{amb.email}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{amb.phone}</div>
                    </td>
                    <td className="py-4 px-4 text-xs">
                      <div className="font-semibold text-slate-700">{amb.city}, {amb.state}</div>
                      <div className="text-slate-400 mt-0.5">Covering: {amb.areaCovered}</div>
                    </td>
                    <td className="py-4 px-4 font-extrabold text-slate-800">
                      ₹{amb.walletBalance || 0}
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-[#3DB9A6]">
                      {amb.referralCode}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-0.5 bg-[#3DB9A6]/10 text-[#3DB9A6] rounded-full text-xs font-bold">
                        {amb.vendorCount || 0}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        amb.isActive 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {amb.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right space-x-2 shrink-0">
                      <Link
                        to={`/admin/ambassadors/${amb._id}`}
                        className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-650 inline-flex items-center gap-1 text-xs font-semibold"
                        title="View Details"
                      >
                        <Eye size={14} /> View Details
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(amb._id, amb.isActive)}
                        className={`p-1.5 rounded-lg text-xs font-bold text-white inline-flex items-center gap-1 ${
                          amb.isActive
                            ? 'bg-red-500 hover:bg-red-650'
                            : 'bg-green-500 hover:bg-green-650'
                        }`}
                      >
                        {amb.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAmbassadorsPage;
