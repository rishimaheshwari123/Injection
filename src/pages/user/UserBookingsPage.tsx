import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  bookingAPI,
  serviceAPI,
  vendorAPI,
  prescriptionAPI,
  reportAPI,
  userAPI,
} from "../../services/api";
import { useAppSelector } from "../../store/hooks";
import {
  CreateBookingModal,
  ServiceDetailModal,
  AddPrescriptionModal,
  ReportUploadModal,
  ViewPrescriptionModal,
  ViewReportsModal,
  CancelBookingModal,
} from "../../components/bookings";
import { toast } from "react-toastify";
import {
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  Eye,
  ChevronRight,
  Phone,
  User,
  ClipboardList,
  Plus,
  Edit2,
  FileText,
  Upload,
  Image,
  ShieldCheck,
  ShieldAlert,
  XCircle,
  MoreVertical,
} from "lucide-react";

interface Booking {
  _id: string;
  bookingId: string;
  vendorId?: {
    _id: string;
    name: string;
    phone: string;
    businessName: string;
  };
  services?: Array<{
    serviceId?: {
      serviceName: string;
    };
    serviceName: string;
    price: number;
    quantity?: number;
  }>;
  selectedServices?: Array<{
    serviceId?: any;
    serviceName: string;
    price: number;
    quantity?: number;
  }>;
  bookingStatus: "pending" | "accepted" | "scheduled" | "in-progress" | "completed" | "cancelled";
  isUserAgreed?: boolean;
  userConsent?: {
    agreed?: boolean;
    agreedAt?: string;
    notes?: string;
  };
  preferredTimeSlot?: string;
  paymentStatus: string;
  grandTotal: number;
  createdAt: string;
  patientName?: string;
  age?: number;
  sex?: string;
  address?: string;
  pincode?: string;
  currentLocation?: string;
  alternateMobile?: string;
  email?: string;
  additionalRequirements?: string;
  hasInsurance?: boolean;
  insurancePolicyNumber?: string;
  freeComplimentaryService?: string;
  staffPreference?: string;
  serviceLocation?: string;
  familyMemberId?: string;
  prescriptions?: any[];
  reports?: any[];
  reportUrl?: string;
  prescriptionDocument?: string;
}

