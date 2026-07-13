import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Clock, User, Mail, Phone, MapPin, 
  ShoppingBag, ShieldAlert, Receipt, 
  MessageSquare, FileText, Plus, AlertCircle, Play, 
  CheckCircle2, Tag, Loader2, Download
} from 'lucide-react';
import { bookingAPI, prescriptionAPI, reportAPI, invoiceAPI } from '../services/api';
import { useAppSelector } from '../store/hooks';
import { toast } from 'react-toastify';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

// Modals
import {
  RequestedItemsModal,
  CancelBookingModal,
  RescheduleBookingModal,
  StatusUpdateModal,
  AddPrescriptionModal,
  ReportUploadModal,
  PrescriptionSummaryModal
} from '../components/bookings';

const BookingDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state: any) => state.auth);
  
  const isAdminPath = location.pathname.startsWith('/admin');
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAddPrescriptionModal, setShowAddPrescriptionModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  
  // Runtime note state
  const [newRuntimeNote, setNewRuntimeNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    setPaymentLoading(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load Razorpay Payment Gateway. Please check your connection.");
        setPaymentLoading(false);
        return;
      }

      const orderRes = await bookingAPI.createRazorpayOrder(booking._id);
      if (!orderRes.data.success) {
        toast.error("Failed to initiate online payment order");
        setPaymentLoading(false);
        return;
      }

      const { orderId, amount, currency, key } = orderRes.data;

      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: "PRLT Healthcare",
        description: `Payment for booking ${booking.bookingId || booking._id}`,
        order_id: orderId,
        handler: async function (response: any) {
          setPaymentLoading(true);
          try {
            const verifyRes = await bookingAPI.verifyRazorpayPayment(booking._id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.success("Payment verified and recorded successfully!");
              setBooking(verifyRes.data.data);
            } else {
              toast.error("Payment verification failed!");
            }
          } catch (verifyErr: any) {
            toast.error(verifyErr.response?.data?.message || "Verification failed");
          } finally {
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: booking.patientName || "",
          email: booking.email || "",
          contact: booking.alternateMobile || booking.userId?.phone || "",
        },
        theme: {
          color: "#3DB9A6",
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to process payment");
      setPaymentLoading(false);
    }
  };

  const fetchBookingDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await bookingAPI.getBookingById(id);
      if (res.data && res.data.success) {
        setBooking(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to load booking details');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  // Handler for Prescription summary update
  const handleUpdateSummary = async (summary: string) => {
    if (!id) return;
    try {
      const res = await bookingAPI.updatePrescriptionSummary(id, summary);
      if (res.data && res.data.success) {
        toast.success("Prescription summary updated successfully!");
        setBooking(res.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update prescription summary");
    }
  };

  // Handler for uploading reports
  const handleUploadReport = async (file: File, reportType: string, reportName: string) => {
    if (!id) return;
    try {
      const uploadResponse = await prescriptionAPI.uploadImage(file);
      if (uploadResponse.data.success) {
        const updateResponse = await reportAPI.uploadReport(
          id,
          uploadResponse.data.data.url,
          reportType,
          reportName
        );
        if (updateResponse.data.success) {
          toast.success("Report uploaded successfully!");
          // Re-fetch booking details to show new reports
          const res = await bookingAPI.getBookingById(id);
          if (res.data && res.data.success) {
            setBooking(res.data.data);
          }
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload report");
    }
  };

  // Handler for adding prescription
  const handleAddPrescription = async (prescriptionData: any, prescriptionFile: File | null) => {
    if (!id) return;
    try {
      if (prescriptionFile) {
        const uploadResponse = await prescriptionAPI.uploadImage(prescriptionFile);
        if (uploadResponse.data.success) {
          const res = await bookingAPI.updatePrescription(
            id,
            { ...prescriptionData, supportingImageUrl: uploadResponse.data.data.url },
            "form"
          );
          if (res.data && res.data.success) {
            toast.success("Prescription added successfully!");
            setBooking(res.data.data);
          }
        }
      } else {
        const res = await bookingAPI.updatePrescription(id, prescriptionData, "form");
        if (res.data && res.data.success) {
          toast.success("Prescription added successfully!");
          setBooking(res.data.data);
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add prescription");
    }
  };

  const handleAddRuntimeNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuntimeNote.trim() || !id) return;
    
    setSubmittingNote(true);
    try {
      const res = await bookingAPI.addRuntimeNote(id, newRuntimeNote);
      if (res.data && res.data.success) {
        toast.success('Patient runtime note added successfully');
        setBooking(res.data.data);
        setNewRuntimeNote('');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to add runtime note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleUpdateItemsSubmit = async (items: any[]) => {
    if (!id) return;
    try {
      const res = await bookingAPI.updateRequestedItems(id, items);
      if (res.data && res.data.success) {
        toast.success('Requested items updated successfully');
        setBooking(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save requested items');
      throw err;
    }
  };

  // Vendor Action triggers
  const handleStartService = async () => {
    if (!id) return;
    try {
      const res = await bookingAPI.startService(id);
      if (res.data && res.data.success) {
        toast.success('Service started! Patient care is in progress.');
        setBooking(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to start service');
    }
  };

  const handleCompleteService = async () => {
    if (!id) return;
    try {
      const res = await bookingAPI.completeService(id);
      if (res.data && res.data.success) {
        toast.success('Service completed successfully!');
        setBooking(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to complete service');
    }
  };

  const [downloadingInvoice, setDownloadingInvoice] = useState(false);

  const handleDownloadInvoice = async () => {
    if (!id) return;
    setDownloadingInvoice(true);
    try {
      const response = await invoiceAPI.generateInvoice(id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${booking?.bookingId || id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to download invoice");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const [cashLoading, setCashLoading] = useState(false);

  const handleCashPayment = async () => {
    if (!id) return;
    setCashLoading(true);
    try {
      const res = await bookingAPI.adminCashPayment(id);
      if (res.data && res.data.success) {
        toast.success("Payment recorded successfully!");
        setBooking(res.data.data);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to record cash payment");
    } finally {
      setCashLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-slate-50 flex flex-col ${isAdminPath ? 'p-6' : ''}`}>
        {!isAdminPath && <Navigation />}
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-[#3DB9A6] rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-550">Loading booking details...</p>
        </div>
        {!isAdminPath && <Footer />}
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={`min-h-screen bg-slate-50 flex flex-col ${isAdminPath ? 'p-6' : ''}`}>
        {!isAdminPath && <Navigation />}
        <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-500">
          <AlertCircle size={48} className="text-red-500 mb-2" />
          <p className="text-lg font-bold">Booking Not Found</p>
          <Link to={isAdminPath ? '/admin/bookings' : '/'} className="text-blue-650 font-semibold hover:underline mt-2">
            {isAdminPath ? 'Back to Bookings' : 'Go Home'}
          </Link>
        </div>
        {!isAdminPath && <Footer />}
      </div>
    );
  }

  const isUser = user?.role === 'user';
  const isVendor = user?.role === 'vendor';
  const isAdmin = user?.role === 'admin';

  // Calculate pricing breakdown
  const servicesSubtotal = booking.selectedServices?.reduce((sum: number, s: any) => sum + (s.price * s.quantity), 0) || 0;
  const discountAmount = booking.appliedCoupon?.discountAmount || 0;
  const itemsTotal = booking.requestedItems?.reduce((sum: number, item: any) => {
    if (item.status === 'unavailable') return sum;
    return sum + (item.price || 0) * (item.quantity || 1);
  }, 0) || 0;
  
  const finalCalculatedPayable = Math.max(0, servicesSubtotal + itemsTotal - discountAmount);

  // Status style maps
  const statusColors: any = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    accepted: 'bg-blue-50 text-blue-700 border-blue-200',
    'in-progress': 'bg-violet-50 text-violet-700 border-violet-200',
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className={isAdminPath ? "bg-[#F8FAFC]" : "min-h-screen bg-[#F8FAFC]"}>
      {!isAdminPath && <Navigation />}

      {/* Main Container */}
      <div className={isAdminPath ? "w-full p-2 sm:p-4" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"}>
        
        {/* Back Button & Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 flex-wrap">
            <button 
              onClick={() => navigate(-1)} 
              className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl transition-all shadow-xs"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">Booking Details</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${statusColors[booking.bookingStatus] || 'bg-slate-100'}`}>
                  {booking.bookingStatus}
                </span>
              </div>
              <p className="text-xs text-slate-550 font-bold mt-0.5">
                ID: <span className="text-slate-700 font-extrabold uppercase">{booking.bookingId ? `#${booking.bookingId}` : 'NA'}</span> &bull; Created: {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Download invoice button */}
            <button 
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice || booking.paymentStatus !== 'paid'}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-900 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              title={booking.paymentStatus !== 'paid' ? "Invoice is only available for paid bookings" : ""}
            >
              {downloadingInvoice ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Downloading...
                </>
              ) : (
                <>
                  <Download size={16} /> Download Invoice
                </>
              )}
            </button>

            {/* Admin status update button */}
            {isAdmin && (
              <button 
                onClick={() => setShowStatusModal(true)}
                className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-bold transition-all shadow-xs"
              >
                Update Status
              </button>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* LEFT & CENTER COLUMN (Main Content) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Patient Details Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-800 mb-4.5 flex items-center gap-2 border-b pb-3 border-slate-100">
                <User size={18} className="text-[#3DB9A6]" /> Patient & Visit Details
              </h2>

              {(() => {
                const familyMember = booking.familyMemberId && booking.userId?.familyMembers?.find((m: any) => m._id === booking.familyMemberId);
                return (
                  <div className="mb-5 p-4 rounded-xl border border-slate-150 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-semibold">
                    <div>
                      <span className="text-slate-450 uppercase text-[9px] tracking-wider block font-extrabold mb-0.5">Booking Primary Account</span>
                      <p className="text-slate-800 font-extrabold">
                        {booking.userId?.name || 'NA'} {isAdminPath && booking.userId && (
                          <Link to={`/admin/users/${booking.userId._id || booking.userId}`} className="text-[#3DB9A6] hover:underline font-black ml-1.5">(View Profile)</Link>
                        )}
                      </p>
                      <span className="text-[10px] text-slate-500 font-bold block">{booking.userId?.email || ''}</span>
                    </div>
                    
                    <div className="sm:text-right">
                      <span className="text-slate-450 uppercase text-[9px] tracking-wider block font-extrabold mb-0.5">Booking For</span>
                      {familyMember ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-extrabold">
                          Family Member ({familyMember.relationship} - {familyMember.name})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#e6f9e2] text-[#338024] border border-[#d2f4cc] rounded-lg text-[10px] font-extrabold">
                          Account Owner (Self)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4.5 gap-x-6">
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Patient Name</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{booking.patientName}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Age & Gender</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{booking.age} yrs &bull; {booking.sex}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Mobile Number</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{booking.userId?.phone || 'N/A'}</p>
                </div>
                {booking.alternateMobile && (
                  <div>
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Alternate Mobile</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{booking.alternateMobile}</p>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Email Address</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{booking.email}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Full Address</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5 leading-normal">{booking.address} - {booking.pincode}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Preferred Time Slot</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                    <Calendar size={14} className="text-slate-450" /> {booking.preferredTimeSlot}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Staff Preference</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{booking.staffPreference || 'Any Available'}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Service Location</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                    <MapPin size={14} className="text-slate-450" /> {booking.serviceLocation || 'At Home'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">Estimated Duration</span>
                  <p className="text-sm font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                    <Clock size={14} className="text-slate-450" /> {booking.estimatedDuration || 45} Minutes
                  </p>
                </div>
              </div>

              {booking.additionalRequirements && (
                <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50/50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-extrabold text-slate-400 tracking-wider block mb-1">Additional Requirements</span>
                  <p className="text-xs font-semibold text-slate-750 leading-relaxed">{booking.additionalRequirements}</p>
                </div>
              )}
            </div>

            {/* Selected Services Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm overflow-hidden">
              <h2 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2 border-b pb-3 border-slate-100">
                <FileText size={18} className="text-[#3DB9A6]" /> Booked Services ({booking.selectedServices?.length || 0})
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] uppercase font-extrabold text-slate-400 tracking-wider">
                      <th className="py-2.5 pb-3">Service</th>
                      <th className="py-2.5 pb-3 text-center">Qty</th>
                      <th className="py-2.5 pb-3 text-right">Price</th>
                      <th className="py-2.5 pb-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {booking.selectedServices?.map((service: any) => (
                      <tr key={service._id} className="text-slate-700 hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-800 text-sm">{service.serviceName}</td>
                        <td className="py-3 text-center font-bold text-sm text-slate-650">{service.quantity}</td>
                        <td className="py-3 text-right font-semibold text-sm">₹{service.price}</td>
                        <td className="py-3 text-right font-extrabold text-sm text-slate-800">₹{service.price * service.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Requested Items Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b pb-3 border-slate-100 mb-4">
                <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <ShoppingBag size={18} className="text-[#3DB9A6]" /> Requested Items
                </h2>
                
                {/* Edit Button for Admin or Vendor, or for Owner if status is pending */}
                <button
                  onClick={() => setShowItemsModal(true)}
                  className="text-xs font-black text-violet-600 hover:text-violet-750 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                >
                  {isVendor || isAdmin ? 'Manage Items & Prices' : 'Request Items'}
                </button>
              </div>

              {booking.requestedItems && booking.requestedItems.length > 0 ? (
                <div className="space-y-3">
                  {booking.requestedItems.map((item: any) => (
                    <div key={item._id} className="flex items-center justify-between gap-4 p-3 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors">
                      <div className="space-y-0.5">
                        <span className="text-sm font-extrabold text-slate-800">{item.itemName}</span>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                          <span>Qty: {item.quantity}</span>
                          <span>&bull;</span>
                          <span className={`px-1.5 py-0.5 text-[10px] font-black uppercase rounded-md border ${
                            item.status === 'brought' ? 'bg-green-50 text-green-700 border-green-200' :
                            item.status === 'unavailable' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-[10px] text-slate-450 font-bold block">Fulfillment Cost</span>
                        <span className="text-sm font-black text-slate-800">
                          {item.price > 0 ? `₹${item.price} x ${item.quantity} = ₹${item.price * item.quantity}` : '₹0 (Awaiting Quote)'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-405 text-xs font-semibold bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                  No additional items requested for this booking.
                </div>
              )}
            </div>

            {/* Prescription Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b pb-3 border-slate-100 mb-4">
                <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <FileText size={18} className="text-[#3DB9A6]" /> Prescription Summary
                </h2>
                {isAdmin && (
                  <button
                    onClick={() => setShowSummaryModal(true)}
                    className="text-xs font-black text-violet-600 hover:text-violet-750 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Edit Summary
                  </button>
                )}
              </div>

              {booking.prescriptionSummary ? (
                <div className="bg-slate-50/40 p-4 rounded-xl border border-slate-200">
                  <p className="text-sm font-semibold text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {booking.prescriptionSummary}
                  </p>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                  No prescription summary available yet.
                </div>
              )}
            </div>

            {/* Prescriptions List */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b pb-3 border-slate-100 mb-4">
                <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <FileText size={18} className="text-[#3DB9A6]" /> Doctor Prescriptions ({booking.prescriptions?.length || 0})
                </h2>
                {isAdmin && (
                  <button
                    onClick={() => setShowAddPrescriptionModal(true)}
                    className="text-xs font-black text-violet-600 hover:text-violet-750 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Add Prescription
                  </button>
                )}
              </div>

              {booking.prescriptions && booking.prescriptions.length > 0 ? (
                <div className="space-y-6">
                  {booking.prescriptions.map((presc: any, index: number) => (
                    <div key={presc._id || index} className="p-4 bg-slate-50/30 rounded-xl border border-slate-200 space-y-4">
                      {/* Prescription Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                        <span className="text-xs font-black text-slate-550 uppercase">
                          Prescription #{index + 1} ({presc.type})
                        </span>
                        <span className="text-[10px] text-slate-450 font-bold">
                          Added By: {presc.addedBy} &bull; {new Date(presc.addedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>

                      {presc.type === 'form' ? (
                        <div className="space-y-4 text-xs">
                          {/* Doctor details */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-slate-150">
                            <div>
                              <span className="text-[9px] uppercase font-extrabold text-slate-400 block">Doctor Name</span>
                              <span className="font-bold text-slate-850">{presc.doctorName || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-extrabold text-slate-400 block">Registration No</span>
                              <span className="font-bold text-slate-850">{presc.doctorRegistration || 'N/A'}</span>
                            </div>
                            <div>
                              <span className="text-[9px] uppercase font-extrabold text-slate-400 block">Hospital</span>
                              <span className="font-bold text-slate-850">{presc.hospitalName || 'N/A'}</span>
                            </div>
                          </div>

                          {/* Complaints & Diagnosis */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {presc.patientComplaints && (
                              <div className="bg-white p-3 rounded-lg border border-slate-150">
                                <span className="text-[9px] uppercase font-extrabold text-slate-400 block mb-1">Patient Complaints</span>
                                <span className="font-medium text-slate-705 leading-relaxed">{presc.patientComplaints}</span>
                              </div>
                            )}
                            {presc.diagnosis && (
                              <div className="bg-white p-3 rounded-lg border border-slate-150">
                                <span className="text-[9px] uppercase font-extrabold text-slate-400 block mb-1">Diagnosis</span>
                                <span className="font-medium text-slate-705 leading-relaxed">{presc.diagnosis}</span>
                              </div>
                            )}
                          </div>

                          {/* Medications list */}
                          {presc.medications && presc.medications.length > 0 && (
                            <div className="bg-white rounded-lg border border-slate-150 overflow-hidden">
                              <div className="bg-slate-50 px-3 py-1.5 border-b border-slate-150">
                                <span className="text-[9px] uppercase font-extrabold text-slate-500 tracking-wider">Prescribed Medications</span>
                              </div>
                              <table className="w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-slate-150 text-[8px] uppercase font-extrabold text-slate-450 tracking-wider">
                                    <th className="px-3 py-1.5">Medicine</th>
                                    <th className="px-3 py-1.5">Dosage</th>
                                    <th className="px-3 py-1.5">Frequency</th>
                                    <th className="px-3 py-1.5">Duration</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-700">
                                  {presc.medications.map((med: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-slate-50/50">
                                      <td className="px-3 py-2 font-bold text-slate-800">{med.name}</td>
                                      <td className="px-3 py-2 font-medium">{med.dosage}</td>
                                      <td className="px-3 py-2 font-medium">{med.frequency}</td>
                                      <td className="px-3 py-2 font-medium">{med.duration}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {/* Instructions & Lab Tests */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {presc.labTests && (
                              <div className="bg-white p-3 rounded-lg border border-slate-150">
                                <span className="text-[9px] uppercase font-extrabold text-slate-400 block mb-1">Recommended Lab Tests</span>
                                <span className="font-semibold text-slate-705">{presc.labTests}</span>
                              </div>
                            )}
                            {presc.specialInstructions && (
                              <div className="bg-white p-3 rounded-lg border border-slate-150">
                                <span className="text-[9px] uppercase font-extrabold text-slate-400 block mb-1">Special Instructions</span>
                                <span className="font-semibold text-slate-705">{presc.specialInstructions}</span>
                              </div>
                            )}
                          </div>

                          {/* Image preview if supporting image exists */}
                          {presc.supportingImageUrl && (
                            <div className="space-y-1.5">
                              <span className="text-[9px] uppercase font-extrabold text-slate-450 block">Supporting Prescription Document</span>
                              <a href={presc.supportingImageUrl} target="_blank" rel="noopener noreferrer" className="inline-block relative rounded-lg border border-slate-200 overflow-hidden hover:opacity-95 transition-opacity max-w-xs">
                                <img src={presc.supportingImageUrl} alt="Prescription" className="max-h-48 object-contain" />
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Image prescription
                        <div className="space-y-2 text-xs">
                          {presc.imageUrl ? (
                            <div className="space-y-1.5">
                              <span className="text-[9px] uppercase font-extrabold text-slate-405 block">Prescription Image File</span>
                              <a href={presc.imageUrl} target="_blank" rel="noopener noreferrer" className="inline-block relative rounded-lg border border-slate-200 overflow-hidden hover:opacity-95 transition-opacity max-w-xs bg-slate-100">
                                <img src={presc.imageUrl} alt="Uploaded Prescription" className="max-h-60 object-contain" />
                              </a>
                            </div>
                          ) : (
                            <p className="text-slate-400 italic">No image file found.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                  No prescription records added yet.
                </div>
              )}
            </div>

            {/* Patient Reports */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b pb-3 border-slate-100 mb-4">
                <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <FileText size={18} className="text-[#3DB9A6]" /> Lab Reports ({booking.reports?.length || 0})
                </h2>
                {isAdmin && (
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="text-xs font-black text-violet-600 hover:text-violet-750 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Upload Report
                  </button>
                )}
              </div>

              {booking.reports && booking.reports.length > 0 ? (
                <div className="space-y-3">
                  {booking.reports.map((report: any, index: number) => (
                    <div key={report._id || index} className="flex items-center justify-between gap-4 p-3 bg-slate-50/50 hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors">
                      <div className="space-y-0.5">
                        <span className="text-sm font-extrabold text-slate-800">{report.reportName || 'Medical Report'}</span>
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-550">
                          <span className="capitalize">Type: {report.reportType}</span>
                          <span>&bull;</span>
                          <span>Added By: {report.addedBy}</span>
                          <span>&bull;</span>
                          <span>{new Date(report.addedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>
                      
                      <a 
                        href={report.reportUrl}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-[#3DB9A6] hover:text-[#2fa694] bg-[#3DB9A6]/10 hover:bg-[#3DB9A6]/20 border border-[#3DB9A6]/30 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View / Download
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                  No lab reports uploaded for this booking.
                </div>
              )}
            </div>

            {/* Patient Runtime visit notes Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2 border-b pb-3 border-slate-100">
                <MessageSquare size={18} className="text-[#3DB9A6]" /> Patient Visit & Runtime Notes
              </h2>

              {/* Existing notes */}
              <div className="space-y-4 mb-5">
                {booking.runtimeNotes && booking.runtimeNotes.length > 0 ? (
                  booking.runtimeNotes.map((note: any, idx: number) => (
                    <div key={note._id || idx} className="flex gap-3 text-left">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs uppercase flex-shrink-0">
                        {note.addedBy?.charAt(0) || 'P'}
                      </div>
                      <div className="flex-1 space-y-1 bg-slate-50/40 p-3 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between gap-4">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${note.addedBy === 'Admin' ? 'bg-amber-50 text-amber-705 border border-amber-200' : 'bg-violet-50 text-violet-700 border border-violet-200'}`}>
                            {note.addedBy}
                          </span>
                          <span className="text-[10px] text-slate-450 font-bold">
                            {new Date(note.addedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-slate-705 leading-relaxed">{note.text}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs font-semibold bg-slate-50/50 border border-dashed border-slate-200 rounded-xl">
                    No visit notes recorded yet.
                  </div>
                )}
              </div>

              {/* Add note form (Vendor/Admin Only) */}
              {(isVendor || isAdmin) && (
                <form onSubmit={handleAddRuntimeNote} className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Record Patient Update / Runtime Visit Note</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Add real-time notes about patient vitals, complaints, medicines given, or observations during the home visit..."
                      value={newRuntimeNote}
                      onChange={(e) => setNewRuntimeNote(e.target.value)}
                      className="w-full text-xs p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[#3DB9A6]/30 focus:border-[#3DB9A6] resize-none bg-slate-50/20"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingNote || !newRuntimeNote.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-bold rounded-lg text-xs hover:shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {submittingNote ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Plus size={14} />
                      )}
                      Record Visit Note
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
          
          {/* RIGHT COLUMN (Invoicing, Status, Vendor detail) */}
          <div className="space-y-8">
            
            {/* Billing Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 bg-[#3DB9A6]/5 rounded-bl-full flex items-center justify-center pointer-events-none">
                <Receipt className="text-[#3DB9A6]/20 transform translate-x-2 -translate-y-2" size={32} />
              </div>

              <h2 className="text-base font-extrabold text-slate-800 mb-4 border-b pb-3 border-slate-100">
                Payment Summary
              </h2>

              <div className="space-y-3.5 text-sm">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">Booking Amount</span>
                  <span className="font-bold text-slate-800">₹{servicesSubtotal}</span>
                </div>
                
                <div className="flex justify-between items-center text-slate-650">
                  <span className="font-semibold flex items-center gap-1">
                    Additional Items
                  </span>
                  <span className="font-bold text-slate-800">₹{itemsTotal}</span>
                </div>
                
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">GST (0% display)</span>
                  <span className="font-semibold text-slate-400">₹0</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-600 font-bold bg-emerald-50/70 py-1.5 px-3 rounded-lg border border-emerald-150">
                    <span className="flex items-center gap-1"><Tag size={13} /> Discount ({booking.appliedCoupon?.couponCode})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="border-t border-slate-200 pt-3 flex justify-between items-center bg-slate-50/50 -mx-6 px-6 py-3 mt-4">
                  <div>
                    <span className="text-xs text-slate-500 font-extrabold uppercase block">Net Amount</span>
                    <span className="text-[10px] text-slate-450 font-bold animate-pulse">Based on Deliveries</span>
                  </div>
                  <span className="text-xl font-black text-slate-900">₹{finalCalculatedPayable}</span>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-550 font-bold">Payment Status:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                        booking.paymentStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : booking.paymentStatus === 'failed'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {booking.paymentStatus || 'pending'}
                    </span>
                  </div>
                  {booking.paymentStatus === 'paid' && booking.paymentMethod && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-550 font-bold">Method:</span>
                      <span className="text-slate-800 font-bold uppercase">{booking.paymentMethod}</span>
                    </div>
                  )}

                  {booking.paymentStatus !== 'paid' && (
                    <div className="flex flex-col gap-2 mt-2">
                      <button
                        onClick={handlePayNow}
                        disabled={paymentLoading || cashLoading}
                        className="w-full py-3 bg-gradient-to-r from-[#3DB9A6] to-[#63D64F] hover:shadow-lg hover:shadow-[#3DB9A6]/10 text-white rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                      >
                        {paymentLoading ? (
                          <>
                            <Loader2 className="animate-spin" size={14} />
                            Processing...
                          </>
                        ) : (
                          'Pay Online Now (Razorpay)'
                        )}
                      </button>

                      {isAdmin && (
                        <button
                          onClick={handleCashPayment}
                          disabled={paymentLoading || cashLoading}
                          className="w-full py-3 border-2 border-dashed border-[#3DB9A6] hover:bg-[#3DB9A6]/5 text-[#3DB9A6] rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
                        >
                          {cashLoading ? (
                            <>
                              <Loader2 className="animate-spin" size={14} />
                              Recording...
                            </>
                          ) : (
                            'Confirm Cash Payment (Admin)'
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions (Vendor actions) */}
            {isVendor && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
                <h3 className="text-xs uppercase font-extrabold text-slate-450 tracking-wider">Service Provider Controls</h3>
                
                {booking.bookingStatus === 'accepted' && (
                  <button
                    onClick={handleStartService}
                    className="w-full py-3 bg-blue-650 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Play size={14} className="fill-white" /> Start Home Visit / Service
                  </button>
                )}

                {booking.bookingStatus === 'in-progress' && (
                  <button
                    onClick={handleCompleteService}
                    className="w-full py-3 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={14} /> Mark Service Completed
                  </button>
                )}

                {['completed', 'cancelled'].includes(booking.bookingStatus) && (
                  <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-500">
                    No actions available for this booking status.
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions (User/Admin controls) */}
            {(isUser || isAdmin) && !['completed', 'cancelled'].includes(booking.bookingStatus) && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-3">
                <h3 className="text-xs uppercase font-extrabold text-slate-450 tracking-wider">Booking Actions</h3>
                
                <button
                  onClick={() => setShowRescheduleModal(true)}
                  className="w-full py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Reschedule Appointment
                </button>

                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-2.5 border border-rose-200 bg-rose-50/50 hover:bg-rose-550 text-rose-700 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel Booking
                </button>
              </div>
            )}

            {/* Service Provider Profile Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xs uppercase font-extrabold text-slate-450 tracking-wider mb-3">
                Service Provider Detail
              </h2>

              {booking.vendorId ? (
                <div className="space-y-4">
                  {isAdmin ? (
                    <Link
                      to={`/admin/vendors/${booking.vendorId._id || booking.vendorId}`}
                      className="flex items-center gap-3 hover:opacity-90 group cursor-pointer text-left block"
                    >
                      <div className="w-12 h-12 rounded-full bg-[#3DB9A6]/10 text-[#3DB9A6] flex items-center justify-center font-bold text-base flex-shrink-0 group-hover:bg-[#3DB9A6]/20 transition-all">
                        {booking.vendorId.businessName?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 group-hover:text-blue-600 group-hover:underline transition-all">{booking.vendorId.businessName || booking.vendorId.name}</h4>
                        {booking.vendorId.businessName && booking.vendorId.name && (
                          <p className="text-xs text-slate-550 font-semibold mt-0.5">{booking.vendorId.name}</p>
                        )}
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#3DB9A6]/10 text-[#3DB9A6] flex items-center justify-center font-bold text-base flex-shrink-0">
                        {booking.vendorId.businessName?.charAt(0).toUpperCase() || 'P'}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800">{booking.vendorId.businessName || booking.vendorId.name}</h4>
                        {booking.vendorId.businessName && booking.vendorId.name && (
                          <p className="text-xs text-slate-550 font-semibold mt-0.5">{booking.vendorId.name}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3">
                    <p className="flex items-center gap-2 text-slate-600 font-semibold">
                      <Phone size={13} className="text-slate-400" /> {booking.vendorId.phone}
                    </p>
                    <p className="flex items-center gap-2 text-slate-655 font-semibold">
                      <Mail size={13} className="text-slate-400" /> {booking.vendorId.email}
                    </p>
                    {booking.vendorId.city && (
                      <p className="flex items-center gap-2 text-slate-655 font-semibold">
                        <MapPin size={13} className="text-slate-400" /> {booking.vendorId.city}, {booking.vendorId.state}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 text-center">
                  <ShieldAlert className="text-amber-500 mx-auto mb-1.5 animate-pulse" size={24} />
                  <h4 className="text-xs font-extrabold text-slate-800">Pending Assignment</h4>
                  <p className="text-[10px] text-slate-500 font-semibold mt-1">
                    We are currently matching your booking with the closest qualified vendor partners in your area.
                  </p>
                </div>
              )}
            </div>

            {/* Client/User detail Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-xs uppercase font-extrabold text-slate-450 tracking-wider mb-3">
                Client Profile
              </h2>
              {isAdmin && booking.userId ? (
                <Link
                  to={`/admin/users/${booking.userId._id || booking.userId}`}
                  className="flex items-center gap-3 mb-3 hover:opacity-90 group cursor-pointer text-left block"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm uppercase group-hover:bg-slate-200 transition-all">
                    {booking.userId?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 group-hover:underline transition-all">{booking.userId?.name || 'Registered Client'}</h4>
                    <p className="text-[10px] text-slate-505 font-medium">{booking.userId?.email}</p>
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm uppercase">
                    {booking.userId?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{booking.userId?.name || 'Registered Client'}</h4>
                    <p className="text-[10px] text-slate-500 font-medium">{booking.userId?.email}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals Mounting */}
      {showItemsModal && (
        <RequestedItemsModal
          show={showItemsModal}
          onClose={() => setShowItemsModal(false)}
          onSubmit={handleUpdateItemsSubmit}
          booking={booking}
        />
      )}

      {showCancelModal && (
        <CancelBookingModal
          show={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onSubmit={async (reason: string) => {
            try {
              const res = await bookingAPI.cancelBooking(booking._id, reason);
              if (res.data && res.data.success) {
                toast.success('Booking cancelled successfully');
                setBooking(res.data.data);
              }
            } catch (err: any) {
              toast.error(err.response?.data?.message || 'Failed to cancel booking');
            }
            setShowCancelModal(false);
          }}
          booking={booking}
        />
      )}

      {showRescheduleModal && (
        <RescheduleBookingModal
          show={showRescheduleModal}
          onClose={() => setShowRescheduleModal(false)}
          onSubmit={async (date: string, time: string, reason: string) => {
            try {
              const res = await bookingAPI.rescheduleBooking(booking._id, date, time, reason);
              if (res.data && res.data.success) {
                toast.success('Booking rescheduled successfully');
                setBooking(res.data.data);
              }
            } catch (err: any) {
              toast.error(err.response?.data?.message || 'Failed to reschedule booking');
            }
            setShowRescheduleModal(false);
          }}
          booking={booking}
        />
      )}

      {showStatusModal && (
        <StatusUpdateModal
          show={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          onSubmit={async (status: string) => {
            try {
              const res = await bookingAPI.updateBookingStatus(booking._id, status);
              if (res.data && res.data.success) {
                toast.success('Booking status updated successfully');
                setBooking(res.data.data);
              }
            } catch (err: any) {
              toast.error(err.response?.data?.message || 'Failed to update status');
            }
            setShowStatusModal(false);
          }}
          booking={booking}
        />
      )}

      {showAddPrescriptionModal && (
        <AddPrescriptionModal
          show={showAddPrescriptionModal}
          onClose={() => setShowAddPrescriptionModal(false)}
          onSubmit={handleAddPrescription}
          booking={booking}
        />
      )}

      {showReportModal && (
        <ReportUploadModal
          show={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleUploadReport}
          booking={booking}
        />
      )}

      {showSummaryModal && (
        <PrescriptionSummaryModal
          show={showSummaryModal}
          onClose={() => setShowSummaryModal(false)}
          onSubmit={handleUpdateSummary}
          booking={booking}
        />
      )}

      {!isAdminPath && <Footer />}
    </div>
  );
};

export default BookingDetailPage;
