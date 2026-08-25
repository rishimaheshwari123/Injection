import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, CreditCard, Check, Plus, X, Package, FileText, MapPin } from 'lucide-react';
import { ambassadorAPI, serviceAPI, vendorAPI, otpAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { LocationAutocomplete } from '../../components/LocationAutocomplete';

const AmbassadorRegisterVendorPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [fetchingServices, setFetchingServices] = useState(true);

  // OTP Verification States
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [lastVerifiedPhone, setLastVerifiedPhone] = useState('');

  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    email: '',
    password: '',
    phone: '',
    alternatePhone: '',
    gender: 'Male',

    // Business Info
    businessName: '',
    businessType: 'Individual',
    registrationNumber: '',
    gstNumber: '',
    experience: '',
    specialization: '',
    bio: '',

    // Location Details
    address: '',
    city: '',
    state: '',
    pincode: '',
    longitude: '75.8577',
    latitude: '22.7196',

    // Bank Details
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: ''
    },

    // Services (IDs list)
    services: [] as string[],

    // Uploads
    profileImage: '',
    documents: {
      identityProof: { type: 'Identity Proof', url: '' },
      qualificationCertificate: { type: 'Qualification Certificate', url: '' },
      businessLicense: { type: 'Business License', url: '' },
      insuranceCertificate: { type: 'Insurance Certificate', url: '' },
      policeVerification: { type: 'Police Verification', url: '' }
    }
  });

  const [uploadingFiles, setUploadingFiles] = useState({
    profileImage: false,
    identityProof: false,
    qualificationCertificate: false,
    businessLicense: false,
    insuranceCertificate: false,
    policeVerification: false
  });

  // Set default coordinates on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData(prev => ({
            ...prev,
            longitude: pos.coords.longitude.toString(),
            latitude: pos.coords.latitude.toString()
          }));
        },
        (err) => console.error(err)
      );
    }
  }, []);

  // Fetch list of services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await serviceAPI.getPublicServices();
        if (response.data.success) {
          setServicesList(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load services list:', err);
        toast.error('Failed to load services');
      } finally {
        setFetchingServices(false);
      }
    };
    fetchServices();
  }, []);

  const handleSendOtp = async () => {
    if (!/^[0-9]{10}$/.test(formData.phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setSendingOtp(true);
    try {
      const response = await otpAPI.sendOtp(formData.phone, 'vendor');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPhoneVerified) {
      toast.error('Please verify the phone number via OTP first');
      return;
    }

    setLoading(true);
    try {
      const cleanedDocuments: any = {};
      Object.entries(formData.documents || {}).forEach(([key, value]: [string, any]) => {
        if (value && value.url) {
          cleanedDocuments[key] = value;
        }
      });

      const submitData = {
        ...formData,
        verificationStatus: 'pending',
        documents: Object.keys(cleanedDocuments).length > 0 ? cleanedDocuments : undefined,
        profileImage: formData.profileImage || undefined
      };

      const response = await ambassadorAPI.registerVendor(submitData);
      if (response.data.success) {
        toast.success('Vendor partner registered successfully! Pending admin verification.');
        navigate('/ambassador');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fadeIn">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Add New Vendor Partner</h1>
        <p className="text-sm text-slate-500 mt-1">Register a vendor partner on the platform. All fields match the official registration structure.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">

          {/* SECTION 1: Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b">
              <User size={18} className="text-[#3DB9A6]" /> Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-750 mb-1">Owner Name *</label>
                <input type="text" required value={formData.name} name="name" onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-750 mb-1">Email *</label>
                <input type="email" required value={formData.email} name="email" onChange={handleChange}
                  placeholder="e.g. email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-750 mb-1">Password *</label>
                <input type="password" required value={formData.password} name="password" onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-750 mb-1">Phone *</label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, phone: val });
                      if (val === lastVerifiedPhone && lastVerifiedPhone !== '') {
                        setIsPhoneVerified(true);
                      } else {
                        setIsPhoneVerified(false);
                      }
                    }}
                    disabled={otpSent}
                    placeholder="10-digit number"
                    className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none transition-all ${
                      isPhoneVerified ? 'border-green-300 bg-green-55 text-green-700 font-semibold' : 'border-gray-300'
                    }`}
                  />
                  {!isPhoneVerified ? (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={sendingOtp || otpSent || !/^[0-9]{10}$/.test(formData.phone)}
                      className="px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-semibold rounded-lg hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed text-xs flex items-center justify-center min-w-[90px]"
                    >
                      {sendingOtp ? 'Sending...' : otpSent ? 'Sent' : 'Verify'}
                    </button>
                  ) : (
                    <span className="px-3 py-2 bg-green-100 text-green-700 font-bold rounded-lg text-xs flex items-center gap-1">
                      ✓ Verified
                    </span>
                  )}
                </div>
              </div>

              {otpSent && (
                <div className="md:col-span-2 bg-[#f4fbf3] border border-[#d2f4cc] rounded-xl p-4 mt-2 animate-fadeIn">
                  <p className="text-xs text-slate-600 mb-2 font-medium">An OTP has been sent to {formData.phone}. Please enter the 6-digit verification code below:</p>
                  <div className="flex gap-3 items-center">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter OTP"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none text-center font-bold tracking-widest text-base"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || otpCode.length !== 6}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg hover:shadow-md transition disabled:opacity-50 text-xs"
                    >
                      {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-gray-505 hover:text-gray-700 hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-750 mb-1">Alternate Phone</label>
                <input type="tel" value={formData.alternatePhone} name="alternatePhone" onChange={handleChange}
                  placeholder="Alternate Contact"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-750 mb-1">Gender *</label>
                <select required value={formData.gender} name="gender" onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none">
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b">
              <Briefcase size={18} className="text-[#3DB9A6]" /> Business Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-750 mb-1">Business Name *</label>
                <input type="text" required value={formData.businessName} name="businessName" onChange={handleChange}
                  placeholder="e.g. City Diagnostics"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-750 mb-1">Business Type *</label>
                <select required value={formData.businessType} name="businessType" onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none">
                  <option value="Individual">Individual</option>
                  <option value="Clinic">Clinic</option>
                  <option value="Hospital">Hospital</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Pharmacy">Pharmacy</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-750 mb-1">Registration Number</label>
                <input type="text" value={formData.registrationNumber} name="registrationNumber" onChange={handleChange}
                  placeholder="Registration ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-750 mb-1">GST Number</label>
                <input type="text" value={formData.gstNumber} name="gstNumber" onChange={handleChange}
                  placeholder="Optional GSTIN"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-750 mb-1">Experience (Years)</label>
                <input type="number" value={formData.experience} name="experience" onChange={handleChange}
                  placeholder="e.g. 5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-750 mb-1">Specialization</label>
                <input type="text" value={formData.specialization} name="specialization" onChange={handleChange}
                  placeholder="e.g. General Medicine"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-750 mb-1">Bio</label>
                <textarea value={formData.bio} name="bio" onChange={handleChange} rows={3}
                  placeholder="Brief biography or description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none resize-none" />
              </div>
            </div>
          </div>

          {/* SECTION 3: Offered Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b">
              <Package size={18} className="text-[#3DB9A6]" /> Offered Services
            </h3>
            <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-4 space-y-2">
              {fetchingServices ? (
                <p className="text-sm text-gray-500">Loading services...</p>
              ) : servicesList.map((service) => (
                <label key={service._id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-2 rounded border border-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.services.includes(service._id)}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setFormData(prev => ({
                        ...prev,
                        services: checked
                          ? [...prev.services, service._id]
                          : prev.services.filter(id => id !== service._id)
                      }));
                    }}
                    className="w-4 h-4 text-[#3DB9A6] border-gray-300 rounded focus:ring-[#3DB9A6]"
                  />
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.serviceName}
                      className="w-10 h-10 object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-100 rounded-md border flex items-center justify-center text-slate-400">
                      <Package size={20} />
                    </div>
                  )}
                  <div>
                    <span className="text-sm text-gray-700 font-semibold block">
                      {service.serviceName}
                    </span>
                    <span className="text-xs text-gray-500 block">
                      Category: {typeof service.category === 'object' && service.category ? service.category.name : service.category} - ₹{service.basePrice}
                    </span>
                  </div>
                </label>
              ))}
              {!fetchingServices && servicesList.length === 0 && (
                <p className="text-sm text-gray-500">No services available.</p>
              )}
            </div>
          </div>

          {/* SECTION 4: Location Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b">
              <MapPin size={18} className="text-[#3DB9A6]" /> Location Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-750 mb-1">Address *</label>
                <input type="text" required value={formData.address} name="address" onChange={handleChange}
                  placeholder="Street details"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none" />
              </div>
              <div className="relative z-30">
                <label className="block text-sm font-medium text-gray-750 mb-1">City *</label>
                <LocationAutocomplete
                  value={formData.city}
                  onChange={(val) => setFormData({ ...formData, city: val })}
                  type="(cities)"
                  placeholder="Bhopal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none"
                />
              </div>
              <div className="relative z-30">
                <label className="block text-sm font-medium text-gray-750 mb-1">State *</label>
                <LocationAutocomplete
                  value={formData.state}
                  onChange={(val) => setFormData({ ...formData, state: val })}
                  type="(regions)"
                  placeholder="Madhya Pradesh"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none"
                />
              </div>
              <div className="relative z-20">
                <label className="block text-sm font-medium text-gray-750 mb-1">Pincode *</label>
                <LocationAutocomplete
                  value={formData.pincode}
                  onChange={(val) => setFormData({ ...formData, pincode: val })}
                  type="postal_code"
                  placeholder="452001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Bank Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b">
              <CreditCard size={18} className="text-[#3DB9A6]" /> Bank Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-750 mb-1">Account Holder Name</label>
                <input type="text" value={formData.bankDetails.accountHolderName} name="accountHolderName" onChange={handleBankDetailsChange}
                  placeholder="Holder Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-750 mb-1">Account Number</label>
                <input type="text" value={formData.bankDetails.accountNumber} name="accountNumber" onChange={handleBankDetailsChange}
                  placeholder="Account Number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-750 mb-1">IFSC Code</label>
                <input type="text" value={formData.bankDetails.ifscCode} name="ifscCode" onChange={handleBankDetailsChange}
                  placeholder="IFSC Code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-750 mb-1">Bank Name</label>
                <input type="text" value={formData.bankDetails.bankName} name="bankName" onChange={handleBankDetailsChange}
                  placeholder="Bank Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3DB9A6] outline-none" />
              </div>
            </div>
          </div>

          {/* SECTION 6: Profile Image & Documents */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2 pb-2 border-b">
              <FileText size={18} className="text-[#3DB9A6]" /> Profile Image & Documents
            </h3>

            {/* Profile Image */}
            <div className="bg-slate-50/50 p-4 rounded-xl border border-gray-200 flex flex-col md:flex-row items-center gap-6">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border border-gray-300 bg-gray-100 flex items-center justify-center flex-shrink-0">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-400 text-xs">No Image</span>
                )}
                {uploadingFiles.profileImage && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  </div>
                )}
              </div>
              <div className="flex-grow text-center md:text-left">
                <h4 className="text-sm font-semibold text-gray-800">Profile Image</h4>
                <p className="text-xs text-gray-500 mt-1 mb-2">Upload a profile image. Max 5MB (JPG, PNG).</p>
                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-705 rounded-lg hover:bg-gray-50 transition cursor-pointer text-xs font-semibold shadow-sm">
                  <Plus size={14} className="text-[#3DB9A6]" />
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

            {/* Documents Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'identityProof', label: 'Identity Proof', desc: 'Aadhaar, Passport, or Voter ID' },
                { key: 'qualificationCertificate', label: 'Qualification Certificate', desc: 'Degree or Diploma certificate' },
                { key: 'businessLicense', label: 'Business License', desc: 'Registration or Trade license' },
                { key: 'insuranceCertificate', label: 'Insurance Certificate', desc: 'Professional indemnity or business insurance' },
                { key: 'policeVerification', label: 'Police Verification Document', desc: 'Clearance certificate or verification report' }
              ].map((doc) => {
                const key = doc.key as 'identityProof' | 'qualificationCertificate' | 'businessLicense' | 'insuranceCertificate' | 'policeVerification';
                const fileUrl = formData.documents?.[key]?.url;
                const isUploading = (uploadingFiles as any)[key];
                return (
                  <div key={doc.key} className="border border-gray-200 rounded-xl p-4 bg-white hover:border-gray-300 transition-all flex flex-col justify-between shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800">{doc.label}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5">{doc.desc}</p>
                      </div>
                      {fileUrl && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-semibold rounded-full border border-green-200">
                          ✓ Uploaded
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-gray-100">
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
                        <label className={`inline-flex items-center gap-2 px-3 py-1.5 border rounded-lg transition cursor-pointer text-xs font-semibold shadow-sm w-full justify-center ${
                          isUploading ? 'bg-gray-50 border-gray-200 text-gray-450 cursor-not-allowed' : 'bg-white border-gray-200 text-gray-707 hover:bg-gray-50'
                        }`}>
                          {isUploading ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-gray-400 border-t-transparent"></div>
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Plus size={14} className="text-[#3DB9A6]" /> Upload
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

          {/* Submit */}
          <div className="pt-4 border-t flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-extrabold rounded-lg hover:shadow-lg transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? 'Submitting...' : 'Register Vendor Partner'}
              <Check size={16} />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AmbassadorRegisterVendorPage;
