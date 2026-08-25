import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Check, Upload, Eye, EyeOff } from 'lucide-react';
import { ambassadorAPI, otpAPI } from '../services/api';
import { toast } from 'react-toastify';
import { LocationAutocomplete } from '../components/LocationAutocomplete';

const AmbassadorRegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Password Visibility States
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      const response = await otpAPI.sendOtp(formData.phone, 'ambassador');
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
    // Step 1: Personal Info
    name: '',
    dob: '',
    gender: 'Male',
    email: '',
    phone: '',
    aadhaarNumber: '',
    panNumber: '',
    password: '',
    confirmPassword: '',

    // Step 2: Address & Coverage
    address: '',
    state: '',
    city: '',
    district: '',
    pincode: '',
    areaCovered: '',

    // Step 3: Professional Profile
    occupation: '',
    company: '',
    qualification: '',
    experience: '',
    joinAs: 'City Venue Partner',
    hasSalesExperience: false,
    hasDigitalMarketingExperience: false,

    // Step 5 (Step 4): Bank Details
    upiId: '',
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    referredBy: '',

    // Step 6: Document Upload & declaration
    documents: {
      aadhaarFront: '',
      aadhaarBack: '',
      panCard: '',
      passportPhoto: ''
    },
    termsAccepted: false,
    signatureName: '',
    place: ''
  });

  const [uploadingFiles, setUploadingFiles] = useState({
    aadhaarFront: false,
    aadhaarBack: false,
    panCard: false,
    passportPhoto: false
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
      const response = await ambassadorAPI.uploadFile(file);
      if (response.data.success) {
        const fileUrl = response.data.data.url;
        setFormData(prev => ({
          ...prev,
          documents: {
            ...prev.documents,
            [fieldName]: fileUrl
          }
        }));
        toast.success(`${file.name} uploaded successfully!`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'File upload failed');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: val
    }));

    if (name === "phone") {
      if (value === lastVerifiedPhone && lastVerifiedPhone !== "") {
        setIsPhoneVerified(true);
      } else {
        setIsPhoneVerified(false);
      }
    }
  };

  const getStepProgress = () => {
    switch (currentStep) {
      case 1: return { percent: 17, text: 'STEP 1 OF 5: PERSONAL INFORMATION' };
      case 2: return { percent: 33, text: 'STEP 2 OF 5: ADDRESS & COVERAGE' };
      case 3: return { percent: 50, text: 'STEP 3 OF 5: PROFESSIONAL PROFILE' };
      case 4: return { percent: 83, text: 'STEP 4 OF 5: BANK & REFERRAL' };
      case 5: return { percent: 100, text: 'STEP 5 OF 5: DOCUMENT UPLOAD & DECLARATION' };
      default: return { percent: 0, text: '' };
    }
  };

  const validateStep = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) return 'Full Name is required';
      if (!formData.dob) return 'Date of Birth is required';
      if (!formData.email.trim() || !formData.email.includes('@')) return 'Provide a valid email';
      if (!/^[0-9]{10}$/.test(formData.phone)) return 'Provide a valid 10-digit phone number';
      if (!isPhoneVerified) return 'Please verify the phone number via OTP first';
      if (!/^[0-9]{12}$/.test(formData.aadhaarNumber)) return 'Provide a valid 12-digit Aadhaar Card Number';
      if (formData.password.length < 6) return 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    } else if (currentStep === 2) {
      if (!formData.address.trim()) return 'Current Address is required';
      if (!formData.state.trim()) return 'State is required';
      if (!formData.city.trim()) return 'City is required';
      if (!formData.areaCovered.trim()) return 'Area / Locality you will cover is required';
    } else if (currentStep === 5) {
      if (!formData.documents.aadhaarFront) return 'Aadhaar Card Front Side image is required';
      if (!formData.termsAccepted) return 'You must agree and accept all the terms';
      if (!formData.signatureName.trim()) return 'Applicant Signature/Full Name is required';
      if (!formData.place.trim()) return 'Place is required';
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
    const error = validateStep();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      const response = await ambassadorAPI.register(formData);
      if (response.data.success) {
        toast.success('Ambassador account registered successfully! Pending Admin activation.');
        navigate('/login');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const progress = getStepProgress();

  return (
    <div className="min-h-[80vh] flex flex-col justify-center py-6">
      
      {/* Progress Bar Header */}
      <div className="max-w-4xl mx-auto w-full mb-6 px-4">
        <div className="flex justify-between items-center text-xs font-bold text-[#3DB9A6] tracking-wider mb-2">
          <span>{progress.text}</span>
          <span>{progress.percent}% Complete</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] h-full rounded-full transition-all duration-500" 
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl mx-auto overflow-hidden border border-slate-100 p-8 md:p-12">
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* STEP 1: PERSONAL INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-800">Part A: Personal Information & Account Setup</h2>
                <p className="text-sm text-slate-500 mt-1">Provide your primary details and configure secure account password.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Full Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required
                    placeholder="e.g. Rishi Maheshwari"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Date of Birth *</label>
                  <input 
                    type="date" 
                    name="dob" 
                    value={formData.dob} 
                    onChange={handleChange} 
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Email Address *</label>
                  <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    required
                    placeholder="e.g. rishimaheshwari040@gmail.com"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Gender *</label>
                  <select 
                    name="gender" 
                    value={formData.gender} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50 text-slate-700"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Phone Number (WhatsApp Number) *</label>
                  <div className="flex gap-3">
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      required
                      disabled={otpSent}
                      placeholder="e.g. 9009594537"
                      className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50 ${
                        isPhoneVerified ? "border-green-300 bg-green-50 text-green-700 font-semibold" : "border-slate-200"
                      }`} 
                    />
                    {!isPhoneVerified ? (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || otpSent || !/^[0-9]{10}$/.test(formData.phone)}
                        className="px-6 py-3 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-bold rounded-lg hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center min-w-[100px]"
                      >
                        {sendingOtp ? 'Sending...' : otpSent ? 'Sent' : '✓ Verify'}
                      </button>
                    ) : (
                      <span className="px-4 py-3 bg-green-50 border border-green-200 text-green-700 font-bold rounded-lg text-xs flex items-center gap-1">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                </div>

                {otpSent && (
                  <div className="md:col-span-2 bg-green-50/50 border border-green-100 rounded-xl p-4 mt-2">
                    <p className="text-xs text-green-800 mb-3 font-semibold">
                      An OTP has been sent to {formData.phone}. Please enter the 6-digit verification code below:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter OTP"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full sm:w-32 px-4 py-2.5 border border-slate-350 rounded-lg focus:ring-2 focus:ring-[#63D64F] outline-none text-center font-extrabold tracking-widest text-lg bg-white"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={verifyingOtp || otpCode.length !== 6}
                        className="px-6 py-3 bg-[#3DB9A6] text-white font-bold rounded-lg hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                      >
                        {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Aadhaar Card Number *</label>
                  <input 
                    type="text" 
                    name="aadhaarNumber" 
                    value={formData.aadhaarNumber} 
                    onChange={handleChange} 
                    required
                    placeholder="e.g. 123456789123"
                    maxLength={12}
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">PAN Card Number (Optional)</label>
                  <input 
                    type="text" 
                    name="panNumber" 
                    value={formData.panNumber} 
                    onChange={handleChange} 
                    placeholder="e.g. EWWWR7107Z"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Create Password *</label>
                  <div className="relative">
                    <input 
                      type={showCreatePassword ? 'text' : 'password'} 
                      name="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      required
                      placeholder="••••••••"
                      className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowCreatePassword(!showCreatePassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition"
                    >
                      {showCreatePassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Confirm Password *</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? 'text' : 'password'} 
                      name="confirmPassword" 
                      value={formData.confirmPassword} 
                      onChange={handleChange} 
                      required
                      placeholder="••••••••"
                      className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-650 transition"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ADDRESS & COVERAGE */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-800">Part B: Address & Coverage Area Details</h2>
                <p className="text-sm text-slate-500 mt-1">Provide details of your local address and target service coverage areas.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Current Address *</label>
                  <textarea 
                    name="address" 
                    value={formData.address} 
                    onChange={handleChange} 
                    required
                    rows={3}
                    placeholder="e.g. Chhapri talluk"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50 resize-none" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">State *</label>
                    <div className="relative">
                      <LocationAutocomplete 
                        value={formData.state} 
                        onChange={(val) => setFormData(prev => ({ ...prev, state: val }))}
                        type="(regions)"
                        placeholder="e.g. Madhya Pradesh"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">City *</label>
                    <div className="relative">
                      <LocationAutocomplete 
                        value={formData.city} 
                        onChange={(val) => setFormData(prev => ({ ...prev, city: val }))}
                        type="(cities)"
                        placeholder="e.g. Ashta"
                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">District</label>
                    <input 
                      type="text" 
                      name="district" 
                      value={formData.district} 
                      onChange={handleChange} 
                      placeholder="e.g. Sehore"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Pin Code (Optional)</label>
                    <div className="relative">
                      <LocationAutocomplete 
                        value={formData.pincode} 
                        onChange={(val) => setFormData(prev => ({ ...prev, pincode: val }))}
                        type="postal_code"
                        placeholder="e.g. 466113"
                        className="w-full pl-4 pr-10 py-3 border border-slate-250 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Area / Locality You Will Cover *</label>
                  <input 
                    type="text" 
                    name="areaCovered" 
                    value={formData.areaCovered} 
                    onChange={handleChange} 
                    required
                    placeholder="e.g. Local venues, blocks"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PROFESSIONAL PROFILE */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-800">Part C & D: Professional Background & Profile</h2>
                <p className="text-sm text-slate-500 mt-1">Tell us about your educational qualification, experience and roles.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Current Occupation</label>
                  <input 
                    type="text" 
                    name="occupation" 
                    value={formData.occupation} 
                    onChange={handleChange} 
                    placeholder="e.g. Sales Executive"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Company / Organization (If any)</label>
                  <input 
                    type="text" 
                    name="company" 
                    value={formData.company} 
                    onChange={handleChange} 
                    placeholder="e.g. Freelance Marketing"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Education Qualification</label>
                  <input 
                    type="text" 
                    name="qualification" 
                    value={formData.qualification} 
                    onChange={handleChange} 
                    placeholder="e.g. Graduate"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Work Experience</label>
                  <input 
                    type="text" 
                    name="experience" 
                    value={formData.experience} 
                    onChange={handleChange} 
                    placeholder="e.g. 2 years in retail sales"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">I want to join RentalMeet as:</label>
                  <select 
                    name="joinAs" 
                    value={formData.joinAs} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50 text-slate-700"
                  >
                    <option value="City Venue Partner">City Venue Partner</option>
                    <option value="Area Coordinator">Area Coordinator</option>
                    <option value="Ambassador">Ambassador</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-4 border border-slate-250 rounded-xl hover:bg-slate-50 transition cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="hasSalesExperience" 
                      checked={formData.hasSalesExperience} 
                      onChange={handleChange}
                      className="w-5 h-5 text-[#3DB9A6] focus:ring-[#3DB9A6] border-slate-300 rounded"
                    />
                    <span className="text-sm font-semibold text-slate-700">I have Sales / Marketing Experience</span>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-slate-250 rounded-xl hover:bg-slate-50 transition cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="hasDigitalMarketingExperience" 
                      checked={formData.hasDigitalMarketingExperience} 
                      onChange={handleChange}
                      className="w-5 h-5 text-[#3DB9A6] focus:ring-[#3DB9A6] border-slate-300 rounded"
                    />
                    <span className="text-sm font-semibold text-slate-700">I have Digital Marketing Experience</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: BANK & REFERRAL */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-800">Part G & H: Bank Details for Payouts & Referral</h2>
                <p className="text-sm text-slate-500 mt-1">Provide bank or UPI details for direct instant reward transfers.</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">UPI ID (Fastest Payouts)</label>
                  <input 
                    type="text" 
                    name="upiId" 
                    value={formData.upiId} 
                    onChange={handleChange} 
                    placeholder="e.g. yourname@okhdfcbank"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Account Holder Name</label>
                    <input 
                      type="text" 
                      name="accountHolderName" 
                      value={formData.accountHolderName} 
                      onChange={handleChange} 
                      placeholder="Name as per Bank"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Bank Name</label>
                    <input 
                      type="text" 
                      name="bankName" 
                      value={formData.bankName} 
                      onChange={handleChange} 
                      placeholder="e.g. HDFC, SBI, ICICI"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Account Number</label>
                    <input 
                      type="text" 
                      name="accountNumber" 
                      value={formData.accountNumber} 
                      onChange={handleChange} 
                      placeholder="Account Number (Encrypted)"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">IFSC Code</label>
                    <input 
                      type="text" 
                      name="ifscCode" 
                      value={formData.ifscCode} 
                      onChange={handleChange} 
                      placeholder="e.g. HDFC0001234"
                      className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Referred By (Ambassador Referral Code)</label>
                  <input 
                    type="text" 
                    name="referredBy" 
                    value={formData.referredBy} 
                    onChange={handleChange} 
                    placeholder="e.g. AMB82910X (OPTIONAL)"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: DOCUMENT UPLOAD & DECLARATION */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-800">Part I & J: Document Upload & Declaration</h2>
                <p className="text-sm text-slate-500 mt-1">Upload verified files and acknowledge the partner declaration terms.</p>
              </div>

              {/* Upload Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Aadhaar Front */}
                <div className="border border-slate-200 rounded-xl p-5 hover:shadow-sm transition bg-slate-50/20">
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-3">Aadhaar Card (Front Side) *</label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 bg-white">
                    {formData.documents.aadhaarFront ? (
                      <div className="w-full text-center space-y-2">
                        <span className="text-green-600 text-xs font-bold block">✓ File Uploaded</span>
                        <img src={formData.documents.aadhaarFront} alt="Aadhaar Front" className="h-28 object-contain mx-auto border rounded" />
                        <button type="button" onClick={() => setFormData(p => ({ ...p, documents: { ...p.documents, aadhaarFront: '' } }))} className="text-xs text-red-500 hover:underline">Remove file</button>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <Upload className="text-slate-400 mx-auto" size={32} />
                        <label className="cursor-pointer px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-bold rounded-lg text-xs hover:shadow transition inline-block">
                          {uploadingFiles.aadhaarFront ? 'Uploading...' : 'Upload Aadhaar Front'}
                          <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'aadhaarFront')} disabled={uploadingFiles.aadhaarFront} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Aadhaar Back */}
                <div className="border border-slate-200 rounded-xl p-5 hover:shadow-sm transition bg-slate-50/20">
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-3">Aadhaar Card (Back Side)</label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 bg-white">
                    {formData.documents.aadhaarBack ? (
                      <div className="w-full text-center space-y-2">
                        <span className="text-green-600 text-xs font-bold block">✓ File Uploaded</span>
                        <img src={formData.documents.aadhaarBack} alt="Aadhaar Back" className="h-28 object-contain mx-auto border rounded" />
                        <button type="button" onClick={() => setFormData(p => ({ ...p, documents: { ...p.documents, aadhaarBack: '' } }))} className="text-xs text-red-500 hover:underline">Remove file</button>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <Upload className="text-slate-400 mx-auto" size={32} />
                        <label className="cursor-pointer px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-bold rounded-lg text-xs hover:shadow transition inline-block">
                          {uploadingFiles.aadhaarBack ? 'Uploading...' : 'Upload Aadhaar Back'}
                          <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'aadhaarBack')} disabled={uploadingFiles.aadhaarBack} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* PAN Card */}
                <div className="border border-slate-200 rounded-xl p-5 hover:shadow-sm transition bg-slate-50/20">
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-3">PAN Card (Optional)</label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 bg-white">
                    {formData.documents.panCard ? (
                      <div className="w-full text-center space-y-2">
                        <span className="text-green-600 text-xs font-bold block">✓ File Uploaded</span>
                        <img src={formData.documents.panCard} alt="PAN Card" className="h-28 object-contain mx-auto border rounded" />
                        <button type="button" onClick={() => setFormData(p => ({ ...p, documents: { ...p.documents, panCard: '' } }))} className="text-xs text-red-500 hover:underline">Remove file</button>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <Upload className="text-slate-400 mx-auto" size={32} />
                        <label className="cursor-pointer px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-bold rounded-lg text-xs hover:shadow transition inline-block">
                          {uploadingFiles.panCard ? 'Uploading...' : 'Upload PAN Card'}
                          <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'panCard')} disabled={uploadingFiles.panCard} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Passport Photo */}
                <div className="border border-slate-200 rounded-xl p-5 hover:shadow-sm transition bg-slate-50/20">
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-3">Passport Size Photo</label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 bg-white">
                    {formData.documents.passportPhoto ? (
                      <div className="w-full text-center space-y-2">
                        <span className="text-green-600 text-xs font-bold block">✓ File Uploaded</span>
                        <img src={formData.documents.passportPhoto} alt="Passport Photo" className="h-28 object-contain mx-auto border rounded" />
                        <button type="button" onClick={() => setFormData(p => ({ ...p, documents: { ...p.documents, passportPhoto: '' } }))} className="text-xs text-red-500 hover:underline">Remove file</button>
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <Upload className="text-slate-400 mx-auto" size={32} />
                        <label className="cursor-pointer px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-bold rounded-lg text-xs hover:shadow transition inline-block">
                          {uploadingFiles.passportPhoto ? 'Uploading...' : 'Upload Photo'}
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'passportPhoto')} disabled={uploadingFiles.passportPhoto} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms Acceptance Banner */}
              <div className="bg-[#3DB9A6]/5 border border-[#3DB9A6]/20 rounded-xl p-6 space-y-4">
                <span className="text-sm font-bold text-[#3DB9A6]">Applicant Declaration:</span>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-650">
                  <li>The information provided by me is true and correct.</li>
                  <li>I agree to follow RentalMeet™ venue verification guidelines.</li>
                  <li>I will not upload fake, duplicate, or misleading venue information.</li>
                  <li>I understand payments will be made only for verified & approved venue listings.</li>
                  <li>I agree to RentalMeet™ Ambassador Program terms & conditions.</li>
                </ul>

                <label className="flex items-center gap-3 cursor-pointer pt-2">
                  <input 
                    type="checkbox" 
                    name="termsAccepted" 
                    checked={formData.termsAccepted} 
                    onChange={handleChange}
                    required
                    className="w-5 h-5 text-[#3DB9A6] focus:ring-[#3DB9A6] border-[#3DB9A6]/20 rounded"
                  />
                  <span className="text-xs font-bold text-slate-700">I agree and accept all the terms above.</span>
                </label>
              </div>

              {/* Sign & Place */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Applicant Signature / Full Name *</label>
                  <input 
                    type="text" 
                    name="signatureName" 
                    value={formData.signatureName} 
                    onChange={handleChange} 
                    required
                    placeholder="Enter Full Name"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-650 uppercase tracking-wider mb-2">Place *</label>
                  <input 
                    type="text" 
                    name="place" 
                    value={formData.place} 
                    onChange={handleChange} 
                    required
                    placeholder="e.g. Ashta"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] focus:border-transparent outline-none transition bg-slate-50/50" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stepper controls */}
          <div className="flex justify-between items-center pt-6 border-t border-slate-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-lg hover:bg-slate-50 transition text-sm flex items-center gap-2"
              >
                <ChevronLeft size={16} />
                <span>Previous</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-bold rounded-lg hover:shadow-lg transition text-sm flex items-center gap-2 ml-auto"
              >
                <span>Next Step</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-[#10B981] hover:bg-[#059669] text-white font-extrabold rounded-lg hover:shadow-lg transition text-sm flex items-center gap-2 ml-auto disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit & Join Network'}
                <Check size={16} />
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};

export default AmbassadorRegisterPage;
