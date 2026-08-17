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
  bookingStatus: "pending" | "accepted" | "in-progress" | "completed" | "cancelled";
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
    // Role status mapping
    const statusMatches =
      statusFilter === "All" ||
      (statusFilter === "Pending" && booking.bookingStatus === "pending") ||
      (statusFilter === "Scheduled" && booking.bookingStatus === "accepted") ||
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
          <p className="text-slate-500 mt-1">Manage and track your service bookings</p>
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
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <Clock size={26} />
          </div>
          <div>
            <span className="text-sm font-semibold text-slate-400 block uppercase tracking-wider">
              Ongoing
            </span>
            <span className="text-2xl font-black text-slate-800">{stats.inProgress}</span>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
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
                            <span className="flex items-center gap-0.5 truncate max-w-[150px]" title={booking.userId.address}>
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

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2.5 py-1 text-[11px] font-bold rounded-full border uppercase ${getStatusBadgeClass(
                            booking.bookingStatus
                          )}`}
                        >
                          {booking.bookingStatus === "accepted" ? "Scheduled" : booking.bookingStatus}
                        </span>
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
                          {booking.bookingStatus === "pending" && (
                            <button
                              onClick={() => handleAcceptBooking(booking._id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white hover:shadow-md transition-all text-xs font-bold rounded-xl"
                            >
                              Accept
                            </button>
                          )}
                          <Link
                            to={`/vendor/bookings/${booking._id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#63D64F]/10 to-[#3DB9A6]/10 text-teal-800 hover:from-[#63D64F]/20 hover:to-[#3DB9A6]/20 transition-all text-xs font-bold rounded-xl border border-teal-200/50"
                          >
                            <Eye size={13} />
                            Details
                            <ChevronRight size={12} />
                          </Link>
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
    </div>
  );
}
