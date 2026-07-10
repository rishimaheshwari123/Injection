import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Heart, Shield, PhoneCall, AlertTriangle, FileText, Download, Clock, Star } from 'lucide-react';
import { userAPI, bookingAPI } from '../../services/api';
import { toast } from 'react-toastify';

export default function UserDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  
  // Reviews & Rating states
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const fetchUserReviews = async () => {
    try {
      setLoadingReviews(true);
      const response = await userAPI.getReviews(id!);
      if (response.data && response.data.success) {
        setReviews(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading user reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserDetails();
      fetchUserBookings();
      fetchUserReviews();
    }
  }, [id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUserById(id!);
      if (response.data && response.data.success) {
        setUser(response.data.data);
      } else {
        toast.error('Failed to load user details');
      }
    } catch (error: any) {
      console.error('Error loading user details:', error);
      toast.error(error.response?.data?.message || 'Error loading user details');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBookings = async () => {
    try {
      setLoadingBookings(true);
      const response = await bookingAPI.getUserBookings({ userId: id });
      if (response.data && response.data.success) {
        setBookings(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading user bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  const formatMedicalSince = (since: string) => {
    if (!since) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(since)) {
      try {
        return new Date(since).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } catch (e) {
        return since;
      }
    }
    return since;
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

  // Compute rating counts dynamically
  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach((r: any) => {
    const star = Math.min(Math.max(Math.round(r.rating || 5), 1), 5);
    ratingCounts[star - 1]++;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate('/admin/users')}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold text-sm transition-colors"
        >
          <ArrowLeft size={18} /> Back to Users
        </button>
        <span className="text-xs text-gray-500 font-medium">Patient Details / {user.patientId || user._id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Profile Card & Ratings */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-50 shadow-md bg-white mb-4 relative group">
              {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#63D64F] to-[#3DB9A6] flex items-center justify-center text-white text-3xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-1">{user.name}</h2>
            
            {user.patientId && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e6f9e2] text-[#338024] border border-[#d2f4cc] mb-3">
                {user.patientId}
              </span>
            )}

            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-6 ${user.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {user.isActive ? 'Active Patient' : 'Inactive Patient'}
            </span>

            <div className="w-full border-t border-slate-100 pt-5 space-y-4 text-left">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="text-gray-400" size={16} />
                <div>
                  <p className="text-xs text-gray-400">Member Since</p>
                  <p className="font-semibold text-gray-800">{new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <User className="text-gray-400" size={16} />
                <div>
                  <p className="text-xs text-gray-400">Gender & Age</p>
                  <p className="font-semibold text-gray-800">{user.gender}, {user.age} Years</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Shield className="text-gray-400" size={16} />
                <div>
                  <p className="text-xs text-gray-400">Account Role</p>
                  <p className="font-semibold text-gray-800 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ratings & Feedback Summary Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
              <Star className="text-amber-500 fill-amber-500" size={16} /> Patient Behavior Rating
            </h3>
            
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-slate-800">{user.rating ? user.rating.toFixed(1) : "0.0"}</div>
                <div className="flex items-center justify-center gap-0.5 mt-1 text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star 
                      key={s} 
                      size={11} 
                      className={s <= Math.round(user.rating || 0) ? "fill-amber-500 text-amber-500" : "text-slate-200"} 
                    />
                  ))}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-bold whitespace-nowrap">
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </div>
              </div>
              
              <div className="flex-1 space-y-1 border-l border-slate-100 pl-4">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = ratingCounts[stars - 1] || 0;
                  const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={stars} className="flex items-center gap-2 text-[10px]">
                      <span className="w-2.5 text-slate-500 font-bold text-right">{stars}</span>
                      <Star size={8} className="fill-amber-400 text-amber-400 flex-shrink-0" />
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="w-4 text-slate-400 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Right Details Grid */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Card 1: Basic Information */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
              <User size={18} className="text-[#3DB9A6]" /> Basic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-gray-400">Full Name</p>
                <p className="font-semibold text-gray-800 mt-0.5">{user.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Email Address</p>
                <p className="font-semibold text-gray-800 mt-0.5">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Mobile Phone</p>
                <p className="font-semibold text-gray-800 mt-0.5">{user.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Alternate Mobile</p>
                <p className="font-semibold text-gray-800 mt-0.5">{user.alternateMobile || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Blood Group</p>
                <p className="font-semibold text-gray-800 mt-0.5">{user.bloodGroup || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Preferred Language</p>
                <p className="font-semibold text-gray-800 mt-0.5">{user.preferredLanguage || 'English'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-400">Home Address</p>
                <p className="font-semibold text-gray-800 mt-0.5">{user.address}, {user.pincode}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Current Location</p>
                <p className="font-semibold text-gray-800 mt-0.5">{user.currentLocation || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Medical Logs */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
              <Heart size={18} className="text-red-500" /> Medical History & Logs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Allergies */}
              <div className="bg-red-50/30 rounded-xl p-4 border border-red-100">
                <p className="text-sm font-bold text-red-800 mb-2.5 flex items-center gap-1.5">
                  <AlertTriangle size={15} /> Allergies
                </p>
                {user.allergies && user.allergies.length > 0 ? (
                  <ul className="space-y-2">
                    {user.allergies.map((allergy: any, idx: number) => {
                      const name = typeof allergy === 'string' ? allergy : allergy?.name;
                      const since = typeof allergy === 'string' ? '' : allergy?.since;
                      const formattedSince = formatMedicalSince(since);
                      return (
                        <li key={idx} className="text-xs font-semibold text-gray-700 bg-white px-2.5 py-1.5 rounded-lg border border-red-50 flex flex-col gap-0.5">
                          <span>{name}</span>
                          {formattedSince && <span className="text-[10px] text-gray-400 font-normal">Since: {formattedSince}</span>}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 italic">No allergies logged</p>
                )}
              </div>

              {/* Chronic Diseases */}
              <div className="bg-amber-50/30 rounded-xl p-4 border border-amber-100">
                <p className="text-sm font-bold text-amber-800 mb-2.5 flex items-center gap-1.5">
                  <Heart size={15} /> Chronic Diseases
                </p>
                {user.chronicDiseases && user.chronicDiseases.length > 0 ? (
                  <ul className="space-y-2">
                    {user.chronicDiseases.map((disease: any, idx: number) => {
                      const name = typeof disease === 'string' ? disease : disease?.name;
                      const since = typeof disease === 'string' ? '' : disease?.since;
                      const formattedSince = formatMedicalSince(since);
                      return (
                        <li key={idx} className="text-xs font-semibold text-gray-700 bg-white px-2.5 py-1.5 rounded-lg border border-amber-50 flex flex-col gap-0.5">
                          <span>{name}</span>
                          {formattedSince && <span className="text-[10px] text-gray-400 font-normal">Since: {formattedSince}</span>}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 italic">No chronic diseases logged</p>
                )}
              </div>

              {/* Medications */}
              <div className="bg-blue-50/30 rounded-xl p-4 border border-blue-100">
                <p className="text-sm font-bold text-blue-800 mb-2.5 flex items-center gap-1.5">
                  <Shield size={15} /> Current Medications
                </p>
                {user.currentMedications && user.currentMedications.length > 0 ? (
                  <ul className="space-y-2">
                    {user.currentMedications.map((medication: any, idx: number) => {
                      const name = typeof medication === 'string' ? medication : medication?.name;
                      const since = typeof medication === 'string' ? '' : medication?.since;
                      const formattedSince = formatMedicalSince(since);
                      return (
                        <li key={idx} className="text-xs font-semibold text-gray-700 bg-white px-2.5 py-1.5 rounded-lg border border-blue-50 flex flex-col gap-0.5">
                          <span>{name}</span>
                          {formattedSince && <span className="text-[10px] text-gray-400 font-normal">Since: {formattedSince}</span>}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-500 italic">No current medications logged</p>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Documents & Uploads */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
              <FileText size={18} className="text-blue-500" /> Patient Files & Documents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Medical Report */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-between text-center min-h-[120px]">
                <FileText className="text-blue-500 mb-2" size={24} />
                <span className="text-xs font-bold text-gray-700">Medical Report</span>
                {user.medicalReport ? (
                  <a href={user.medicalReport} target="_blank" rel="noopener noreferrer" className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 text-blue-600 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all">
                    <Download size={12} /> View Report
                  </a>
                ) : (
                  <span className="mt-2.5 text-xs text-gray-400 italic">Not Uploaded</span>
                )}
              </div>

              {/* Blood Report */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-between text-center min-h-[120px]">
                <FileText className="text-red-500 mb-2" size={24} />
                <span className="text-xs font-bold text-gray-700">Blood Report</span>
                {user.bloodReport ? (
                  <a href={user.bloodReport} target="_blank" rel="noopener noreferrer" className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 text-blue-600 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all">
                    <Download size={12} /> View Report
                  </a>
                ) : (
                  <span className="mt-2.5 text-xs text-gray-400 italic">Not Uploaded</span>
                )}
              </div>

              {/* History Document */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-between text-center min-h-[120px]">
                <FileText className="text-amber-500 mb-2" size={24} />
                <span className="text-xs font-bold text-gray-700">History Document</span>
                {user.historyDocument ? (
                  <a href={user.historyDocument} target="_blank" rel="noopener noreferrer" className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 text-blue-600 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all">
                    <Download size={12} /> View Document
                  </a>
                ) : (
                  <span className="mt-2.5 text-xs text-gray-400 italic">Not Uploaded</span>
                )}
              </div>

              {/* Other Document */}
              <div className="border border-slate-100 rounded-xl p-4 bg-slate-50 flex flex-col items-center justify-between text-center min-h-[120px]">
                <FileText className="text-purple-500 mb-2" size={24} />
                <span className="text-xs font-bold text-gray-700">Other Document</span>
                {user.otherDocument ? (
                  <a href={user.otherDocument} target="_blank" rel="noopener noreferrer" className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 text-blue-600 rounded-lg text-xs font-bold shadow-sm hover:shadow-md transition-all">
                    <Download size={12} /> View Document
                  </a>
                ) : (
                  <span className="mt-2.5 text-xs text-gray-400 italic">Not Uploaded</span>
                )}
              </div>
            </div>
          </div>

          {/* Card 4: Insurance & Emergency Contacts */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Insurance Info */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
                  <Shield size={18} className="text-[#338024]" /> Insurance Information
                </h3>
                {user.hasInsurance ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Insurance Type</p>
                      <p className="font-semibold text-gray-700">{user.insuranceType || 'Primary'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Provider Name</p>
                      <p className="font-semibold text-gray-700">{user.insuranceProvider || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Policy Number</p>
                      <p className="font-semibold text-gray-700">{user.insurancePolicyNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Expiry Date</p>
                      <p className="font-semibold text-gray-700">
                        {user.insuranceExpiryDate ? new Date(user.insuranceExpiryDate).toLocaleDateString('en-IN') : 'N/A'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Patient does not have insurance details declared.</p>
                )}
              </div>

              {/* Emergency Contact */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
                  <PhoneCall size={18} className="text-orange-500" /> Emergency Contact
                </h3>
                {user.emergencyContactName ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Contact Name</p>
                      <p className="font-semibold text-gray-700">{user.emergencyContactName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Relationship</p>
                      <p className="font-semibold text-gray-700">{user.emergencyContactRelation || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400">Contact Number</p>
                      <p className="font-semibold text-[#3DB9A6] mt-0.5">{user.emergencyContactPhone || 'N/A'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No emergency contact defined.</p>
                )}
              </div>
            </div>

            {user.additionalNotes && (
              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-xs text-gray-400 mb-1">Additional Patient Notes</p>
                <p className="text-sm text-gray-700 bg-slate-50 rounded-xl p-4 border">{user.additionalNotes}</p>
              </div>
            )}
          </div>

          {/* Card 5: Booking History */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b flex items-center gap-2">
              <Clock size={18} className="text-[#3DB9A6]" /> Patient Booking History
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
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Service</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Date & Time</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Vendor / Provider</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bookings.map((booking: any) => (
                      <tr key={booking._id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3.5 text-xs font-bold text-blue-600">
                          {booking.bookingId || 'N/A'}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-700 font-semibold">
                          {booking.serviceName || booking.serviceId?.name || 'Medical Service'}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-600">
                          {formatBookingDateTime(booking)}
                        </td>
                        <td className="px-4 py-3.5 text-xs text-gray-600">
                          {booking.vendorId?.businessName || booking.vendorId?.name || 'N/A'}
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
              <p className="text-sm text-gray-500 italic text-center py-6">No previous bookings found for this patient.</p>
            )}
          </div>

          {/* Vendor Reviews for Patient Feed */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-5 border-b pb-3 border-slate-100 flex items-center gap-2">
              <Star size={18} className="text-amber-500 fill-amber-500" /> Vendor Reviews & Feedback
            </h3>
            {loadingReviews ? (
              <div className="py-8 flex justify-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3DB9A6]"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                No reviews submitted yet for this patient.
              </div>
            ) : (
              <div className="space-y-6 divide-y divide-slate-100">
                {reviews.map((review, idx) => (
                  <div key={review._id} className={`${idx > 0 ? "pt-6" : ""} flex gap-4`}>
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-sm uppercase flex-shrink-0">
                      {review.vendorId?.name?.charAt(0) || "V"}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-gray-800">{review.vendorId?.name || "Vendor Partner"}</h4>
                          <p className="text-[10px] text-gray-400 font-semibold">{new Date(review.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                        </div>
                        <div className="flex gap-0.5 text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={12} className={s <= review.rating ? "fill-amber-500 text-amber-500" : "text-slate-200"} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-650 leading-relaxed font-medium bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">{review.reviewText}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
