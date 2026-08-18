import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ambassadorAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { ChevronLeft, User, MapPin, Briefcase, CreditCard, FileText, CheckCircle, XCircle } from 'lucide-react';

const AmbassadorDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [ambassador, setAmbassador] = useState<any | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingVendors, setLoadingVendors] = useState(true);

  const fetchAmbassadorData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const response = await ambassadorAPI.adminGetById(id);
      if (response.data.success) {
        setAmbassador(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch Ambassador details');
      navigate('/admin/ambassadors');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorsData = async () => {
    if (!id) return;
    try {
      setLoadingVendors(true);
      const response = await ambassadorAPI.adminGetVendors(id);
      if (response.data.success) {
        setVendors(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch registered vendors');
    } finally {
      setLoadingVendors(false);
    }
  };

  useEffect(() => {
    fetchAmbassadorData();
    fetchVendorsData();
  }, [id]);

  const handleToggleStatus = async () => {
    if (!ambassador) return;
    try {
      const response = await ambassadorAPI.adminToggleStatus(ambassador._id);
      if (response.data.success) {
        toast.success(`Ambassador status updated to ${!ambassador.isActive ? 'Active' : 'Inactive'}`);
        setAmbassador((prev: any) => ({ ...prev, isActive: !prev.isActive }));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle Ambassador status');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3DB9A6]"></div>
      </div>
    );
  }

  if (!ambassador) return null;

  return (
    <div className="space-y-6 max-w-[95vw] mx-auto p-4 animate-fadeIn">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => navigate('/admin/ambassadors')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-bold text-sm"
        >
          <ChevronLeft size={18} /> Back to Ambassador Management
        </button>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            ambassador.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {ambassador.isActive ? 'Active Account' : 'Inactive / Pending'}
          </span>
          <button
            onClick={handleToggleStatus}
            className={`px-4 py-2 rounded-lg text-xs font-extrabold text-white transition ${
              ambassador.isActive
                ? 'bg-red-500 hover:bg-red-650'
                : 'bg-green-500 hover:bg-green-650'
            }`}
          >
            {ambassador.isActive ? 'Deactivate Account' : 'Activate & Verify'}
          </button>
        </div>
      </div>

      {/* Main Grid: Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Hand Card: General Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile overview */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-slate-50 border border-slate-200 overflow-hidden mx-auto flex items-center justify-center">
              {ambassador.documents?.passportPhoto ? (
                <img src={ambassador.documents.passportPhoto} alt="Passport Size" className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-slate-350" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-800 leading-tight">{ambassador.name}</h2>
              <span className="text-xs font-bold text-slate-400 block mt-1 uppercase tracking-wider">ID: {ambassador.ambassadorId || 'PENDING'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center pt-2">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Wallet Balance</span>
                <span className="text-base font-extrabold text-slate-850 mt-1 block">₹{ambassador.walletBalance}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Referral Code</span>
                <span className="text-sm font-extrabold text-[#3DB9A6] mt-1 block">{ambassador.referralCode}</span>
              </div>
            </div>
          </div>

          {/* Account Credentials */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b">
              <User size={16} className="text-[#3DB9A6]" /> Personal Information
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Email Address:</span>
                <span className="font-semibold text-slate-700">{ambassador.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Phone (WhatsApp):</span>
                <span className="font-semibold text-slate-700">{ambassador.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Date of Birth:</span>
                <span className="font-semibold text-slate-700">{ambassador.dob ? new Date(ambassador.dob).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Gender:</span>
                <span className="font-semibold text-slate-700">{ambassador.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Aadhaar Card:</span>
                <span className="font-semibold text-slate-700">{ambassador.aadhaarNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">PAN Number:</span>
                <span className="font-semibold text-slate-700">{ambassador.panNumber || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center & Right Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Address coverage card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b">
                <MapPin size={16} className="text-[#3DB9A6]" /> Coverage & Address
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block mb-1">Current Address:</span>
                  <p className="font-semibold text-slate-700 leading-relaxed bg-slate-50 border p-2.5 rounded-lg">{ambassador.address}</p>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">City / State:</span>
                  <span className="font-semibold text-slate-700">{ambassador.city}, {ambassador.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">District / Pin Code:</span>
                  <span className="font-semibold text-slate-700">{ambassador.district || 'N/A'} / {ambassador.pincode || 'N/A'}</span>
                </div>
                <div className="pt-2 border-t flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Target Locality Coverage:</span>
                  <span className="font-bold text-[#3DB9A6]">{ambassador.areaCovered}</span>
                </div>
              </div>
            </div>

            {/* Professional Background */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b">
                <Briefcase size={16} className="text-[#3DB9A6]" /> Professional Profile
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Occupation:</span>
                  <span className="font-semibold text-slate-700">{ambassador.occupation || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Company:</span>
                  <span className="font-semibold text-slate-700">{ambassador.company || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Education:</span>
                  <span className="font-semibold text-slate-700">{ambassador.qualification || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Work Experience:</span>
                  <span className="font-semibold text-slate-700">{ambassador.experience || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Join Role Type:</span>
                  <span className="font-semibold text-[#3DB9A6]">{ambassador.joinAs || 'Ambassador'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Sales / Marketing Experience:</span>
                  <span className="font-semibold text-slate-700">{ambassador.hasSalesExperience ? '✓ Yes' : '✗ No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Digital Marketing Experience:</span>
                  <span className="font-semibold text-slate-700">{ambassador.hasDigitalMarketingExperience ? '✓ Yes' : '✗ No'}</span>
                </div>
              </div>
            </div>

            {/* Bank details card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b">
                <CreditCard size={16} className="text-[#3DB9A6]" /> Bank Account Details
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">UPI ID:</span>
                  <span className="font-extrabold text-[#3DB9A6]">{ambassador.upiId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Account Name:</span>
                  <span className="font-semibold text-slate-700">{ambassador.accountHolderName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Bank Name:</span>
                  <span className="font-semibold text-slate-700">{ambassador.bankName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Account Number:</span>
                  <span className="font-semibold text-slate-700">{ambassador.accountNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">IFSC Code:</span>
                  <span className="font-semibold text-slate-700">{ambassador.ifscCode || 'N/A'}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="text-slate-400 font-medium">Referred By Code:</span>
                  <span className="font-bold text-slate-700">{ambassador.referredBy || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Declarations card */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4 text-xs">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b">
                <FileText size={16} className="text-[#3DB9A6]" /> Declarations & Signature
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-green-700 font-semibold mb-2">
                  <CheckCircle size={16} /> Terms Acceptance Declaration Signed
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400 font-medium">Applicant Signature Name:</span>
                  <span className="font-bold text-slate-700">{ambassador.signatureName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Verification Place:</span>
                  <span className="font-semibold text-slate-700">{ambassador.place}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Registered Date:</span>
                  <span className="font-semibold text-slate-700">{new Date(ambassador.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Document Uploads Row */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 pb-2 border-b">
              <FileText size={16} className="text-[#3DB9A6]" /> Document Attachments
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Aadhaar Front */}
              {ambassador.documents?.aadhaarFront && (
                <div className="border border-slate-150 rounded-xl p-3 text-center space-y-2 bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Aadhaar Card Front</span>
                  <a href={ambassador.documents.aadhaarFront} target="_blank" rel="noreferrer" className="block border rounded-lg overflow-hidden bg-white hover:opacity-90 transition">
                    <img src={ambassador.documents.aadhaarFront} alt="Aadhaar Front" className="h-28 object-contain mx-auto p-1" />
                  </a>
                </div>
              )}
              {/* Aadhaar Back */}
              {ambassador.documents?.aadhaarBack && (
                <div className="border border-slate-150 rounded-xl p-3 text-center space-y-2 bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">Aadhaar Card Back</span>
                  <a href={ambassador.documents.aadhaarBack} target="_blank" rel="noreferrer" className="block border rounded-lg overflow-hidden bg-white hover:opacity-90 transition">
                    <img src={ambassador.documents.aadhaarBack} alt="Aadhaar Back" className="h-28 object-contain mx-auto p-1" />
                  </a>
                </div>
              )}
              {/* PAN Card */}
              {ambassador.documents?.panCard && (
                <div className="border border-slate-150 rounded-xl p-3 text-center space-y-2 bg-slate-50/50">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase">PAN Card</span>
                  <a href={ambassador.documents.panCard} target="_blank" rel="noreferrer" className="block border rounded-lg overflow-hidden bg-white hover:opacity-90 transition">
                    <img src={ambassador.documents.panCard} alt="PAN Card" className="h-28 object-contain mx-auto p-1" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Registered Vendors Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Vendors Registered by this Ambassador</h2>
          <p className="text-xs text-slate-500 mt-1">Review vendor accounts, locations, and payout reward logs associated with {ambassador.name}.</p>
        </div>
        <hr className="border-slate-100" />

        {loadingVendors ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3DB9A6] mx-auto"></div>
          </div>
        ) : vendors.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            This Ambassador has not registered any vendors yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 pr-4">Vendor Info</th>
                  <th className="py-3 px-4">Business Details</th>
                  <th className="py-3 px-4">Contact Detail</th>
                  <th className="py-3 px-4">City / Location</th>
                  <th className="py-3 px-4 text-center">Ambassador Reward Status</th>
                  <th className="py-3 pl-4 text-right">Verification Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {vendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 pr-4">
                      <div className="font-semibold text-slate-800">{vendor.name}</div>
                      <div className="text-xs text-slate-400">{vendor.vendorId || 'PENDING'}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-700">{vendor.businessName}</div>
                      <div className="text-[10px] font-bold text-[#3DB9A6] bg-[#3DB9A6]/5 px-2 py-0.5 rounded-full inline-block mt-0.5">{vendor.businessType}</div>
                    </td>
                    <td className="py-4 px-4 text-xs">
                      <div>{vendor.email}</div>
                      <div className="text-slate-500 mt-0.5">{vendor.phone}</div>
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-650">
                      <div>{vendor.city}, {vendor.state}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Coord: {vendor.latitude}, {vendor.longitude}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        vendor.isAmbassadorCredited
                          ? 'bg-green-150 text-green-700 flex items-center justify-center gap-1 max-w-[120px] mx-auto'
                          : 'bg-amber-100 text-amber-700 flex items-center justify-center gap-1 max-w-[120px] mx-auto'
                      }`}>
                        {vendor.isAmbassadorCredited ? (
                          <>
                            <CheckCircle size={12} /> ₹100 Paid
                          </>
                        ) : (
                          <>
                            <XCircle size={12} /> Pending Activation
                          </>
                        )}
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
                        {vendor.verificationStatus === 'verified' ? 'Verified' : vendor.verificationStatus === 'rejected' ? 'Rejected' : 'Pending Review'}
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

export default AmbassadorDetailsPage;
