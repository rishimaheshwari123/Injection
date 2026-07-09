import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';
import { 
  Building2, Mail, Phone, MapPin, User, FileText, 
  CheckCircle2, AlertCircle, Clock, Upload, LogOut, 
  Award, Briefcase, CreditCard
} from 'lucide-react';
import { vendorAPI } from '../services/api';
import { toast } from 'react-toastify';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const VendorProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [vendorData, setVendorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const fetchVendorDetails = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const response = await vendorAPI.getVendorById(user._id);
      if (response.data.success) {
        setVendorData(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorDetails();
  }, [user?._id]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>, docKey: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    try {
      setUploadingDoc(docKey);
      toast.info(`Uploading ${getDocLabel(docKey)}...`);

      // 1. Upload to Cloudinary
      const uploadRes = await vendorAPI.uploadFile(file);
      if (!uploadRes.data.success) {
        throw new Error('Cloudinary upload failed');
      }
      const fileUrl = uploadRes.data.data.url;

      // 2. Prepare updated documents state
      const currentDocs = vendorData.documents || {};
      const updatedDocs = {
        ...currentDocs,
        [docKey]: {
          ...currentDocs[docKey],
          url: fileUrl,
          type: getDocLabel(docKey)
          // Status and rejectionReason will be reset automatically by Mongoose pre-save hook
        }
      };

      // 3. Update Vendor Profile
      const updateRes = await vendorAPI.updateProfile({ documents: updatedDocs });
      if (updateRes.data.success) {
        toast.success(`${getDocLabel(docKey)} uploaded successfully! Document status reset to pending.`);
        // Refetch to get updated database state
        await fetchVendorDetails();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to upload ${getDocLabel(docKey)}`);
    } finally {
      setUploadingDoc(null);
    }
  };

  const getDocLabel = (key: string): string => {
    switch (key) {
      case 'identityProof': return 'Identity Proof';
      case 'qualificationCertificate': return 'Qualification Certificate';
      case 'businessLicense': return 'Business License';
      case 'insuranceCertificate': return 'Insurance Certificate';
      case 'policeVerification': return 'Police Verification';
      default: return key;
    }
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#63D64F]"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!vendorData) {
    return (
      <div>
        <Navigation />
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-800">Profile Not Found</h2>
          <p className="text-gray-600 mt-2 text-center">Unable to load vendor information. Please try logging in again.</p>
          <button onClick={handleLogout} className="mt-6 px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 font-medium">
            <LogOut size={18} /> Logout
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const documentKeys = ['identityProof', 'qualificationCertificate', 'businessLicense', 'insuranceCertificate', 'policeVerification'];

  // Check if any document is rejected
  const hasRejectedDocs = documentKeys.some(key => vendorData.documents?.[key]?.status === 'rejected');

  return (
    <div className="bg-slate-50 min-h-screen">
      <Navigation />
      
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-md overflow-hidden flex-shrink-0">
                {vendorData.profileImage ? (
                  <img src={vendorData.profileImage} alt={vendorData.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 size={40} className="text-white" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">{vendorData.businessName || 'Business Name'}</h1>
                <p className="text-[#e4ffe0] text-sm mt-1 flex items-center gap-2 font-medium">
                  <User size={14} /> Partner: {vendorData.name} (ID: {vendorData.vendorId})
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Verification Pills */}
              {vendorData.isVerified ? (
                <div className="bg-emerald-500/20 border border-emerald-400/30 text-[#dcffe3] px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-sm backdrop-blur-md">
                  <CheckCircle2 size={16} /> Verified Partner
                </div>
              ) : hasRejectedDocs ? (
                <div className="bg-red-500/20 border border-red-400/30 text-red-100 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-sm backdrop-blur-md">
                  <AlertCircle size={16} /> Verification Action Required
                </div>
              ) : (
                <div className="bg-amber-500/20 border border-amber-400/30 text-amber-100 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-semibold shadow-sm backdrop-blur-md">
                  <Clock size={16} /> Verification Pending
                </div>
              )}

              <button 
                onClick={handleLogout} 
                className="bg-white/15 hover:bg-white/25 border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Verification Status Alert */}
        {!vendorData.isVerified && (
          <div className={`mb-8 p-5 rounded-2xl border flex items-start gap-4 shadow-sm ${hasRejectedDocs ? 'bg-red-50 border-red-200/80 text-red-800' : 'bg-amber-50 border-amber-200/80 text-amber-800'}`}>
            {hasRejectedDocs ? (
              <>
                <AlertCircle className="text-red-500 mt-1 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-base text-red-900">Some of your documents have been rejected</h3>
                  <p className="text-sm mt-1 text-red-700">Please review the documents section below, see the admin rejection notes, and re-upload the correct documents. Once re-uploaded, the admin will re-verify them.</p>
                </div>
              </>
            ) : (
              <>
                <Clock className="text-amber-500 mt-1 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-base text-amber-900">Your profile is currently under review</h3>
                  <p className="text-sm mt-1 text-amber-700 font-medium">Our administrators are verifying your uploaded documents. You will be listed on our platform once all documents are approved.</p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns - Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* General Info */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 border-b pb-3 border-slate-100">
                <Building2 size={20} className="text-[#3DB9A6]" /> Business & Professional Details
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Business Type</label>
                  <p className="text-gray-800 font-medium mt-1">{vendorData.businessType || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Registration Number</label>
                  <p className="text-gray-800 font-medium mt-1">{vendorData.registrationNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">GST Number</label>
                  <p className="text-gray-800 font-medium mt-1">{vendorData.gstNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Specialization</label>
                  <p className="text-gray-800 font-medium mt-1">{vendorData.specialization || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Qualifications</label>
                  <p className="text-gray-800 font-medium mt-1 flex items-center gap-1.5 mt-1">
                    <Award size={15} className="text-slate-400" /> {vendorData.qualifications || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Experience</label>
                  <p className="text-gray-800 font-medium mt-1 flex items-center gap-1.5 mt-1">
                    <Briefcase size={15} className="text-slate-400" /> {vendorData.experience ? `${vendorData.experience} Years` : 'N/A'}
                  </p>
                </div>
              </div>
              
              {vendorData.bio && (
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Bio</label>
                  <p className="text-gray-700 text-sm mt-2 leading-relaxed">{vendorData.bio}</p>
                </div>
              )}
            </div>

            {/* Address & Service Areas */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 border-b pb-3 border-slate-100">
                <MapPin size={20} className="text-[#3DB9A6]" /> Location & Service Coverage
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider block">Full Address</label>
                  <p className="text-gray-800 font-medium mt-1 leading-normal">{vendorData.address || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">City</label>
                  <p className="text-gray-800 font-medium mt-1">{vendorData.city || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">State & PinCode</label>
                  <p className="text-gray-800 font-medium mt-1">{vendorData.state || 'N/A'} - {vendorData.pincode || ''}</p>
                </div>
              </div>

              {vendorData.serviceAreas && vendorData.serviceAreas.length > 0 && (
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider block mb-2">Service Coverage Areas</label>
                  <div className="flex flex-wrap gap-2">
                    {vendorData.serviceAreas.map((area: string, index: number) => (
                      <span key={index} className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bank Details */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 border-b pb-3 border-slate-100">
                <CreditCard size={20} className="text-[#3DB9A6]" /> Bank Account Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Bank Name</label>
                  <p className="text-gray-800 font-medium mt-1">{vendorData.bankDetails?.bankName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Account Holder Name</label>
                  <p className="text-gray-800 font-medium mt-1">{vendorData.bankDetails?.accountHolderName || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Account Number</label>
                  <p className="text-gray-800 font-medium mt-1">{vendorData.bankDetails?.accountNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-semibold uppercase tracking-wider">IFSC Code</label>
                  <p className="text-gray-800 font-medium mt-1">{vendorData.bankDetails?.ifscCode || 'N/A'}</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column - Contacts & Documents Upload */}
          <div className="space-y-8">
            
            {/* Contact Details */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-3 border-slate-100">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#3DB9A6]/10 text-[#3DB9A6] flex items-center justify-center flex-shrink-0">
                    <Mail size={16} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Email Address</label>
                    <p className="text-sm text-gray-800 font-semibold">{vendorData.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#3DB9A6]/10 text-[#3DB9A6] flex items-center justify-center flex-shrink-0">
                    <Phone size={16} />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 font-semibold uppercase">Phone Number</label>
                    <p className="text-sm text-gray-800 font-semibold">{vendorData.phone}</p>
                  </div>
                </div>

                {vendorData.alternatePhone && (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#3DB9A6]/10 text-[#3DB9A6] flex items-center justify-center flex-shrink-0">
                      <Phone size={16} />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-500 font-semibold uppercase">Alternate Phone</label>
                      <p className="text-sm text-gray-800 font-semibold">{vendorData.alternatePhone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Documents Verification List */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5 border-b pb-3 border-slate-100 flex items-center justify-between">
                <span>Verification Documents</span>
              </h2>

              <div className="space-y-5">
                {documentKeys.map((key) => {
                  const doc = vendorData.documents?.[key];
                  const hasFile = !!doc?.url;
                  const status = doc?.status || 'pending';
                  const isUploading = uploadingDoc === key;

                  return (
                    <div key={key} className="border border-slate-150 rounded-xl p-4 transition-all hover:shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <FileText size={18} className="text-slate-400" />
                          <h4 className="text-sm font-bold text-slate-800">{getDocLabel(key)}</h4>
                        </div>

                        {/* Document Status badges */}
                        {hasFile ? (
                          status === 'approved' ? (
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100">
                              Approved
                            </span>
                          ) : status === 'rejected' ? (
                            <span className="px-2 py-0.5 bg-red-50 text-red-700 text-[10px] font-bold rounded-full border border-red-100">
                              Rejected
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-100">
                              Pending Review
                            </span>
                          )
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full border border-slate-200">
                            Missing
                          </span>
                        )}
                      </div>

                      {/* Display rejection notes */}
                      {hasFile && status === 'rejected' && doc.rejectionReason && (
                        <div className="bg-red-50 text-red-800 text-xs p-3 rounded-lg border border-red-100 mb-3 flex items-start gap-2">
                          <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold">Rejection Reason:</span> {doc.rejectionReason}
                          </div>
                        </div>
                      )}

                      {/* Download link or view link */}
                      {hasFile && (
                        <div className="mb-3">
                          <a 
                            href={doc.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-xs text-[#3DB9A6] hover:underline font-semibold flex items-center gap-1"
                          >
                            View Uploaded File
                          </a>
                        </div>
                      )}

                      {/* Upload / Reupload Action */}
                      {(!hasFile || status === 'rejected') && (
                        <div>
                          <label className={`w-full flex items-center justify-center gap-2 border border-dashed rounded-xl py-2 px-4 text-xs font-semibold cursor-pointer transition-all ${isUploading ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-slate-50 hover:bg-slate-100 border-[#3DB9A6]/30 text-[#3DB9A6] hover:border-[#3DB9A6]'}`}>
                            {isUploading ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
                            ) : (
                              <Upload size={14} />
                            )}
                            {hasFile ? 'Reupload Document' : 'Upload Document'}
                            <input 
                              type="file" 
                              className="hidden" 
                              onChange={(e) => handleDocumentUpload(e, key)}
                              disabled={isUploading}
                              accept="image/*,.pdf"
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

      </div>

      <Footer />
    </div>
  );
};

export default VendorProfilePage;
