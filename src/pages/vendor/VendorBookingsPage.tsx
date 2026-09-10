import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bookingAPI } from "../../services/api";
import { toast } from "react-toastify";
import {
  Search,
  Calendar,
  Clock,
  CheckCircle2,
  Eye,
  ChevronRight,
  Phone,
  MapPin,
  ClipboardList,
  Play,
  XCircle,
  AlertTriangle,
  X,
  Loader2,
  ShieldCheck,
  ShieldAlert,
  Settings2
} from "lucide-react";

interface Booking {
  _id: string;
  bookingId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
  services: Array<{
    serviceId: {
      serviceName: string;
    };
    serviceName: string;
    price: number;
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
}

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Status Change Modal State
  const [selectedBookingForStatus, setSelectedBookingForStatus] = useState<Booking | null>(null);
  const [targetStatus, setTargetStatus] = useState<string>("");
  const [cancelReason, setCancelReason] = useState<string>("");
  const [updatingStatus, setUpdatingStatus] = useState<boolean>(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getVendorBookings();
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

  const handleAcceptBooking = async (id: string) => {
    try {
      const res = await bookingAPI.acceptBooking(id);
      if (res.data && res.data.success) {
        toast.success("Booking accepted successfully!");
        fetchBookings();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to accept booking");
    }
  };

  const openStatusModal = (booking: Booking, initialTarget?: string) => {
    setSelectedBookingForStatus(booking);
    setTargetStatus(initialTarget || (booking.bookingStatus === 'pending' ? 'scheduled' : booking.bookingStatus));
    setCancelReason("");
  };

  const handleUpdateStatusSubmit = async () => {
    if (!selectedBookingForStatus || !targetStatus) return;

    // If trying to complete without customer agreement
    if (
      (targetStatus === "completed" || targetStatus === "complete") &&
      !selectedBookingForStatus.isUserAgreed &&
      !selectedBookingForStatus.userConsent?.agreed
    ) {
      toast.error(
        "Cannot complete service: Customer has not confirmed agreement yet. Please ask the customer to agree in their app."
      );
      return;
    }

    setUpdatingStatus(true);
    try {
      const res = await bookingAPI.updateVendorBookingStatus(
        selectedBookingForStatus._id,
        targetStatus,
        cancelReason
      );

      if (res.data && res.data.success) {
        if (targetStatus === 'start' || targetStatus === 'in-progress') {
          toast.success("Service started! Customer has been notified to confirm agreement.");
        } else if (targetStatus === 'completed' || targetStatus === 'complete') {
          toast.success("Service completed successfully!");
        } else if (targetStatus === 'cancelled' || targetStatus === 'cancel') {
          toast.info("Booking has been cancelled.");
        } else {
          toast.success("Booking status updated successfully!");
        }

        setSelectedBookingForStatus(null);
        fetchBookings();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update booking status"
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Quick action: Start service
  const handleDirectStart = async (booking: Booking) => {
    try {
      const res = await bookingAPI.startService(booking._id);
      if (res.data && res.data.success) {
        toast.success("Service started! Customer has been notified to confirm agreement.");
        fetchBookings();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to start service");
    }
  };

  // Quick action: Complete service
  const handleDirectComplete = async (booking: Booking) => {
    if (!booking.isUserAgreed && !booking.userConsent?.agreed) {
      toast.warning(
        "Customer agreement is required before completing. Please ask customer to approve in their app."
      );
      return;
    }

    try {
      const res = await bookingAPI.completeService(booking._id);
      if (res.data && res.data.success) {
        toast.success("Service completed successfully!");
        fetchBookings();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to complete service");
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
      scheduled: "bg-blue-50 text-blue-700 border-blue-200",
      "in-progress": "bg-indigo-50 text-indigo-700 border-indigo-200",
      completed: "bg-emerald-50 text-emerald-800 border-emerald-300",
      cancelled: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return styles[status] || "bg-slate-100 text-slate-700 border-slate-200";
  };

  // Statistics calculation
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.bookingStatus === "pending").length,
    scheduled: bookings.filter((b) => b.bookingStatus === "accepted" || b.bookingStatus === "scheduled").length,
    inProgress: bookings.filter((b) => b.bookingStatus === "in-progress").length,
    completed: bookings.filter((b) => b.bookingStatus === "completed").length,
  };

  const filteredBookings = bookings.filter((booking) => {
    const statusMatches =
      statusFilter === "All" ||
      (statusFilter === "Pending" && booking.bookingStatus === "pending") ||
      (statusFilter === "Scheduled" && (booking.bookingStatus === "accepted" || booking.bookingStatus === "scheduled")) ||
      (statusFilter === "In Progress" && booking.bookingStatus === "in-progress") ||
      (statusFilter === "Completed" && booking.bookingStatus === "completed") ||
      (statusFilter === "Cancelled" && booking.bookingStatus === "cancelled");

    if (!statusMatches) return false;

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const customerName = booking.userId?.name?.toLowerCase() || "";
    const customerPhone = booking.userId?.phone || "";
    const serviceNames = booking.services
      ?.map((s) => s.serviceName || s.serviceId?.serviceName || "")
      .join(" ")
      .toLowerCase() || "";
    const bookingId = booking.bookingId?.toLowerCase() || "";

    return (
      customerName.includes(term) ||
      customerPhone.includes(term) ||
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
            Booking Management
          </h1>
          <p className="text-slate-500 mt-1">Manage and track your service status (Scheduled, Start, Complete, Cancel)</p>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Total Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
            <ClipboardList size={26} />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">
              Total Assignments
            </span>
            <span className="text-2xl font-black text-slate-800">{stats.total}</span>
          </div>
        </div>

        {/* Pending Assignments */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Clock size={26} />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">
              Pending
            </span>
            <span className="text-2xl font-black text-slate-800">{stats.pending}</span>
          </div>
        </div>

        {/* Scheduled / Accepted */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Calendar size={26} />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">
              Scheduled
            </span>
            <span className="text-2xl font-black text-slate-800">{stats.scheduled}</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <Clock size={26} />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">
              In Progress
            </span>
            <span className="text-2xl font-black text-slate-800">{stats.inProgress}</span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <CheckCircle2 size={26} />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">
              Completed
            </span>
            <span className="text-2xl font-black text-slate-800">{stats.completed}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by customer name, phone, service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#63D64F] focus:ring-2 focus:ring-[#63D64F]/10 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filters */}
        <div className="flex rounded-xl border p-1 bg-slate-50 overflow-x-auto self-start md:self-auto">
          {["All", "Pending", "Scheduled", "In Progress", "Completed", "Cancelled"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
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
          <p className="mt-4 text-slate-500 font-semibold text-sm">Loading assignments...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {filteredBookings.length === 0 ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
              <Calendar size={48} className="text-slate-200 mb-4" />
              <p className="font-bold text-slate-500 text-base">No bookings found</p>
              <p className="text-xs text-slate-400 mt-1">Assignments matching the selected filters will show up here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Booking Info
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Scheduled Slot
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Status & Consent
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Actions / Change Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredBookings.map((booking) => {
                    const isAgreed = booking.isUserAgreed || booking.userConsent?.agreed;
                    return (
                      <tr key={booking._id} className="hover:bg-slate-50/30 transition-colors">
                        {/* Booking ID and Services */}
                        <td className="px-6 py-4">
                          <div className="text-xs font-mono font-bold text-slate-500 mb-1">
                            #{booking.bookingId || booking._id.slice(-8).toUpperCase()}
                          </div>
                          <div className="flex flex-wrap gap-1 max-w-[230px]">
                            {booking.services?.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold"
                              >
                                {s.serviceName || s.serviceId?.serviceName || "Healthcare Service"}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Customer Details */}
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-800">
                            {booking.userId?.name || "Patient"}
                          </div>
                          <div className="flex items-center gap-3 text-slate-400 text-xs mt-1">
                            <span className="flex items-center gap-0.5">
                              <Phone size={11} /> {booking.userId?.phone || "N/A"}
                            </span>
                            {booking.userId?.address && (
                              <span className="flex items-center gap-0.5 truncate max-w-[140px]" title={booking.userId.address}>
                                <MapPin size={11} /> {booking.userId.address}
                              </span>
                            )}
                          </div>
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

                        {/* Status & Customer Consent Badge */}
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <span
                              className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full border uppercase ${getStatusBadgeClass(
                                booking.bookingStatus
                              )}`}
                            >
                              {booking.bookingStatus === "accepted" ? "Scheduled" : booking.bookingStatus}
                            </span>

                            {/* Show User Consent details when In Progress */}
                            {booking.bookingStatus === "in-progress" && (
                              <div>
                                {isAgreed ? (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                    <ShieldCheck size={11} /> Customer Agreed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 animate-pulse">
                                    <ShieldAlert size={11} /> Awaiting Agreement
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
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Pending State -> Accept */}
                            {booking.bookingStatus === "pending" && (
                              <button
                                onClick={() => handleAcceptBooking(booking._id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white hover:shadow-md transition-all text-xs font-bold rounded-xl"
                              >
                                Accept
                              </button>
                            )}

                            {/* Scheduled/Accepted State -> Start Service Quick Action */}
                            {(booking.bookingStatus === "accepted" || booking.bookingStatus === "scheduled") && (
                              <button
                                onClick={() => handleDirectStart(booking)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                                title="Start service and notify customer to agree"
                              >
                                <Play size={11} className="fill-white" /> Start Service
                              </button>
                            )}

                            {/* In Progress State -> Complete Service Quick Action */}
                            {booking.bookingStatus === "in-progress" && (
                              <button
                                onClick={() => handleDirectComplete(booking)}
                                className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl shadow-xs transition-all ${
                                  isAgreed
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed hover:bg-slate-200"
                                }`}
                                title={isAgreed ? "Mark service completed" : "Customer must confirm agreement before completion"}
                              >
                                <CheckCircle2 size={12} /> Complete
                              </button>
                            )}

                            {/* Change Status Dropdown / Modal Trigger */}
                            <button
                              onClick={() => openStatusModal(booking)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all"
                              title="Change booking status (Scheduled, Start, Complete, Cancel)"
                            >
                              <Settings2 size={12} />
                              <span>Status</span>
                            </button>

                            {/* Details Link */}
                            <Link
                              to={`/vendor/bookings/${booking._id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-[#63D64F]/10 to-[#3DB9A6]/10 text-teal-800 hover:from-[#63D64F]/20 hover:to-[#3DB9A6]/20 transition-all text-xs font-bold rounded-xl border border-teal-200/50"
                            >
                              <Eye size={12} />
                              <span>Details</span>
                              <ChevronRight size={11} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Status Change Modal */}
      {selectedBookingForStatus && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-in fade-in duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Settings2 size={18} className="text-[#63D64F]" />
                <h3 className="font-extrabold text-base">Change Booking Status</h3>
              </div>
              <button
                onClick={() => setSelectedBookingForStatus(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5">
              {/* Booking Quick Context */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-500">Booking ID:</span>
                  <span className="text-slate-800 font-mono">#{selectedBookingForStatus.bookingId || selectedBookingForStatus._id.slice(-8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-500">Patient:</span>
                  <span className="text-slate-800">{selectedBookingForStatus.userId?.name || "Customer"}</span>
                </div>
                <div className="flex justify-between items-center font-bold">
                  <span className="text-slate-500">Current Status:</span>
                  <span className="uppercase text-blue-600 font-extrabold">{selectedBookingForStatus.bookingStatus}</span>
                </div>
              </div>

              {/* Status Selection Cards */}
              <div className="space-y-2.5">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  Select New Status:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Scheduled */}
                  <button
                    type="button"
                    onClick={() => setTargetStatus("scheduled")}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      targetStatus === "scheduled" || targetStatus === "accepted"
                        ? "border-blue-500 bg-blue-50/70 text-blue-900 ring-2 ring-blue-400/20"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <Calendar size={14} className="text-blue-600" /> Scheduled
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">
                      Confirm or reschedule appointment
                    </p>
                  </button>

                  {/* Start / In Progress */}
                  <button
                    type="button"
                    onClick={() => setTargetStatus("in-progress")}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      targetStatus === "in-progress" || targetStatus === "start"
                        ? "border-indigo-500 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-400/20"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <Play size={14} className="text-indigo-600 fill-indigo-600" /> Start Service
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">
                      Send agreement notification to user
                    </p>
                  </button>

                  {/* Complete */}
                  <button
                    type="button"
                    onClick={() => setTargetStatus("completed")}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      targetStatus === "completed" || targetStatus === "complete"
                        ? "border-emerald-500 bg-emerald-50/70 text-emerald-900 ring-2 ring-emerald-400/20"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <CheckCircle2 size={14} className="text-emerald-600" /> Complete Service
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">
                      Requires user agreement
                    </p>
                  </button>

                  {/* Cancel */}
                  <button
                    type="button"
                    onClick={() => setTargetStatus("cancelled")}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-1 ${
                      targetStatus === "cancelled" || targetStatus === "cancel"
                        ? "border-rose-500 bg-rose-50/70 text-rose-900 ring-2 ring-rose-400/20"
                        : "border-slate-200 hover:border-slate-300 bg-white text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-black text-xs">
                      <XCircle size={14} className="text-rose-600" /> Cancel Booking
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight">
                      Cancel this assignment
                    </p>
                  </button>
                </div>
              </div>

              {/* Dynamic Info / Notes based on target status */}
              {(targetStatus === "in-progress" || targetStatus === "start") && (
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start gap-2.5">
                  <Play size={16} className="text-indigo-600 fill-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block">Customer Notification Notice:</span>
                    <span className="text-[11px] text-indigo-700 leading-tight block mt-0.5">
                      Starting this service will immediately send an in-app & push notification to the customer asking them to confirm agreement.
                    </span>
                  </div>
                </div>
              )}

              {(targetStatus === "completed" || targetStatus === "complete") && (
                <div>
                  {selectedBookingForStatus.isUserAgreed || selectedBookingForStatus.userConsent?.agreed ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                      <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold block">Customer Agreed ✅</span>
                        <span className="text-[11px] text-emerald-700 leading-tight block mt-0.5">
                          Customer has confirmed agreement. You can safely complete this booking.
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                      <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold block">Customer Agreement Required ⚠️</span>
                        <span className="text-[11px] text-amber-800 leading-tight block mt-0.5">
                          The customer has not yet confirmed agreement for this service. You will not be able to mark it completed until they agree in their dashboard.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(targetStatus === "cancelled" || targetStatus === "cancel") && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Cancellation Reason (Optional):
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Enter reason for cancellation..."
                    rows={2}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForStatus(null)}
                  disabled={updatingStatus}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleUpdateStatusSubmit}
                  disabled={updatingStatus || !targetStatus}
                  className="px-5 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-xl text-xs font-extrabold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {updatingStatus && <Loader2 size={14} className="animate-spin" />}
                  {updatingStatus ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