export default function UserBookingsPage() {
  const { user } = useAppSelector((state: any) => state.auth);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Modal and Autocomplete states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedServiceForDetail, setSelectedServiceForDetail] = useState<any>(null);
  const [showServiceDetailModal, setShowServiceDetailModal] = useState(false);

  // Prescription & Report modals state
  const [showAddPrescriptionModal, setShowAddPrescriptionModal] = useState(false);
  const [selectedBookingForPrescription, setSelectedBookingForPrescription] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedBookingForReport, setSelectedBookingForReport] = useState<any>(null);
  const [showViewPrescriptionModal, setShowViewPrescriptionModal] = useState(false);
  const [selectedBookingForViewPrescription, setSelectedBookingForViewPrescription] = useState<any>(null);
  const [showViewReportsModal, setShowViewReportsModal] = useState(false);
  const [selectedBookingForViewReports, setSelectedBookingForViewReports] = useState<any>(null);

  useEffect(() => {
    fetchBookings();
    loadModalData();
  }, []);

  const loadModalData = async () => {
    try {
      const [servicesRes, vendorsRes, meRes] = await Promise.allSettled([
        serviceAPI.getPublicServices(),
        vendorAPI.getAllVendors(),
        userAPI.getMe()
      ]);

      if (servicesRes.status === "fulfilled" && servicesRes.value.data.success) {
        setServices(servicesRes.value.data.data || []);
      }
      if (vendorsRes.status === "fulfilled" && vendorsRes.value.data.success) {
        setVendors(vendorsRes.value.data.data || []);
      }
      if (meRes.status === "fulfilled" && meRes.value.data.success) {
        setUserProfile(meRes.value.data.data || null);
      }
    } catch (error) {
      console.error("Failed to load autocomplete data for bookings", error);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getUserBookings();
      if (response.data.success) {
        setBookings(response.data.data || []);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch bookings list"
      );
    } finally {
      setLoading(false);
    }
  };

  const [consentingBookingId, setConsentingBookingId] = useState<string | null>(null);

  const handleConfirmConsent = async (bookingId: string) => {
    setConsentingBookingId(bookingId);
    try {
      const res = await bookingAPI.submitUserConsent(bookingId);
      if (res.data && res.data.success) {
        toast.success("Thank you! You have agreed and confirmed the service start.");
        fetchBookings();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to confirm agreement");
    } finally {
      setConsentingBookingId(null);
    }
  };

  // User Cancel Booking State & Handler
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState<any>(null);

  const handleCancelBookingSubmit = async (reason: string) => {
    if (!selectedBookingForCancel) return;
    try {
      const res = await bookingAPI.cancelBooking(selectedBookingForCancel._id, reason);
      if (res.data && res.data.success) {
        toast.success("Booking cancelled successfully!");
        setShowCancelModal(false);
        setSelectedBookingForCancel(null);
        fetchBookings();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const handleSaveBooking = async (data: any) => {
    const {
      formData,
      selectedUser,
      selectedFamilyMemberId,
      prescriptionData,
      prescriptionFile,
      dateTimeSlots,
    } = data;

    const subtotal = formData.selectedServices.reduce(
      (sum: number, s: any) => sum + s.price * s.quantity,
      0,
    );
    const grandTotal = subtotal;

    // Handle EDIT mode
    if (bookingToEdit) {
      try {
        const validSlot = dateTimeSlots.find((s: any) => s.date && s.time);
        const preferredTimeSlot = validSlot ? `${validSlot.date} ${validSlot.time}` : formData.preferredTimeSlot;

        const updatePayload = {
          ...formData,
          preferredTimeSlot,
          userId: selectedUser || userProfile?._id || user?._id,
          familyMemberId: selectedFamilyMemberId || null,
          subtotal,
          grandTotal,
        };

        const response = await bookingAPI.updateBookingByUser(bookingToEdit._id, updatePayload);
        if (response.data.success) {
          toast.success("Booking updated successfully!");
          setShowCreateModal(false);
          setBookingToEdit(null);
          fetchBookings();
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to update booking");
      }
      return;
    }

    // Handle CREATE mode
    const vendorId = formData.vendorId || (
      formData.selectedServices.length > 0
        ? formData.selectedServices[0].vendorId
        : null
    );

    try {
      const createdBookings = [];

      for (let i = 0; i < dateTimeSlots.length; i++) {
        const slot = dateTimeSlots[i];
        const preferredTimeSlot = `${slot.date} ${slot.time}`;

        const bookingData = {
          ...formData,
          preferredTimeSlot,
          vendorId,
          userId: selectedUser || userProfile?._id || user?._id,
          familyMemberId: selectedFamilyMemberId || null,
          subtotal,
          gstAmount: 0,
          grandTotal,
        };

        const response = await bookingAPI.createUserBooking(bookingData);
        if (response.data.success) {
          const createdBooking = response.data.data;
          createdBookings.push(createdBooking);

          // Add prescription only to the first booking if provided
          if (i === 0) {
            const hasFormData =
              prescriptionData.doctorName ||
              prescriptionData.diagnosis ||
              prescriptionData.medications.some((m: any) => m.name);

            if (hasFormData) {
              try {
                if (prescriptionFile) {
                  try {
                    const uploadResponse =
                      await prescriptionAPI.uploadImage(prescriptionFile);
                    if (uploadResponse.data.success) {
                      await bookingAPI.updatePrescription(
                        createdBooking._id,
                        {
                          ...prescriptionData,
                          supportingImageUrl: uploadResponse.data.data.url,
                        },
                        "form",
                      );
                    } else {
                      await bookingAPI.updatePrescription(
                        createdBooking._id,
                        prescriptionData,
                        "form",
                      );
                    }
                  } catch (error: any) {
                    await bookingAPI.updatePrescription(
                      createdBooking._id,
                      prescriptionData,
                      "form",
                    );
                  }
                } else {
                  await bookingAPI.updatePrescription(
                    createdBooking._id,
                    prescriptionData,
                    "form",
                  );
                }
              } catch (error: any) {
                console.error("Prescription save failed for first booking");
              }
            }
          }
        }
      }

      if (createdBookings.length > 0) {
        toast.success(
          `${createdBookings.length} booking(s) created successfully!`
        );
        setShowCreateModal(false);
        setBookingToEdit(null);
        fetchBookings();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create bookings");
    }
  };

  // Handler for AddPrescriptionModal
  const handleAddPrescription = async (
    prescriptionData: any,
    prescriptionFile: File | null,
  ) => {
    if (!selectedBookingForPrescription) return;

    try {
      if (prescriptionFile) {
        try {
          const uploadResponse = await prescriptionAPI.uploadImage(prescriptionFile);
          if (uploadResponse.data.success) {
            await bookingAPI.updatePrescription(
              selectedBookingForPrescription._id,
              {
                ...prescriptionData,
                supportingImageUrl: uploadResponse.data.data.url,
              },
              "form",
            );
            toast.success("Prescription added successfully!");
          } else {
            await bookingAPI.updatePrescription(
              selectedBookingForPrescription._id,
              prescriptionData,
              "form",
            );
            toast.warning("Prescription details added without image");
          }
        } catch (error: any) {
          await bookingAPI.updatePrescription(
            selectedBookingForPrescription._id,
            prescriptionData,
            "form",
          );
          toast.warning("Prescription details added without image");
        }
      } else {
        await bookingAPI.updatePrescription(
          selectedBookingForPrescription._id,
          prescriptionData,
          "form",
        );
        toast.success("Prescription added successfully!");
      }

      fetchBookings();
      setShowAddPrescriptionModal(false);
      setSelectedBookingForPrescription(null);
    } catch (error: any) {
      toast.error(
        "Failed to add prescription: " +
        (error.response?.data?.message || error.message),
      );
    }
  };

  // Handler for ReportUploadModal
  const handleUploadReport = async (
    file: File,
    reportType: string,
    reportName: string,
  ) => {
    if (!selectedBookingForReport) return;

    try {
      const uploadResponse = await prescriptionAPI.uploadImage(file);
      if (uploadResponse.data.success) {
        const updateResponse = await reportAPI.uploadReport(
          selectedBookingForReport._id,
          uploadResponse.data.data.url,
          reportType,
          reportName,
        );

        if (updateResponse.data.success) {
          toast.success("Report uploaded successfully!");
          fetchBookings();
          setShowReportModal(false);
          setSelectedBookingForReport(null);
        }
      }
    } catch (error: any) {
      toast.error(
        "Failed to upload report: " +
        (error.response?.data?.message || error.message),
      );
    }
  };

  const formatBookingDateTime = (booking: any) => {
    if (booking.preferredTimeSlot) {
      try {
        const [datePart, timePart] = booking.preferredTimeSlot.split(" ");
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
          return {
            date: formattedDate,
            time: formattedTime,
          };
        }
      } catch (error) {
        console.error("Error parsing preferredTimeSlot:", error);
      }
    }
    const createdDate = new Date(booking.createdAt);
    return {
      date: createdDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: createdDate.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  // Helper to get status color badge
  const getStatusBadgeClass = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      accepted: "bg-blue-50 text-blue-700 border-blue-200",
      "in-progress": "bg-emerald-50 text-emerald-700 border-emerald-200",
      completed: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return styles[status] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  // Statistics calculation
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.bookingStatus === "pending").length,
    scheduled: bookings.filter((b) => b.bookingStatus === "accepted").length,
    inProgress: bookings.filter((b) => b.bookingStatus === "in-progress").length,
    completed: bookings.filter((b) => b.bookingStatus === "completed").length,
  };

  const filteredBookings = bookings.filter((booking) => {
    const statusMatches =
      statusFilter === "All" ||
      (statusFilter === "Pending Approval" && booking.bookingStatus === "pending") ||
      (statusFilter === "Scheduled" && booking.bookingStatus === "accepted") ||
      (statusFilter === "In Progress" && booking.bookingStatus === "in-progress") ||
      (statusFilter === "Completed" && booking.bookingStatus === "completed") ||
      (statusFilter === "Cancelled" && booking.bookingStatus === "cancelled");

    if (!statusMatches) return false;

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const vendorName = booking.vendorId?.name?.toLowerCase() || "";
    const vendorBusiness = booking.vendorId?.businessName?.toLowerCase() || "";
    const serviceNames = booking.services
      ?.map((s) => s.serviceName || s.serviceId?.serviceName || "")
      .join(" ")
      .toLowerCase() || "";
    const bookingId = booking.bookingId?.toLowerCase() || "";

    return (
      vendorName.includes(term) ||
      vendorBusiness.includes(term) ||
      serviceNames.includes(term) ||
      bookingId.includes(term)
    );
  });

  return (
    <div className="max-w-full space-y-6">
      {/* Page Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] bg-clip-text text-transparent">
            My Bookings
          </h1>
          <p className="text-slate-500 mt-1">Track and manage your healthcare service requests</p>
        </div>
        <button
          onClick={() => {
            setBookingToEdit(null);
            setShowCreateModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-xl hover:shadow-lg font-bold transition-all text-sm"
        >
          <Plus size={18} />
          Book Service
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Bookings */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="p-2.5 bg-slate-50 rounded-xl text-slate-600">
            <ClipboardList size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
              Total
            </span>
            <span className="text-xl font-black text-slate-800">{stats.total}</span>
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
              Pending Approval
            </span>
            <span className="text-xl font-black text-slate-800">{stats.pending}</span>
          </div>
        </div>

        {/* Scheduled */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl text-blue-600">
            <Calendar size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
              Scheduled
            </span>
            <span className="text-xl font-black text-slate-800">{stats.scheduled}</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
              Ongoing
            </span>
            <span className="text-xl font-black text-slate-800">{stats.inProgress}</span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
          <div className="p-2.5 bg-green-50 rounded-xl text-green-600">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
              Completed
            </span>
            <span className="text-xl font-black text-slate-800">{stats.completed}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by ID, partner name, service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#63D64F] focus:ring-2 focus:ring-[#63D64F]/10 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex rounded-xl border p-1 bg-slate-50 overflow-x-auto self-start lg:self-auto">
          {["All", "Pending Approval", "Scheduled", "In Progress", "Completed", "Cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-800"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Bookings List / Table */}
      {loading ? (
        <div className="bg-white py-20 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#63D64F]"></div>
          <p className="mt-4 text-slate-500 font-semibold text-sm">Loading bookings...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          {filteredBookings.length === 0 ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
              <Calendar size={48} className="text-slate-200 mb-4" />
              <p className="font-bold text-slate-500 text-base">No bookings found</p>
              <p className="text-xs text-slate-400 mt-1">Bookings matching the selected filters will show up here</p>
            </div>
          ) : (
            <div className="overflow-x-auto min-h-[460px] pb-40">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Booking Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Assigned Partner
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Scheduled Slot
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredBookings.map((booking) => (
                    <tr key={booking._id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Booking ID and Services */}
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono font-bold text-slate-500 mb-1">
                          #{booking.bookingId || booking._id.slice(-8).toUpperCase()}
                        </div>
                        <div className="flex flex-wrap gap-1 max-w-[250px]">
                          {(booking.selectedServices || booking.services || []).map((s: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold"
                            >
                              {s.serviceName || s.serviceId?.serviceName || "Healthcare Service"}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Assigned Vendor Details */}
                      <td className="px-6 py-4">
                        {booking.vendorId ? (
                          <div>
                            <div className="text-sm font-bold text-slate-800">
                              {booking.vendorId.businessName || booking.vendorId.name}
                            </div>
                            <div className="flex flex-col gap-0.5 text-slate-400 text-xs mt-1">
                              <span className="flex items-center gap-0.5">
                                <User size={11} /> {booking.vendorId.name}
                              </span>
                              <span className="flex items-center gap-0.5">
                                <Phone size={11} /> {booking.vendorId.phone || "N/A"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-slate-450 italic">
                            Waiting for assignment
                          </span>
                        )}
                      </td>

                      {/* Scheduled Time */}
                      <td className="px-6 py-4 text-left">
                        <div className="text-sm font-semibold text-slate-700">
                          📅 {formatBookingDateTime(booking).date}
                        </div>
                        <div className="text-xs text-blue-600 font-bold mt-0.5">
                          🕐 {formatBookingDateTime(booking).time}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full border uppercase ${getStatusBadgeClass(
                              booking.bookingStatus
                            )}`}
                          >
                            {booking.bookingStatus === "accepted" ? "Scheduled" : booking.bookingStatus}
                          </span>

                          {booking.bookingStatus === "in-progress" && (
                            <div>
                              {booking.isUserAgreed || booking.userConsent?.agreed ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  <ShieldCheck size={11} /> Agreed ✅
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 animate-pulse">
                                  <ShieldAlert size={11} /> Action Needed
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Payment */}
                      <td className="px-6 py-4">
                        <div className="text-sm font-black text-slate-800">
                          ₹{booking.grandTotal}
                        </div>
                        <div
                          className={`text-[10px] font-bold mt-0.5 ${
                            booking.paymentStatus === "paid"
                              ? "text-green-600"
                              : "text-amber-500"
                          }`}
                        >
                          {booking.paymentStatus?.toUpperCase() || "PENDING"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Urgent Action: In-Progress User Consent Button */}
                          {booking.bookingStatus === "in-progress" &&
                            !booking.isUserAgreed &&
                            !booking.userConsent?.agreed && (
                              <button
                                onClick={() => handleConfirmConsent(booking._id)}
                                disabled={consentingBookingId === booking._id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white hover:shadow-md transition-all text-xs font-black rounded-xl animate-pulse disabled:opacity-50 cursor-pointer"
                                title="Provider has started. Click to confirm your agreement"
                              >
                                <ShieldCheck size={13} />
                                <span>
                                  {consentingBookingId === booking._id
                                    ? "Confirming..."
                                    : "✓ Confirm Agreement"}
                                </span>
                              </button>
                            )}

                          {/* Primary Action: View Details */}
                          <Link
                            to={`/user/bookings/${booking._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-50 text-teal-800 hover:bg-teal-100 transition-all text-xs font-bold rounded-xl border border-teal-200/60 shadow-2xs"
                          >
                            <Eye size={13} />
                            <span>Details</span>
                            <ChevronRight size={12} />
                          </Link>

                          {/* Actions Dropdown Toggle */}
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() =>
                                setOpenDropdownId(
                                  openDropdownId === booking._id ? null : booking._id
                                )
                              }
                              className={`p-1.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                                openDropdownId === booking._id
                                  ? "bg-slate-100 text-slate-800 border-slate-300 shadow-inner"
                                  : "bg-white text-slate-600 hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-2xs"
                              }`}
                              title="More Options"
                            >
                              <MoreVertical size={16} />
                            </button>

                            {/* Dropdown Menu */}
                            {openDropdownId === booking._id && (
                              <>
                                <div
                                  className="fixed inset-0 z-[90] cursor-default"
                                  onClick={() => setOpenDropdownId(null)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-[100] divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100 text-left origin-top-right">
                                  {/* Prescriptions & Reports Section */}
                                  <div className="p-1 space-y-0.5">
                                    <button
                                      onClick={() => {
                                        setSelectedBookingForPrescription(booking);
                                        setShowAddPrescriptionModal(true);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-violet-50 hover:text-violet-700 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <div className="p-1 rounded-md bg-violet-100/60 text-violet-600">
                                        <Plus size={13} />
                                      </div>
                                      <span>Add Prescription</span>
                                    </button>

                                    {booking.prescriptions &&
                                      booking.prescriptions.length > 0 && (
                                        <button
                                          onClick={() => {
                                            setSelectedBookingForViewPrescription(
                                              booking
                                            );
                                            setShowViewPrescriptionModal(true);
                                            setOpenDropdownId(null);
                                          }}
                                          className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                          <div className="p-1 rounded-md bg-blue-100/60 text-blue-600">
                                            <Image size={13} />
                                          </div>
                                          <span>
                                            Prescriptions (
                                            {booking.prescriptions.length})
                                          </span>
                                        </button>
                                      )}

                                    <button
                                      onClick={() => {
                                        setSelectedBookingForReport(booking);
                                        setShowReportModal(true);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                                    >
                                      <div className="p-1 rounded-md bg-cyan-100/60 text-cyan-600">
                                        <Upload size={13} />
                                      </div>
                                      <span>Upload Lab Report</span>
                                    </button>

                                    {((booking.reports &&
                                      booking.reports.length > 0) ||
                                      booking.reportUrl) && (
                                      <button
                                        onClick={() => {
                                          setSelectedBookingForViewReports(
                                            booking
                                          );
                                          setShowViewReportsModal(true);
                                          setOpenDropdownId(null);
                                        }}
                                        className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                                      >
                                        <div className="p-1 rounded-md bg-emerald-100/60 text-emerald-600">
                                          <FileText size={13} />
                                        </div>
                                        <span>
                                          Lab Reports (
                                          {booking.reports?.length || 1})
                                        </span>
                                      </button>
                                    )}
                                  </div>

                                  {/* Edit / Cancel Section */}
                                  {booking.bookingStatus !== "completed" &&
                                    booking.bookingStatus !== "cancelled" && (
                                      <div className="p-1 space-y-0.5">
                                        {booking.bookingStatus === "pending" &&
                                          !booking.vendorId && (
                                            <button
                                              onClick={() => {
                                                setBookingToEdit(booking);
                                                setShowCreateModal(true);
                                                setOpenDropdownId(null);
                                              }}
                                              className="w-full px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                                            >
                                              <div className="p-1 rounded-md bg-amber-100/60 text-amber-600">
                                                <Edit2 size={13} />
                                              </div>
                                              <span>Edit Booking</span>
                                            </button>
                                          )}

                                        <button
                                          onClick={() => {
                                            setSelectedBookingForCancel(
                                              booking
                                            );
                                            setShowCancelModal(true);
                                            setOpenDropdownId(null);
                                          }}
                                          className="w-full px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                                        >
                                          <div className="p-1 rounded-md bg-rose-100/60 text-rose-600">
                                            <XCircle size={13} />
                                          </div>
                                          <span>Cancel Booking</span>
                                        </button>
                                      </div>
                                    )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <CreateBookingModal
          show={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setBookingToEdit(null);
          }}
          onSubmit={handleSaveBooking}
          services={services}
          users={userProfile ? [userProfile] : (user ? [user] : [])}
          vendors={vendors}
          bookingToEdit={bookingToEdit}
          onServiceDetailClick={(service) => {
            setSelectedServiceForDetail(service);
            setShowServiceDetailModal(true);
          }}
        />
      )}

      {showServiceDetailModal && selectedServiceForDetail && (
        <ServiceDetailModal
          show={showServiceDetailModal}
          onClose={() => {
            setShowServiceDetailModal(false);
            setSelectedServiceForDetail(null);
          }}
          service={selectedServiceForDetail}
        />
      )}

      {showAddPrescriptionModal && (
        <AddPrescriptionModal
          show={showAddPrescriptionModal}
          onClose={() => {
            setShowAddPrescriptionModal(false);
            setSelectedBookingForPrescription(null);
          }}
          onSubmit={handleAddPrescription}
          booking={selectedBookingForPrescription}
        />
      )}

      {showReportModal && (
        <ReportUploadModal
          show={showReportModal}
          onClose={() => {
            setShowReportModal(false);
            setSelectedBookingForReport(null);
          }}
          onSubmit={handleUploadReport}
          booking={selectedBookingForReport}
        />
      )}

      {showViewPrescriptionModal && selectedBookingForViewPrescription && (
        <ViewPrescriptionModal
          show={showViewPrescriptionModal}
          onClose={() => {
            setShowViewPrescriptionModal(false);
            setSelectedBookingForViewPrescription(null);
          }}
          booking={selectedBookingForViewPrescription}
          isAdmin={false}
        />
      )}

      {showViewReportsModal && selectedBookingForViewReports && (
        <ViewReportsModal
          show={showViewReportsModal}
          onClose={() => {
            setShowViewReportsModal(false);
            setSelectedBookingForViewReports(null);
          }}
          booking={selectedBookingForViewReports}
        />
      )}

      {showCancelModal && selectedBookingForCancel && (
        <CancelBookingModal
          show={showCancelModal}
          onClose={() => {
            setShowCancelModal(false);
            setSelectedBookingForCancel(null);
          }}
          onSubmit={handleCancelBookingSubmit}
          booking={selectedBookingForCancel}
        />
      )}
    </div>
  );
}
