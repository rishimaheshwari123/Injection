import { useState, useEffect } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { toast } from 'react-toastify';

interface CreateBookingModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  services: any[];
  users: any[];
  vendors: any[];
  onServiceDetailClick: (service: any) => void;
  bookingToEdit?: any;
}

const CreateBookingModal = ({ show, onClose, onSubmit, services, users, vendors, onServiceDetailClick, bookingToEdit }: CreateBookingModalProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [bookingType, setBookingType] = useState<'self' | 'others'>('self');
  const [selectedUser, setSelectedUser] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionData, setPrescriptionData] = useState({
    doctorName: '',
    doctorRegistration: '',
    hospitalName: '',
    patientComplaints: '',
    diagnosis: '',
    medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
    labTests: '',
    specialInstructions: '',
    followUpDate: '',
  });
  
  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    sex: 'Male',
    address: '',
    pincode: '',
    currentLocation: '',
    alternateMobile: '',
    email: '',
    selectedServices: [] as any[],
    additionalRequirements: '',
    hasInsurance: false,
    insurancePolicyNumber: '',
    freeComplimentaryService: 'None',
    preferredTimeSlot: '',
    preferredDate: '',
    preferredTime: '',
    staffPreference: 'Any Available',
    serviceLocation: 'At Home',
    vendorId: ''
  });

  // Multiple date-time slots state
  const [dateTimeSlots, setDateTimeSlots] = useState<Array<{ date: string; time: string }>>([
    { date: '', time: '' }
  ]);

  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [vendorSearchOpen, setVendorSearchOpen] = useState(false);
  const { bookings } = useAppSelector((state: any) => state.bookings);

  const checkVendorAvailability = (vendorId: string) => {
    const validSlots = dateTimeSlots.filter(s => s.date && s.time);
    if (validSlots.length === 0) return true;

    const isBusy = bookings.some((booking: any) => {
      const bookingVendorId = typeof booking.vendorId === 'object' ? booking.vendorId?._id : booking.vendorId;
      if (!bookingVendorId || bookingVendorId !== vendorId) return false;
      if (booking.bookingStatus === 'cancelled') return false;
      return validSlots.some(slot => {
        const slotString = `${slot.date} ${slot.time}`.trim();
        return booking.preferredTimeSlot?.trim() === slotString;
      });
    });

    return !isBusy;
  };

  const selectedServiceObjects = services.filter((s: any) =>
    formData.selectedServices.some((ss: any) => ss.serviceId === s._id)
  );

  const selectedServiceVendors = selectedServiceObjects.reduce((acc: string[], service: any) => {
    if (service.vendors && Array.isArray(service.vendors)) {
      service.vendors.forEach((v: any) => {
        const vId = typeof v === 'object' ? v._id : v;
        if (vId && !acc.includes(vId)) {
          acc.push(vId);
        }
      });
    }
    return acc;
  }, []);

  const filteredVendors = vendors.filter((vendor: any) => {
    if (formData.vendorId === vendor._id) return true;

    const isAssociated = selectedServiceVendors.includes(vendor._id);
    if (!isAssociated) return false;

    const term = vendorSearchTerm.toLowerCase();
    return (
      vendor.name?.toLowerCase().includes(term) ||
      vendor.businessName?.toLowerCase().includes(term) ||
      vendor.email?.toLowerCase().includes(term) ||
      vendor.phone?.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    const isOriginalVendor = bookingToEdit && (
      (typeof bookingToEdit.vendorId === 'object' ? bookingToEdit.vendorId?._id : bookingToEdit.vendorId) === formData.vendorId
    );

    if (!isOriginalVendor && formData.vendorId && !selectedServiceVendors.includes(formData.vendorId)) {
      setFormData(prev => ({ ...prev, vendorId: '' }));
    }
  }, [formData.selectedServices, selectedServiceVendors, formData.vendorId, bookingToEdit]);

  useEffect(() => {
    if (show) {
      if (bookingToEdit) {
        let dateVal = '';
        let timeVal = '';
        if (bookingToEdit.preferredTimeSlot) {
          const parts = bookingToEdit.preferredTimeSlot.split(' ');
          dateVal = parts[0] || '';
          timeVal = parts[1] || '';
        }

        const mappedServices = (bookingToEdit.selectedServices || []).map((s: any) => ({
          serviceId: s.serviceId?._id || s.serviceId,
          serviceName: s.serviceName,
          price: s.price,
          quantity: s.quantity || 1,
          vendorId: s.vendorId?._id || s.vendorId || ''
        }));

        setFormData({
          patientName: bookingToEdit.patientName || '',
          age: bookingToEdit.age?.toString() || '',
          sex: bookingToEdit.sex || 'Male',
          address: bookingToEdit.address || '',
          pincode: bookingToEdit.pincode || '',
          currentLocation: bookingToEdit.currentLocation || '',
          alternateMobile: bookingToEdit.alternateMobile || '',
          email: bookingToEdit.email || '',
          selectedServices: mappedServices,
          additionalRequirements: bookingToEdit.additionalRequirements || '',
          hasInsurance: !!bookingToEdit.hasInsurance,
          insurancePolicyNumber: bookingToEdit.insurancePolicyNumber || '',
          freeComplimentaryService: bookingToEdit.freeComplimentaryService || 'None',
          preferredTimeSlot: bookingToEdit.preferredTimeSlot || '',
          preferredDate: dateVal,
          preferredTime: timeVal,
          staffPreference: bookingToEdit.staffPreference || 'Any Available',
          serviceLocation: bookingToEdit.serviceLocation || 'At Home',
          vendorId: typeof bookingToEdit.vendorId === 'object' ? bookingToEdit.vendorId?._id : bookingToEdit.vendorId || ''
        });

        const uId = typeof bookingToEdit.userId === 'object' ? bookingToEdit.userId?._id : bookingToEdit.userId;
        const userExists = users.some((u: any) => u._id === uId);

        if (userExists) {
          setBookingType('self');
          setSelectedUser(uId || '');
        } else {
          setBookingType('others');
          setSelectedUser('');
        }

        setDateTimeSlots([{ date: dateVal, time: timeVal }]);
        setVendorSearchTerm('');
        setServiceSearchTerm('');
      } else {
        setBookingType('self');
        setSelectedUser('');
        setFormData({
          patientName: '',
          age: '',
          sex: 'Male',
          address: '',
          pincode: '',
          currentLocation: '',
          alternateMobile: '',
          email: '',
          selectedServices: [],
          additionalRequirements: '',
          hasInsurance: false,
          insurancePolicyNumber: '',
          freeComplimentaryService: 'None',
          preferredTimeSlot: '',
          preferredDate: '',
          preferredTime: '',
          staffPreference: 'Any Available',
          serviceLocation: 'At Home',
          vendorId: ''
        });
        setDateTimeSlots([{ date: '', time: '' }]);
        setVendorSearchTerm('');
        setServiceSearchTerm('');
      }
    }
  }, [show, bookingToEdit, services]);

  const [serviceSearchTerm, setServiceSearchTerm] = useState('');

  const filteredServices = services.filter((service: any) => {
    const term = serviceSearchTerm.toLowerCase();
    const categoryName = typeof service.category === 'object' ? (service.category?.name || "") : (service.category || "");
    return (
      service.serviceName?.toLowerCase().includes(term) ||
      service.description?.toLowerCase().includes(term) ||
      categoryName.toLowerCase().includes(term)
    );
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleServiceToggle = (service: any) => {
    const exists = formData.selectedServices.find((s: any) => s.serviceId === service._id);
    if (exists) {
      setFormData(prev => ({
        ...prev,
        selectedServices: prev.selectedServices.filter((s: any) => s.serviceId !== service._id)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        selectedServices: [...prev.selectedServices, {
          serviceId: service._id,
          serviceName: service.serviceName,
          price: service.basePrice,
          quantity: 1,
          vendorId: service.vendorId?._id || service.vendorId
        }]
      }));
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.selectedServices.reduce((sum: number, s: any) => sum + (s.price * s.quantity), 0);
    const grandTotal = subtotal;
    return { subtotal, grandTotal };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    if (bookingType === 'self' && !selectedUser) {
      toast.error('Please select a user');
      return;
    }

    // Validate all date-time slots
    const validSlots = dateTimeSlots.filter(slot => slot.date && slot.time);
    if (validSlots.length === 0) {
      toast.error('Please add at least one date and time slot');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        formData,
        bookingType,
        selectedUser,
        prescriptionData,
        prescriptionFile,
        dateTimeSlots: validSlots
      });
      
      // Reset form
      setFormData({
        patientName: '',
        age: '',
        sex: 'Male',
        address: '',
        pincode: '',
        currentLocation: '',
        alternateMobile: '',
        email: '',
        selectedServices: [],
        additionalRequirements: '',
        hasInsurance: false,
        insurancePolicyNumber: '',
        freeComplimentaryService: 'None',
        preferredTimeSlot: '',
        preferredDate: '',
        preferredTime: '',
        staffPreference: 'Any Available',
        serviceLocation: 'At Home',
        vendorId: ''
      });
      setDateTimeSlots([{ date: '', time: '' }]);
      setBookingType('self');
      setSelectedUser('');
      setPrescriptionFile(null);
      setPrescriptionData({
        doctorName: '',
        doctorRegistration: '',
        hospitalName: '',
        patientComplaints: '',
        diagnosis: '',
        medications: [{ name: '', dosage: '', frequency: '', duration: '' }],
        labTests: '',
        specialInstructions: '',
        followUpDate: '',
      });
    } catch (error) {
      // Error handled in parent
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-2xl font-bold text-gray-800">
            {bookingToEdit ? "Edit Booking" : "Create New Booking"}
          </h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Booking Type Selection */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Booking For <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="bookingType"
                  value="self"
                  checked={bookingType === 'self'}
                  onChange={(e) => {
                    setBookingType(e.target.value as 'self' | 'others');
                    setSelectedUser('');
                    setFormData(prev => ({
                      ...prev,
                      patientName: '',
                      email: '',
                      age: '',
                      sex: 'Male',
                      alternateMobile: '',
                      address: '',
                      pincode: '',
                      currentLocation: ''
                    }));
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">Existing User (Select from list)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="bookingType"
                  value="others"
                  checked={bookingType === 'others'}
                  onChange={(e) => {
                    setBookingType(e.target.value as 'self' | 'others');
                    setSelectedUser('');
                    setFormData(prev => ({
                      ...prev,
                      patientName: '',
                      email: '',
                      age: '',
                      sex: 'Male',
                      alternateMobile: '',
                      address: '',
                      pincode: '',
                      currentLocation: ''
                    }));
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700">New Patient (Manual Entry)</span>
              </label>
            </div>
          </div>

          {/* Select User (if booking for existing user) */}
          {bookingType === 'self' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Existing User <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedUser}
                onChange={(e) => {
                  const userId = e.target.value;
                  setSelectedUser(userId);
                  
                  if (userId) {
                    const user = users.find((u: any) => u._id === userId);
                    if (user) {
                      setFormData(prev => ({
                        ...prev,
                        patientName: user.name || '',
                        email: user.email || '',
                        age: user.age?.toString() || '',
                        sex: user.sex || 'Male',
                        alternateMobile: user.phone || '',
                        address: user.address || '',
                        pincode: user.pincode || '',
                        currentLocation: user.city || ''
                      }));
                      toast.success('User details auto-filled!');
                    }
                  } else {
                    setFormData(prev => ({
                      ...prev,
                      patientName: '',
                      email: '',
                      age: '',
                      sex: 'Male',
                      alternateMobile: '',
                      address: '',
                      pincode: '',
                      currentLocation: ''
                    }));
                  }
                }}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
              >
                <option value="">Choose a user ({users.length} available)</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name} - {user.email} ({user.role})
                  </option>
                ))}
              </select>
              {users.length === 0 && (
                <p className="text-sm text-red-500 mt-1">No users found. Please create users first.</p>
              )}
              {selectedUser && (
                <p className="text-sm text-green-600 mt-1">✓ User details have been auto-filled below</p>
              )}
            </div>
          )}

          {/* Manual Entry Message (if booking for new patient) */}
          {bookingType === 'others' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">Manual Entry Mode:</span> Please fill in all patient details below manually.
              </p>
            </div>
          )}

          {/* Patient Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="120"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="sex"
                  value={formData.sex}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="alternateMobile"
                  value={formData.alternateMobile}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{10}"
                  placeholder="10-digit number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pincode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  required
                  pattern="[0-9]{6}"
                  placeholder="6-digit pincode"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none resize-none"
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="currentLocation"
                  value={formData.currentLocation}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Near City Hospital"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Service Selection */}
          <div className="border-t pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Select Services</h3>
              <input
                type="text"
                placeholder="Search services by name, category, or description..."
                value={serviceSearchTerm}
                onChange={(e) => setServiceSearchTerm(e.target.value)}
                className="w-full sm:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none text-sm bg-white"
              />
            </div>
            
            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50/30">
              {filteredServices.map((service) => (
                <div
                  key={service._id}
                  className={`flex items-start gap-3 p-4 border rounded-lg transition-all ${
                    formData.selectedServices.find((s: any) => s.serviceId === service._id)
                      ? 'border-[#63D64F] bg-green-50 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!formData.selectedServices.find((s: any) => s.serviceId === service._id)}
                    onChange={() => handleServiceToggle(service)}
                    className="w-5 h-5 text-[#63D64F] mt-1 flex-shrink-0 rounded focus:ring-[#63D64F]"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 text-sm sm:text-base">{service.serviceName}</p>
                        <p className="text-xs sm:text-sm text-gray-600 mt-0.5">{service.description}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs sm:text-sm font-bold text-[#63D64F] bg-green-100/50 px-2 py-0.5 rounded">₹{service.basePrice}</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{service.duration} mins</span>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{typeof service.category === 'object' ? (service.category?.name || "N/A") : (service.category || "N/A")}</span>
                        </div>

                        {/* Associated Vendors list */}
                        {service.vendors && service.vendors.length > 0 && (
                          <div className="mt-3 pt-2.5 border-t border-gray-100">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
                              Available Vendors:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {service.vendors.map((v: any, idx: number) => {
                                const vName = v.businessName || v.name || "Vendor";
                                const isVer = v.isVerified;
                                return (
                                  <span
                                    key={idx}
                                    className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md border font-medium ${
                                      isVer
                                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                                        : 'bg-slate-50 text-slate-700 border-slate-200'
                                    }`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                    {vName}
                                    {isVer && (
                                      <span
                                        className="text-[9px] bg-blue-500 text-white rounded-full w-3.5 h-3.5 flex items-center justify-center font-bold"
                                        title="Verified"
                                      >
                                        ✓
                                      </span>
                                    )}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onServiceDetailClick(service)}
                        className="px-2.5 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0 font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {formData.selectedServices.length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Selected: {formData.selectedServices.length} service(s)</p>
              </div>
            )}
          </div>

          {/* Prescription Upload (Optional) - Truncated for brevity */}
          {/* Add prescription form here similar to original */}

          {/* Preferences - Multiple Date & Time Slots */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Booking Slots</h3>
              <button
                type="button"
                onClick={() => setDateTimeSlots([...dateTimeSlots, { date: '', time: '' }])}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus size={16} />
                Add More Slot
              </button>
            </div>
            
            <div className="space-y-3">
              {dateTimeSlots.map((slot, index) => (
                <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={slot.date}
                        onChange={(e) => {
                          const newSlots = [...dateTimeSlots];
                          newSlots[index].date = e.target.value;
                          setDateTimeSlots(newSlots);
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Time <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={slot.time}
                        onChange={(e) => {
                          const newSlots = [...dateTimeSlots];
                          newSlots[index].time = e.target.value;
                          setDateTimeSlots(newSlots);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none text-sm"
                      />
                    </div>
                  </div>
                  {dateTimeSlots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newSlots = dateTimeSlots.filter((_, i) => i !== index);
                        setDateTimeSlots(newSlots);
                      }}
                      className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove this slot"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {dateTimeSlots.filter(s => s.date && s.time).length > 0 && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  ✓ {dateTimeSlots.filter(s => s.date && s.time).length} booking slot(s) will be created
                </p>
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Staff Preference
              </label>
              <select
                name="staffPreference"
                value={formData.staffPreference}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
              >
                <option value="Any Available">Any Available</option>
                <option value="Male Staff">Male Staff</option>
                <option value="Female Staff">Female Staff</option>
              </select>
            </div>

            <div className="mt-4 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Vendor (Optional)
              </label>
              
              <button
                type="button"
                disabled={formData.selectedServices.length === 0}
                onClick={() => setVendorSearchOpen(!vendorSearchOpen)}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg text-left focus:ring-2 focus:ring-[#63D64F] outline-none flex items-center justify-between text-sm shadow-xs transition-colors ${
                  formData.selectedServices.length === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-50'
                }`}
              >
                <span>
                  {formData.selectedServices.length === 0 ? (
                    "Please select service(s) first"
                  ) : formData.vendorId ? (
                    (() => {
                      const selected = vendors.find(v => v._id === formData.vendorId);
                      if (selected) {
                        const isAvailable = checkVendorAvailability(selected._id);
                        return `${selected.businessName || selected.name} (${selected.email}) - ${isAvailable ? "🟢 Available" : "🔴 Busy"}`;
                      }
                      return "Selected Vendor";
                    })()
                  ) : (
                    "Auto Assign (Based on service default)"
                  )}
                </span>
                <span className="text-gray-400">▼</span>
              </button>

              {vendorSearchOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setVendorSearchOpen(false)}
                  />
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-40 max-h-64 flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-2 border-b border-gray-100 bg-gray-50">
                      <input
                        type="text"
                        placeholder="Type to search vendor..."
                        value={vendorSearchTerm}
                        onChange={(e) => setVendorSearchTerm(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none text-xs bg-white"
                        autoFocus
                      />
                    </div>

                    <div className="overflow-y-auto flex-1 py-1 max-h-48 divide-y divide-gray-50">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, vendorId: '' }));
                          setVendorSearchOpen(false);
                          setVendorSearchTerm('');
                        }}
                        className={`w-full px-4 py-2 text-left text-xs font-semibold hover:bg-gray-100 transition-colors ${
                          !formData.vendorId ? 'bg-green-50 text-[#3DB9A6]' : 'text-gray-700'
                        }`}
                      >
                        Auto Assign (Based on service default)
                      </button>

                      {filteredVendors.map((vendor: any) => {
                        const isAvailable = checkVendorAvailability(vendor._id);
                        const isSelected = formData.vendorId === vendor._id;
                        return (
                          <button
                            key={vendor._id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, vendorId: vendor._id }));
                              setVendorSearchOpen(false);
                              setVendorSearchTerm('');
                            }}
                            className={`w-full px-4 py-2 text-left text-xs hover:bg-gray-100 transition-colors flex items-center justify-between gap-2 ${
                              isSelected ? 'bg-green-50 text-[#3DB9A6] font-bold' : 'text-gray-700'
                            }`}
                          >
                            <span className="truncate">
                              {vendor.businessName || vendor.name} ({vendor.email})
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 font-bold ${
                              isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {isAvailable ? "Available" : "Busy"}
                            </span>
                          </button>
                        );
                      })}

                      {filteredVendors.length === 0 && (
                        <div className="px-4 py-3 text-center text-xs text-gray-500 italic">
                          No vendors match your search
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Pricing Summary */}
          {formData.selectedServices.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Pricing Summary</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total Amount:</span>
                  <span className="text-[#63D64F]">₹{calculateTotals().grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || formData.selectedServices.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {submitting ? (bookingToEdit ? 'Saving...' : 'Creating...') : (bookingToEdit ? 'Save Changes' : 'Create Booking')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBookingModal;
