import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { User, Briefcase, MapPin, CreditCard, ChevronRight, ChevronLeft, Check, Package, Upload, FileText, X } from 'lucide-react';
import { vendorAPI, serviceAPI, otpAPI } from '../services/api';
import { toast } from 'react-toastify';

const VendorRegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [fetchingServices, setFetchingServices] = useState(true);

  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      setFormData(prev => ({
        ...prev,
        referredBy: refCode.toUpperCase()
      }));
    }
  }, [searchParams]);

  // OTP Verification States
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [lastVerifiedPhone, setLastVerifiedPhone] = useState('');

  const handleSendOtp = async () => {
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setSendingOtp(true);
    try {
      const response = await otpAPI.sendOtp(formData.phone);
      if (response.data.success) {
        setOtpSent(true);
        toast.success('OTP sent successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^[0-9]{6}$/.test(otpCode)) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setVerifyingOtp(true);
    try {
      const response = await otpAPI.verifyOtp(formData.phone, otpCode);
      if (response.data.success) {
        setIsPhoneVerified(true);
        setLastVerifiedPhone(formData.phone);
        setOtpSent(false);
        setOtpCode('');
        toast.success('Phone number verified successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    alternatePhone: '',
    gender: 'Male',
    businessName: '',
    businessType: 'Individual',
    registrationNumber: '',
    gstNumber: '',
    experience: '',
    specialization: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    bio: '',
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: ''
    },
    services: [] as string[],
    profileImage: '',
    documents: {
      identityProof: { type: 'Identity Proof', url: '' },
      qualificationCertificate: { type: 'Qualification Certificate', url: '' },
      businessLicense: { type: 'Business License', url: '' },
      insuranceCertificate: { type: 'Insurance Certificate', url: '' },
      policeVerification: { type: 'Police Verification', url: '' }
    },
    referredBy: ''
  });

  const [uploadingFiles, setUploadingFiles] = useState({
    profileImage: false,
    identityProof: false,
    qualificationCertificate: false,
    businessLicense: false,
    insuranceCertificate: false,
    policeVerification: false
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds 5MB limit');
      return;
    }

    setUploadingFiles(prev => ({ ...prev, [fieldName]: true }));
    try {
      const response = await vendorAPI.uploadFile(file);
      if (response.data.success) {
        const fileUrl = response.data.data.url;
        if (fieldName === 'profileImage') {
          setFormData(prev => ({
            ...prev,
            profileImage: fileUrl
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            documents: {
              ...prev.documents,
              [fieldName]: {
                type: fieldName === 'identityProof' ? 'Identity Proof' 
                      : fieldName === 'qualificationCertificate' ? 'Qualification Certificate'
                      : fieldName === 'businessLicense' ? 'Business License'
                      : fieldName === 'insuranceCertificate' ? 'Insurance Certificate'
                      : fieldName === 'policeVerification' ? 'Police Verification'
                      : 'Document',
                url: fileUrl
              }
            }
          }));
        }
        toast.success(`${file.name} uploaded successfully!`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'File upload failed');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await serviceAPI.getPublicServices();
        if (response.data.success) {
          setServicesList(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
        toast.error('Failed to load services list');
      } finally {
        setFetchingServices(false);
      }
    };
    fetchServices();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === "phone") {
      if (value === lastVerifiedPhone && lastVerifiedPhone !== "") {
        setIsPhoneVerified(true);
      } else {
        setIsPhoneVerified(false);
      }
    }
  };

  const handleBankDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        [name]: value
      }
    }));
  };

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => {
      const currentServices = [...prev.services];
      const index = currentServices.indexOf(serviceId);
      if (index > -1) {
        currentServices.splice(index, 1);
      } else {
        currentServices.push(serviceId);
      }
      return {
        ...prev,
        services: currentServices
      };
    });
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) return 'Owner Name is required';
      if (!formData.email.trim() || !formData.email.includes('@')) return 'Provide a valid email';
      if (formData.password.length < 6) return 'Password must be at least 6 characters';
      if (!/^[0-9]{10}$/.test(formData.phone)) return 'Provide a valid 10-digit phone number';
      if (!isPhoneVerified) return 'Please verify the phone number via OTP first';
      if (formData.alternatePhone && !/^[0-9]{10}$/.test(formData.alternatePhone)) return 'Provide a valid 10-digit alternate phone number';
    } else if (currentStep === 2) {
      if (!formData.businessName.trim()) return 'Business Name is required';
      if (!formData.address.trim()) return 'Address is required';
      if (!formData.city.trim()) return 'City is required';
      if (!formData.state.trim()) return 'State is required';
      if (!/^[0-9]{6}$/.test(formData.pincode)) return 'Provide a valid 6-digit pincode';
    } else if (currentStep === 3) {
      if (formData.services.length === 0) return 'Please select at least one service you offer';
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep();
    if (error) {
      toast.error(error);
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.services.length === 0) {
      toast.error('Please select at least one service you offer');
      return;
    }

    setLoading(true);
    try {
      const cleanedDocuments: any = {};
      Object.entries(formData.documents).forEach(([key, value]: [string, any]) => {
        if (value.url) {
          cleanedDocuments[key] = value;
        }
      });

      const submitData = {
        ...formData,
        experience: formData.experience ? Number(formData.experience) : 0,
        documents: Object.keys(cleanedDocuments).length > 0 ? cleanedDocuments : undefined,
        profileImage: formData.profileImage || undefined
      };

      const response = await vendorAPI.register(submitData);
      if (response.data.success) {
        toast.success('Registration successful! Your account is pending admin verification.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col justify-between">
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-4">
            
            {/* Left Sidebar - Steps */}
            <div className="bg-gradient-to-b from-[#63D64F] to-[#3DB9A6] p-8 text-white flex flex-col justify-between md:col-span-1">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">Partner Portal</h2>
                <p className="text-xs text-white/80 mb-8">Register as a vendor and start providing high-quality healthcare and training services.</p>
                
                <div className="space-y-6">
                  {[
                    { step: 1, label: 'Account Info', icon: User },
                    { step: 2, label: 'Business & Address', icon: MapPin },
                    { step: 3, label: 'Services & Banking', icon: CreditCard },
                    { step: 4, label: 'Documents & Profile', icon: FileText }
                  ].map((s) => {
                    const Icon = s.icon;
                    return (
                      <div key={s.step} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                          currentStep === s.step 
                            ? 'bg-white text-[#3DB9A6] scale-110 shadow-md' 
                            : currentStep > s.step 
                              ? 'bg-white/30 text-white' 
                              : 'bg-white/10 text-white/60'
                        }`}>
                          {currentStep > s.step ? <Check size={16} /> : <Icon size={16} />}
                        </div>
                        <div className="hidden md:block">
                          <p className={`text-xs font-semibold tracking-wider uppercase ${currentStep === s.step ? 'text-white' : 'text-white/60'}`}>
                            {s.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="mt-8 text-xs text-white/80">
                Already registered?{' '}
                <Link to="/login" className="underline font-bold hover:text-white">Sign In</Link>
              </div>
            </div>

            {/* Right Main Form Section */}
            <form onSubmit={handleSubmit} className="p-8 md:col-span-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800">Become a Service Partner</h1>
                    <p className="text-sm text-slate-500 mt-1">Complete your registration in 4 simple steps</p>
                  </div>
                  <span className="px-3 py-1 bg-[#63D64F]/10 text-[#3DB9A6] text-xs font-semibold rounded-full uppercase tracking-wider">
                    Step {currentStep} of 4
                  </span>
                </div>

                {/* STEP 1: Account Info */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-md font-semibold text-slate-700 flex items-center gap-2 mb-2">
                      <User size={18} className="text-[#3DB9A6]" /> Account Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Owner Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required
                          placeholder="John Doe"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required
                          placeholder="john@example.com"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password *</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required
                          placeholder="••••••••"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number *</label>
                        <div className="flex gap-3">
                          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                            disabled={otpSent}
                            placeholder="9876543210"
                            className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition ${
                              isPhoneVerified ? "border-green-300 bg-green-50 text-green-700 font-semibold" : "border-slate-200"
                            }`} />
                          {!isPhoneVerified ? (
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={sendingOtp || otpSent || !/^[0-9]{10}$/.test(formData.phone)}
                              className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-semibold rounded-lg hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center min-w-[100px]"
                            >
                              {sendingOtp ? 'Sending...' : otpSent ? 'Sent' : 'Verify'}
                            </button>
                          ) : (
                            <span className="px-5 py-2 bg-green-100 text-green-700 font-bold rounded-lg text-xs flex items-center gap-1">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </div>

                      {otpSent && (
                        <div className="md:col-span-2 bg-[#f4fbf3] border border-[#d2f4cc] rounded-xl p-4 mt-2 animate-fadeIn">
                          <p className="text-xs text-slate-650 mb-2.5 font-semibold">
                            An OTP has been sent to {formData.phone}. Please enter the 6-digit verification code below:
                          </p>
                          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                            <input
                              type="text"
                              maxLength={6}
                              placeholder="Enter OTP"
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                              className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] outline-none text-center font-bold tracking-widest text-base bg-white"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyOtp}
                              disabled={verifyingOtp || otpCode.length !== 6}
                              className="flex-1 sm:flex-none px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg hover:shadow-md transition disabled:opacity-50 text-xs"
                            >
                              {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setOtpSent(false)}
                              className="text-xs text-gray-500 hover:text-gray-700 hover:underline font-semibold text-center sm:text-left py-1"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Alternate Phone</label>
                        <input type="tel" name="alternatePhone" value={formData.alternatePhone} onChange={handleChange}
                          placeholder="9876543211"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gender *</label>
                        <select name="gender" value={formData.gender} onChange={handleChange} required
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition">
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Referral Code (Optional)</label>
                        <input type="text" name="referredBy" value={formData.referredBy} onChange={handleChange}
                          placeholder="REF-XXXXXX"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition font-mono uppercase" />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Business & Address */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-md font-semibold text-slate-700 flex items-center gap-2 mb-2">
                      <Briefcase size={18} className="text-[#3DB9A6]" /> Business & Location details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business/Brand Name *</label>
                        <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required
                          placeholder="PRLT Clinic"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Type *</label>
                        <select name="businessType" value={formData.businessType} onChange={handleChange} required
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition">
                          <option value="Individual">Individual</option>
                          <option value="Clinic">Clinic</option>
                          <option value="Hospital">Hospital</option>
                          <option value="Laboratory">Laboratory</option>
                          <option value="Pharmacy">Pharmacy</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Registration/License Number</label>
                        <input type="text" name="registrationNumber" value={formData.registrationNumber} onChange={handleChange}
                          placeholder="REG123456"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">GST Number</label>
                        <input type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange}
                          placeholder="22AAAAA0000A1Z5"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Experience (Years)</label>
                        <input type="number" name="experience" value={formData.experience} onChange={handleChange} min="0"
                          placeholder="5"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Specialization</label>
                        <input type="text" name="specialization" value={formData.specialization} onChange={handleChange}
                          placeholder="e.g. Critical Care Nursing, Pathology"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Street Address *</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} required
                          placeholder="123, Main Street"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">City *</label>
                        <input type="text" name="city" value={formData.city} onChange={handleChange} required
                          placeholder="Indore"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">State *</label>
                        <input type="text" name="state" value={formData.state} onChange={handleChange} required
                          placeholder="Madhya Pradesh"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Pincode *</label>
                        <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required
                          placeholder="452001"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Short Bio</label>
                        <textarea name="bio" value={formData.bio} onChange={handleChange} rows={2} maxLength={500}
                          placeholder="Brief description about your background, team, or clinic..."
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition resize-none" />
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Services & Bank Details */}
                {currentStep === 3 && (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Services Selection */}
                    <div>
                      <h3 className="text-md font-semibold text-slate-700 flex items-center gap-2 mb-3">
                        <Package size={18} className="text-[#3DB9A6]" /> Services Offered *
                      </h3>
                      <p className="text-xs text-slate-500 mb-2">Select the healthcare, training, or survey services you offer</p>
                      
                      {fetchingServices ? (
                        <div className="text-center py-4">
                          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#3DB9A6]"></div>
                        </div>
                      ) : (
                        <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/50">
                          {servicesList.map((service) => (
                            <label key={service._id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                              formData.services.includes(service._id) 
                                ? 'bg-[#3DB9A6]/5 border-[#3DB9A6]' 
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}>
                              <input
                                type="checkbox"
                                checked={formData.services.includes(service._id)}
                                onChange={() => handleServiceToggle(service._id)}
                                className="w-4 h-4 text-[#3DB9A6] border-slate-300 rounded focus:ring-[#3DB9A6]"
                              />
                              {service.image ? (
                                <img
                                  src={service.image}
                                  alt={service.serviceName}
                                  className="w-12 h-12 object-cover rounded-md border"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-slate-100 rounded-md border flex items-center justify-center text-slate-400">
                                  <Package size={24} />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-semibold text-slate-800">{service.serviceName}</p>
                                <p className="text-xs text-slate-500 mt-0.5">{typeof service.category === 'object' ? (service.category?.name || "N/A") : (service.category || "N/A")} - ₹{service.basePrice}</p>
                              </div>
                            </label>
                          ))}
                          {servicesList.length === 0 && (
                            <p className="text-sm text-slate-500 col-span-2">No services available for registration.</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Bank Details */}
                    <div>
                      <h3 className="text-md font-semibold text-slate-700 flex items-center gap-2 mb-3">
                        <CreditCard size={18} className="text-[#3DB9A6]" /> Bank Details (For Payments)
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Account Holder Name</label>
                          <input type="text" name="accountHolderName" value={formData.bankDetails.accountHolderName} onChange={handleBankDetailsChange}
                            placeholder="John Doe"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Account Number</label>
                          <input type="text" name="accountNumber" value={formData.bankDetails.accountNumber} onChange={handleBankDetailsChange}
                            placeholder="0123456789"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">IFSC Code</label>
                          <input type="text" name="ifscCode" value={formData.bankDetails.ifscCode} onChange={handleBankDetailsChange}
                            placeholder="SBIN0001234"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Bank Name</label>
                          <input type="text" name="bankName" value={formData.bankDetails.bankName} onChange={handleBankDetailsChange}
                            placeholder="State Bank of India"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: Documents & Profile Image */}
                {currentStep === 4 && (
                  <div className="space-y-6 animate-fadeIn">
                    <h3 className="text-md font-semibold text-slate-700 flex items-center gap-2 mb-4">
                      <FileText size={18} className="text-[#3DB9A6]" /> Upload Documents & Profile Image
                    </h3>

                    {/* Profile Image Upload */}
                    <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200/80 flex flex-col md:flex-row items-center gap-6">
                      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#3DB9A6] bg-slate-100 flex items-center justify-center flex-shrink-0">
                        {formData.profileImage ? (
                          <img src={formData.profileImage} alt="Profile Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User size={40} className="text-slate-400" />
                        )}
                        {uploadingFiles.profileImage && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h4 className="text-sm font-semibold text-slate-800">Profile Image</h4>
                        <p className="text-xs text-slate-500 mt-1 mb-3">Upload a clean professional portrait. Max 5MB (JPG, PNG).</p>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition cursor-pointer text-xs font-semibold shadow-sm">
                          <Upload size={14} />
                          {formData.profileImage ? 'Change Image' : 'Choose Image'}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'profileImage')} disabled={uploadingFiles.profileImage} />
                        </label>
                        {formData.profileImage && (
                          <button type="button" onClick={() => setFormData(prev => ({ ...prev, profileImage: '' }))} className="ml-3 inline-flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-semibold">
                            <X size={14} /> Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Documents Upload Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'identityProof', label: 'Identity Proof', desc: 'Aadhaar, Passport, or Voter ID' },
                        { key: 'qualificationCertificate', label: 'Qualification Certificate', desc: 'Degree or Diploma certificate' },
                        { key: 'businessLicense', label: 'Business License', desc: 'Registration or Trade license document' },
                        { key: 'insuranceCertificate', label: 'Insurance Certificate', desc: 'Professional indemnity or business insurance' },
                        { key: 'policeVerification', label: 'Police Verification Document', desc: 'Clearance certificate or verification report' }
                      ].map((doc) => {
                        const key = doc.key as 'identityProof' | 'qualificationCertificate' | 'businessLicense' | 'insuranceCertificate' | 'policeVerification';
                        const fileUrl = formData.documents[key].url;
                        const isUploading = uploadingFiles[key];
                        return (
                          <div key={doc.key} className="border border-slate-200 rounded-xl p-4 bg-white hover:border-slate-300 transition-all flex flex-col justify-between shadow-sm">
                            <div>
                              <div className="flex items-start justify-between">
                                <h4 className="text-sm font-semibold text-slate-800">{doc.label}</h4>
                                {fileUrl && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-semibold rounded-full border border-green-200">
                                    <Check size={10} /> Uploaded
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-1 mb-4">{doc.desc}</p>
                            </div>

                            <div className="flex items-center justify-between gap-3 mt-2 pt-3 border-t border-slate-100">
                              {fileUrl ? (
                                <>
                                  <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#3DB9A6] hover:underline font-semibold flex items-center gap-1">
                                    <FileText size={14} /> View File
                                  </a>
                                  <button type="button" onClick={() => setFormData(prev => ({
                                    ...prev,
                                    documents: {
                                      ...prev.documents,
                                      [key]: { type: prev.documents[key].type, url: '' }
                                    }
                                  }))} className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1">
                                    <X size={14} /> Remove
                                  </button>
                                </>
                              ) : (
                                <label className={`inline-flex items-center gap-2 px-4 py-2 border rounded-lg transition cursor-pointer text-xs font-semibold shadow-sm w-full justify-center ${
                                  isUploading ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                }`}>
                                  {isUploading ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-slate-400 border-t-transparent"></div>
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload size={14} /> Upload Document
                                    </>
                                  )}
                                  <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, key)} disabled={isUploading} />
                                </label>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between pt-8 mt-8 border-t border-slate-100">
                {currentStep > 1 ? (
                  <button type="button" onClick={handleBack} disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition font-medium">
                    <ChevronLeft size={18} /> Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <button type="button" onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition font-medium">
                    Next <ChevronRight size={18} />
                  </button>
                ) : (
                  <button type="submit" disabled={loading}
                    className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition font-medium disabled:opacity-50">
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Registering...
                      </>
                    ) : (
                      'Submit Registration'
                    )}
                  </button>
                )}
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRegisterPage;
