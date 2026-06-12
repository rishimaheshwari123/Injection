import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Briefcase, MapPin, CreditCard, ChevronRight, ChevronLeft, Check, Package } from 'lucide-react';
import { vendorAPI, serviceAPI } from '../services/api';
import { toast } from 'react-toastify';

const VendorRegisterPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [fetchingServices, setFetchingServices] = useState(true);

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
    services: [] as string[]
  });

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
      if (formData.alternatePhone && !/^[0-9]{10}$/.test(formData.alternatePhone)) return 'Provide a valid 10-digit alternate phone number';
    } else if (currentStep === 2) {
      if (!formData.businessName.trim()) return 'Business Name is required';
      if (!formData.address.trim()) return 'Address is required';
      if (!formData.city.trim()) return 'City is required';
      if (!formData.state.trim()) return 'State is required';
      if (!/^[0-9]{6}$/.test(formData.pincode)) return 'Provide a valid 6-digit pincode';
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
      const submitData = {
        ...formData,
        experience: formData.experience ? Number(formData.experience) : 0
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
                    { step: 3, label: 'Services & Banking', icon: CreditCard }
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
                    <p className="text-sm text-slate-500 mt-1">Complete your registration in 3 simple steps</p>
                  </div>
                  <span className="px-3 py-1 bg-[#63D64F]/10 text-[#3DB9A6] text-xs font-semibold rounded-full uppercase tracking-wider">
                    Step {currentStep} of 3
                  </span>
                </div>

                {/* STEP 1: Account Info */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-fadeIn">
                    <h3 className="text-md font-semibold text-slate-700 flex items-center gap-2 mb-2">
                      <User size={18} className="text-[#3DB9A6]" /> Account Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Owner Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required
                          placeholder="John Doe"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Email Address *</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required
                          placeholder="john@example.com"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password *</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required
                          placeholder="••••••••"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone Number *</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required
                          placeholder="9876543210"
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none transition" />
                      </div>
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
                                <p className="text-xs text-slate-500 mt-0.5">{service.category} - ₹{service.basePrice}</p>
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

                {currentStep < 3 ? (
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
