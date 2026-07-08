import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Shield, FileText, Download, Clock, Building2, Landmark, Briefcase } from 'lucide-react';
import { vendorAPI, bookingAPI, vendorServiceRequestAPI } from '../../services/api';
import { toast } from 'react-toastify';

export default function VendorDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (id) {
      fetchVendorDetails();
      fetchVendorBookings();
      fetchVendorServiceRequests();
    }
  }, [id]);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      const response = await vendorAPI.getVendorById(id!);
      if (response.data && response.data.success) {
        setVendor(response.data.data);
      } else {
        toast.error('Failed to load vendor details');
      }
    } catch (error: any) {
      console.error('Error loading vendor details:', error);
      toast.error(error.response?.data?.message || 'Error loading vendor details');
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await bookingAPI.getAllBookings({ vendorId: id, limit: 1000 });
      if (response.data && response.data.success) {
        setBookings(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading vendor bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const fetchVendorServiceRequests = async () => {
    try {
      const response = await vendorServiceRequestAPI.getAllRequests({ vendor: id });
      if (response.data && response.data.success) {
        setServiceRequests(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading vendor service requests:', error);
    }
  };

  const getServiceAssignmentDate = (serviceId: string) => {
    if (!serviceId) return new Date(vendor.createdAt).toLocaleDateString('en-IN');
    
    // Find the approved service request that contains this service
    const approvedRequest = serviceRequests.find((req: any) => 
      req.status === 'approved' && 
      req.services && 
      req.services.some((s: any) => {
        const idToCheck = typeof s === 'string' ? s : (s._id || s);
        return idToCheck === serviceId;
      })
    );

    if (approvedRequest && approvedRequest.processedAt) {
      return new Date(approvedRequest.processedAt).toLocaleDateString('en-IN');
    }
    
    // Fallback to vendor creation date if no approved request is found
    return new Date(vendor.createdAt).toLocaleDateString('en-IN');
  };

  const formatBookingDateTime = (booking: any) => {
    if (booking.preferredTimeSlot) {
      try {
        const parts = booking.preferredTimeSlot.split(" ");
        const datePart = parts[0];
        const timePart = parts[1];

        if (datePart && timePart) {
          const date = new Date(datePart);
          const formattedDate = date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          const [hours, minutes] = timePart.split(":");
          const hour = parseInt(hours, 10);
          const period = hour >= 12 ? "PM" : "AM";
          const hour12 = hour % 12 || 12;
          const formattedTime = `${hour12}:${minutes} ${period}`;

          return `${formattedDate} at ${formattedTime}`;
        }
      } catch (error) {
        console.error("Error parsing preferredTimeSlot:", error);
      }
      return booking.preferredTimeSlot;
    }

    if (booking.createdAt) {
      return new Date(booking.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return "N/A";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#63D64F]"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-700">Vendor not found</h2>
        <button onClick={() => navigate('/admin/vendors')} className="mt-4 px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg font-medium shadow-sm">
          Go Back to Vendors
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/admin/vendors')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold text-sm transition-colors"
        >
          <ArrowLeft size={18} /> Back to Vendors
        </button>
        <span className="text-xs text-gray-500 font-medium">Vendor Details / {vendor.vendorId || vendor._id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Profile Card */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center h-fit">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-50 shadow-md bg-white mb-4 relative group">
            {vendor.profileImage ? (
              <img src={vendor.profileImage} alt={vendor.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-[#63D64F] to-[#3DB9A6] flex items-center justify-center text-white text-3xl font-bold">
                {vendor.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-1">{vendor.name}</h2>
          <p className="text-xs text-gray-500 font-medium mb-3">{vendor.businessName}</p>
          
          {vendor.vendorId && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e6f9e2] text-[#338024] border border-[#d2f4cc] mb-3">
              {vendor.vendorId}
            </span>
          )}

          <div className="flex flex-col gap-1.5 w-full items-center mb-6">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium w-full text-center ${vendor.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {vendor.isActive ? 'Active Account' : 'Inactive Account'}
            </span>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium w-full text-center ${vendor.isVerified ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
              {vendor.isVerified ? 'Verified Partner' : 'Verification Pending'}
            </span>
          </div>

          <div className="w-full border-t border-slate-100 pt-5 space-y-4 text-left">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar className="text-gray-400" size={16} />
              <div>
                <p className="text-xs text-gray-400">Partner Since</p>
                <p className="font-semibold text-gray-800 font-mono">
                  {new Date(vendor.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <User className="text-gray-400" size={16} />
              <div>
                <p className="text-xs text-gray-400">Gender</p>
                <p className="font-semibold text-gray-800">{vendor.gender || 'Male'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Briefcase className="text-gray-400" size={16} />
              <div>
                <p className="text-xs text-gray-400">Specialization</p>
                <p className="font-semibold text-gray-800">{vendor.specialization || 'General Services'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Details Grid */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Business & Owner Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
              <Building2 size={18} className="text-[#3DB9A6]" /> Business & Contact Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-400">Business/Clinic Name</p>
                <p className="font-semibold text-gray-800 mt-0.5">{vendor.businessName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Business Type</p>
                <p className="font-semibold text-gray-800 mt-0.5 capitalize">{vendor.businessType || 'Individual'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Registration Number</p>
                <p className="font-semibold text-gray-800 mt-0.5">{vendor.registrationNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">GST Number</p>
                <p className="font-semibold text-gray-800 mt-0.5">{vendor.gstNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Experience (Years)</p>
                <p className="font-semibold text-gray-800 mt-0.5">{vendor.experience ? `${vendor.experience} Years` : 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Primary Mobile</p>
                <p className="font-semibold text-gray-800 mt-0.5">{vendor.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Alternate Mobile</p>
                <p className="font-semibold text-gray-800 mt-0.5">{vendor.alternatePhone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Email Address</p>
                <p className="font-semibold text-gray-800 mt-0.5">{vendor.email}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-400">Full Address</p>
                <p className="font-semibold text-gray-800 mt-0.5">
                  {vendor.address ? `${vendor.address}, ${vendor.city}, ${vendor.state} - ${vendor.pincode}` : 'N/A'}
                </p>
              </div>
            </div>
            
            {vendor.bio && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-xs text-gray-400 mb-1">Partner Biography</p>
                <p className="text-sm text-gray-700 bg-slate-50 rounded-xl p-4 border leading-relaxed">{vendor.bio}</p>
              </div>
            )}
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
              <Landmark size={18} className="text-[#3DB9A6]" /> Bank Account details
            </h3>
            {vendor.bankDetails ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="text-xs text-gray-400">Bank Name</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{vendor.bankDetails.bankName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Account Holder Name</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{vendor.bankDetails.accountHolderName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Account Number</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{vendor.bankDetails.accountNumber || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">IFSC Code</p>
                  <p className="font-semibold text-gray-800 mt-0.5">{vendor.bankDetails.ifscCode || 'N/A'}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No bank details added by the vendor.</p>
            )}
          </div>

          {/* Uploaded Documents */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
              <FileText size={18} className="text-blue-500" /> Uploaded Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Identity Proof */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-between text-center min-h-[120px]">
                <FileText className="text-blue-500 mb-2" size={24} />
                <span className="text-xs font-bold text-gray-700">Identity Proof</span>
                {vendor.documents?.identityProof?.url ? (
                  <a href={vendor.documents.identityProof.url} target="_blank" rel="noopener noreferrer" className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 text-blue-600 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all">
                    <Download size={12} /> View File
                  </a>
                ) : (
                  <span className="mt-2.5 text-xs text-gray-400 italic">Not Uploaded</span>
                )}
              </div>

              {/* Qualification Certificate */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-between text-center min-h-[120px]">
                <FileText className="text-green-500 mb-2" size={24} />
                <span className="text-xs font-bold text-gray-700">Qualification Certificate</span>
                {vendor.documents?.qualificationCertificate?.url ? (
                  <a href={vendor.documents.qualificationCertificate.url} target="_blank" rel="noopener noreferrer" className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 text-blue-600 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all">
                    <Download size={12} /> View File
                  </a>
                ) : (
                  <span className="mt-2.5 text-xs text-gray-400 italic">Not Uploaded</span>
                )}
              </div>

              {/* Business License */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-between text-center min-h-[120px]">
                <FileText className="text-amber-500 mb-2" size={24} />
                <span className="text-xs font-bold text-gray-700">Business License</span>
                {vendor.documents?.businessLicense?.url ? (
                  <a href={vendor.documents.businessLicense.url} target="_blank" rel="noopener noreferrer" className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 text-blue-600 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all">
                    <Download size={12} /> View File
                  </a>
                ) : (
                  <span className="mt-2.5 text-xs text-gray-400 italic">Not Uploaded</span>
                )}
              </div>
            </div>
          </div>

          {/* Offered Services */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
              <Shield size={18} className="text-purple-600" /> Offered Services
            </h3>
            {vendor.services && vendor.services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {vendor.services.map((service: any, idx: number) => {
                  const name = service.serviceName || service.name || (typeof service === 'string' ? service : 'N/A');
                  const serviceId = service._id || (typeof service === 'string' ? service : '');
                  const date = getServiceAssignmentDate(serviceId);
                  
                  return (
                    <div
                      key={idx}
                      className="p-3 border rounded-xl bg-gray-50 flex items-center justify-between text-xs hover:border-[#d2f4cc] transition-all shadow-xs"
                    >
                      <div>
                        <p className="font-bold text-gray-800">{name}</p>
                        <p className="text-gray-500 text-[10px] mt-1 font-medium font-mono">Assigned on: {date}</p>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#e6f9e2] text-[#338024] border border-[#d2f4cc]">
                        Active
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No services offered yet.</p>
            )}
          </div>

          {/* Booking History */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
              <Clock size={18} className="text-[#3DB9A6]" /> Vendor Booking History
            </h3>
            
            {loadingBookings ? (
              <div className="text-center py-6">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#63D64F]"></div>
              </div>
            ) : bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Booking ID</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Patient Name</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.map((booking: any) => (
                      <tr key={booking._id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3.5 text-xs font-bold text-gray-800">
                          {booking.bookingId || booking._id.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-700 font-semibold">
                          {booking.patientName || booking.userId?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-700">
                          <div className="flex flex-col gap-1">
                            {booking.selectedServices && booking.selectedServices.length > 0 ? (
                              booking.selectedServices.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <span className="font-semibold text-gray-800">{item.serviceName}</span>
                                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium">x{item.quantity}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400 italic">No Services</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-600">
                          {formatBookingDateTime(booking)}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-800 font-semibold">
                          ₹{booking.subtotal || booking.grandTotal || booking.finalAmount || booking.amount || 0}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            booking.bookingStatus === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                            booking.bookingStatus === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                            booking.bookingStatus === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {booking.bookingStatus || 'Pending'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic text-center py-6">No previous bookings found for this vendor.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
