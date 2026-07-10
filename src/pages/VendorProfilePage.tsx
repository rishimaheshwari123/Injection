import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';
import { 
  Building2, Mail, Phone, MapPin, User, FileText, 
  CheckCircle2, AlertCircle, Clock, Upload, LogOut, 
  Award, Briefcase, CreditCard, Star, X, ShieldCheck, Download
} from 'lucide-react';
import { vendorAPI, bookingAPI } from '../services/api';
import { toast } from 'react-toastify';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const VendorProfilePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [vendorData, setVendorData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  
  // Reviews & Rating states
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Vendor assignments states
  const [vendorBookings, setVendorBookings] = useState<any[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [ratingBooking, setRatingBooking] = useState<any | null>(null);
  const [clientRating, setClientRating] = useState(5);
  const [clientReviewText, setClientReviewText] = useState('');
  const [submittingClientReview, setSubmittingClientReview] = useState(false);

  // ID Card modal states
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [cardDetails, setCardDetails] = useState<any>(null);
  const [loadingCard, setLoadingCard] = useState(false);
  const vendorCardRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = () => {
    if (!vendorCardRef.current) return;
    const element = vendorCardRef.current;
    const opt = {
      margin:       0,
      filename:     `${vendorData.name.replace(/\s+/g, '_')}_ID_Card.pdf`,
      image:        { type: 'jpeg' as const, quality: 1.0 },
      html2canvas:  { scale: 3, useCORS: true, logging: false, letterRendering: true },
      jsPDF:        { unit: 'px', format: [320, 480] as [number, number], hotlooks: true }
    };
    html2pdf().from(element).set(opt).save();
  };

  const handleOpenIdCardModal = async () => {
    setShowIdCardModal(true);
    if (!cardDetails && user?._id) {
      try {
        setLoadingCard(true);
        const res = await vendorAPI.getIdCardDetails(user._id);
        if (res.data && res.data.success) {
          setCardDetails(res.data.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load logo & signature for ID card");
      } finally {
        setLoadingCard(false);
      }
    }
  };

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

  const fetchVendorReviews = async () => {
    if (!user?._id) return;
    try {
      setLoadingReviews(true);
      const response = await vendorAPI.getReviews(user._id);
      if (response.data.success) {
        setReviews(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchVendorBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await bookingAPI.getVendorBookings();
      if (response.data.success) {
        setVendorBookings(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchVendorDetails();
      fetchVendorReviews();
      fetchVendorBookings();
    }
  }, [user?._id]);

  const handleClientReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingBooking) return;

    if (clientRating < 1 || clientRating > 5) {
      toast.error("Please select a rating between 1 and 5 stars");
      return;
    }

    if (!clientReviewText.trim()) {
      toast.error("Please write a review comment");
      return;
    }

    try {
      setSubmittingClientReview(true);
      const res = await bookingAPI.submitUserReview(ratingBooking._id, clientRating, clientReviewText);
      if (res.data && res.data.success) {
        toast.success("Thank you for your rating & review!");
        setRatingBooking(null);
        setClientRating(5);
        setClientReviewText("");
        // Reload list to hide rate button
        fetchVendorBookings();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingClientReview(false);
    }
  };

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

  // Compute rating counts dynamically
  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach((r: any) => {
    const star = Math.min(Math.max(Math.round(r.rating || 5), 1), 5);
    ratingCounts[star - 1]++;
  });

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
          
          {/* Left Column - Contacts & Ratings & Documents Upload (lg:col-span-1) */}
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

            {/* Ratings & Feedback Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-4 border-b pb-3 border-slate-100 flex items-center gap-2">
                <Star className="text-amber-500 fill-amber-500" size={18} /> Ratings & Feedback
              </h2>
              
              <div className="flex items-center gap-4 mb-2">
                <div className="text-center">
                  <div className="text-4xl font-extrabold text-slate-800">{vendorData.rating ? vendorData.rating.toFixed(1) : "0.0"}</div>
                  <div className="flex items-center justify-center gap-0.5 mt-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star 
                        key={s} 
                        size={14} 
                        className={s <= Math.round(vendorData.rating || 0) ? "fill-amber-500 text-amber-500" : "text-slate-200"} 
                      />
                    ))}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-semibold whitespace-nowrap">
                    {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                  </div>
                </div>
                
                <div className="flex-1 space-y-1 border-l border-slate-100 pl-4">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = ratingCounts[stars - 1] || 0;
                    const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs">
                        <span className="w-3 text-slate-500 font-bold text-right">{stars}</span>
                        <Star size={10} className="fill-amber-400 text-amber-400 flex-shrink-0" />
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="w-4 text-slate-400 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* View ID Card Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-12 h-12 bg-[#3DB9A6]/10 text-[#3DB9A6] rounded-2xl flex items-center justify-center flex-shrink-0">
                <Award size={24} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Partner ID Card</h3>
                <p className="text-xs text-slate-400 mt-0.5">View and download your digital ID card</p>
              </div>
              <button
                onClick={handleOpenIdCardModal}
                className="mt-2 w-full py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-all shadow-xs block"
              >
                View ID Card
              </button>
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

          {/* Right Column - Details & Reviews List (lg:col-span-2) */}
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

            {/* My Assignments / Bookings History */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 border-b pb-3 border-slate-100">
                <Clock size={20} className="text-[#3DB9A6]" /> My Assignments & Booking History
              </h2>
              {loadingBookings ? (
                <div className="py-8 flex justify-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3DB9A6]"></div>
                </div>
              ) : vendorBookings.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No assigned bookings found.
                </div>
              ) : (
                <div className="space-y-4">
                  {vendorBookings.map((booking) => {
                    const isCompleted = booking.bookingStatus === 'completed';
                    return (
                      <div key={booking._id} className="border border-slate-100 rounded-xl p-4 bg-slate-50/20 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-450 uppercase tracking-wider">#{booking._id.slice(-6).toUpperCase()}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              booking.bookingStatus === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                              booking.bookingStatus === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                              booking.bookingStatus === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              'bg-yellow-50 text-yellow-700 border-yellow-200'
                            }`}>
                              {booking.bookingStatus}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-805">
                            {booking.selectedServices?.map((s: any) => s.serviceName).join(', ') || 'Healthcare Services'}
                          </h4>
                          <div className="text-xs text-slate-500 space-y-0.5">
                            <p><span className="font-semibold text-slate-450">Patient:</span> {booking.patientName || booking.userId?.name}</p>
                            <p><span className="font-semibold text-slate-450">Scheduled:</span> {booking.preferredTimeSlot}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0">
                          <div className="text-left md:text-right">
                            <span className="text-[10px] text-slate-400 block font-semibold">Total Payout</span>
                            <span className="text-sm font-extrabold text-slate-800">₹{booking.grandTotal}</span>
                          </div>

                          {isCompleted && (
                            <div>
                              {booking.isReviewedByVendor ? (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                                  <CheckCircle2 size={14} /> Reviewed Patient
                                </span>
                              ) : (
                                <button
                                  onClick={() => setRatingBooking(booking)}
                                  className="px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-bold rounded-lg text-xs hover:shadow-md hover:scale-[1.02] transition-all"
                                >
                                  Rate Patient
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Client Reviews Feed */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2 border-b pb-3 border-slate-100">
                <Star size={20} className="text-amber-500 fill-amber-500" /> Client Reviews & Feedback
              </h2>
              {loadingReviews ? (
                <div className="py-8 flex justify-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3DB9A6]"></div>
                </div>
              ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  No reviews submitted yet for this profile.
                </div>
              ) : (
                <div className="space-y-6 divide-y divide-slate-100">
                  {reviews.map((review, idx) => (
                    <div key={review._id} className={`${idx > 0 ? "pt-6" : ""} flex gap-4`}>
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm uppercase flex-shrink-0">
                        {review.userId?.name?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">{review.userId?.name || "Anonymous User"}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold">{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                          </div>
                          <div className="flex gap-0.5 text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={12} className={s <= review.rating ? "fill-amber-500 text-amber-500" : "text-slate-200"} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-slate-650 leading-relaxed font-medium bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">{review.reviewText}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Review Customer Modal */}
      <AnimatePresence>
        {ratingBooking && (
          <div className="fixed inset-0 z-55 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRatingBooking(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative z-10 border border-slate-100"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">Rate Customer / Patient</h3>
                <button
                  onClick={() => setRatingBooking(null)}
                  className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleClientReviewSubmit} className="p-5 space-y-4">
                {/* User details */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block mb-0.5">Rating for patient</span>
                  <span className="text-base font-extrabold text-slate-800 text-center block">
                    {ratingBooking.patientName || ratingBooking.userId?.name || "Patient"}
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    {ratingBooking.selectedServices?.map((s: any) => s.serviceName).join(", ")}
                  </p>
                </div>

                {/* Stars selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block text-center">How was their behavior?</label>
                  <div className="flex items-center justify-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setClientRating(star)}
                        className="transform transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star
                          size={32}
                          className="transition-colors"
                          fill={star <= clientRating ? "#FFC107" : "none"}
                          stroke={star <= clientRating ? "#FFC107" : "#CBD5E1"}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 block text-center font-bold">
                    {clientRating === 5 ? "Excellent!" : clientRating === 4 ? "Very Good!" : clientRating === 3 ? "Good" : clientRating === 2 ? "Fair" : "Poor"}
                  </span>
                </div>

                {/* Comment Textarea */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">Feedback / Review Comments</label>
                  <textarea
                    required
                    placeholder="Describe patient behavior and service support experience..."
                    value={clientReviewText}
                    onChange={(e) => setClientReviewText(e.target.value)}
                    className="w-full text-sm p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6] h-28 resize-none bg-slate-50/30"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submittingClientReview}
                  className="w-full py-3 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-bold rounded-xl text-sm hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {submittingClientReview ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Review</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ID Card Modal */}
      <AnimatePresence>
        {showIdCardModal && (
          <div className="fixed inset-0 z-55 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIdCardModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden z-10 relative border border-slate-100 flex flex-col items-center p-6 gap-5 animate-presence"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowIdCardModal(false)}
                className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-colors"
              >
                <X size={18} />
              </button>

              {loadingCard ? (
                <div className="py-20 flex flex-col items-center gap-2">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-250 border-t-[#3DB9A6]" />
                  <p className="text-xs text-slate-500 font-medium">Preparing ID badge...</p>
                </div>
              ) : cardDetails ? (
                <div className="flex flex-col items-center space-y-5 w-full">
                  <h3 className="text-sm font-bold text-slate-800 self-start">My Partner ID Card</h3>
                  
                  {/* Style injection to isolate only the card when print is triggered */}
                  <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                      body * {
                        visibility: hidden;
                      }
                      .print-vendor-card, .print-vendor-card * {
                        visibility: visible;
                      }
                      .print-vendor-card {
                        position: absolute;
                        left: 50%;
                        top: 50%;
                        transform: translate(-50%, -50%) scale(1.3);
                      }
                    }
                  ` }} />                  {/* ID Badge Card Element */}
                  <div ref={vendorCardRef} className="print-vendor-card w-full h-[460px] bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200 flex flex-col relative">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#3DB9A6] to-[#63D64F] py-4 px-5 text-white text-center relative flex flex-col items-center">
                      {cardDetails.setting?.logoUrl ? (
                        <img src={cardDetails.setting.logoUrl} alt="Logo" className="h-8 object-contain mb-1" />
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-white/20 border border-white/30 flex items-center justify-center font-black text-sm text-white mb-1">
                          +
                        </div>
                      )}
                      <h3 className="text-[9px] uppercase tracking-widest font-black text-[#dcffe3]">{cardDetails.setting?.title || 'General Medical Services'}</h3>
                      <p className="text-[7.5px] text-white/80 font-bold tracking-wide mt-0.5">REGISTERED MEDICAL PARTNER</p>
                    </div>

                    {/* Body */}
                    <div className="flex-1 p-4.5 flex flex-col items-center text-center justify-between">
                      {/* Avatar */}
                      <div className="relative mb-1.5">
                        <div className="w-22 h-22 rounded-full overflow-hidden border-4 border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center">
                          {cardDetails.vendor.profileImage ? (
                            <img src={cardDetails.vendor.profileImage} alt={cardDetails.vendor.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xl font-black text-slate-400 uppercase">
                              {cardDetails.vendor.name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center border-4 border-white shadow-xs">
                          <ShieldCheck size={10} />
                        </div>
                      </div>

                      {/* Info */}
                      <div>
                        <h2 className="text-base font-extrabold text-slate-800 leading-tight">{cardDetails.vendor.name}</h2>
                        <p className="text-[10px] font-bold text-[#3DB9A6] uppercase tracking-wider">{cardDetails.vendor.specialization || 'General Partner'}</p>
                        <p className="text-[8px] font-semibold text-slate-400 mt-0.5">{cardDetails.vendor.businessName}</p>
                      </div>

                      {/* Information List */}
                      <div className="w-full bg-slate-50 border border-slate-150/70 rounded-xl p-3 space-y-1 text-left text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Partner ID</span>
                          <span className="font-extrabold text-slate-700 font-mono">{cardDetails.vendor.vendorId}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Email</span>
                          <span className="font-semibold text-slate-700 truncate max-w-[130px]">{cardDetails.vendor.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Mobile</span>
                          <span className="font-semibold text-slate-700">{cardDetails.vendor.phone}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-bold text-slate-400 uppercase">Issue Date</span>
                          <span className="font-semibold text-slate-700">
                            {new Date(cardDetails.vendor.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Signature block */}
                      <div className="w-full flex flex-col items-center">
                        {cardDetails.setting?.signatureUrl ? (
                          <img src={cardDetails.setting.signatureUrl} alt="Signature" className="h-8 object-contain mb-0.5" />
                        ) : (
                          <div className="font-mono italic text-[10px] text-slate-500 font-bold mb-0.5 h-4 flex items-end">
                            Auth Signatory
                          </div>
                        )}
                        <div className="w-20 border-t border-slate-350 my-0.5"></div>
                        <span className="text-[7.5px] font-bold text-slate-400 uppercase tracking-widest">Authorized Sign</span>
                      </div>
                    </div>

                    <div className="h-1.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6]" />
                  </div>

                  {/* Print / Download Button */}
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full py-2.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-extrabold rounded-xl text-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download size={14} /> Download ID Card (PDF)
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-10">Unable to load ID card.</p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default VendorProfilePage;
