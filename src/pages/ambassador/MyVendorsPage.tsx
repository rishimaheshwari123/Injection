import { useState, useEffect } from 'react';
import { ambassadorAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Users, Award, Clock, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyVendorsPage = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await ambassadorAPI.getVendors();
      if (response.data.success) {
        setVendors(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Search filter
  const filteredVendors = vendors.filter((vendor) => {
    const query = searchQuery.toLowerCase();
    return (
      vendor.name.toLowerCase().includes(query) ||
      vendor.businessName.toLowerCase().includes(query) ||
      vendor.email.toLowerCase().includes(query) ||
      vendor.phone.includes(query) ||
      (vendor.city && vendor.city.toLowerCase().includes(query))
    );
  });

  // Calculations
  const totalCount = vendors.length;
  const verifiedCount = vendors.filter((v) => v.verificationStatus === 'verified').length;
  const pendingCount = totalCount - verifiedCount;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">My Registered Vendors</h1>
          <p className="text-sm text-slate-500 mt-1">Review status, payouts, and details of all partner accounts you registered.</p>
        </div>
        <Link
          to="/ambassador/register-vendor"
          className="px-5 py-2.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white text-xs font-bold rounded-lg hover:shadow-md transition text-center"
        >
          + Add New Vendor
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Registered</span>
            <span className="text-3xl font-extrabold text-slate-800 block mt-1">{totalCount}</span>
          </div>
          <div className="p-3 bg-[#3DB9A6]/10 text-[#3DB9A6] rounded-xl">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Active & Verified</span>
            <span className="text-3xl font-extrabold text-green-600 block mt-1">{verifiedCount}</span>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <Award size={24} />
          </div>
        </div>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Pending Activation</span>
            <span className="text-3xl font-extrabold text-amber-500 block mt-1">{pendingCount}</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-xl">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Search & List */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by owner, business name, phone, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none text-sm transition"
          />
        </div>

        {filteredVendors.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            No registered vendors found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 pr-4">Business Info</th>
                  <th className="py-3 px-4">Owner Name</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">City / Area</th>
                  <th className="py-3 px-4 text-center">Reward Status</th>
                  <th className="py-3 pl-4 text-right">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 pr-4">
                      <div className="font-semibold text-slate-800">{vendor.businessName}</div>
                      <div className="text-[10px] font-bold text-[#3DB9A6] bg-[#3DB9A6]/5 px-2 py-0.5 rounded-full inline-block mt-0.5">{vendor.businessType}</div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-700">
                      {vendor.name}
                    </td>
                    <td className="py-4 px-4 text-xs">
                      <div>{vendor.email}</div>
                      <div className="text-slate-500 mt-0.5">{vendor.phone}</div>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-650">
                      <div>{vendor.city}, {vendor.state}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                        vendor.isAmbassadorCredited
                          ? 'bg-green-50 text-green-700 border border-green-150'
                          : 'bg-amber-50 text-amber-700 border border-amber-150'
                      }`}>
                        {vendor.isAmbassadorCredited ? '₹100 Earned' : 'Awaiting Review'}
                      </span>
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
    </div>
  );
};

export default MyVendorsPage;
