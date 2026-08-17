import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bookingAPI } from "../../services/api";
import { toast } from "react-toastify";
import {
  CheckCircle2,
  Phone,
  MapPin,
  ClipboardList,
  User,
} from "lucide-react";

interface RequestNotification {
  _id: string;
  bookingId?: {
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
      serviceId?: {
        serviceName: string;
      };
      serviceName: string;
      price: number;
    }>;
    bookingStatus: string;
    preferredTimeSlot?: string;
    paymentStatus: string;
    grandTotal: number;
    createdAt: string;
  };
  title: string;
  message: string;
  status: string;
  createdAt: string;
}

export default function VendorRequestsPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<RequestNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getVendorNotifications();
      if (response.data.success) {
        setRequests(response.data.data || []);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to fetch booking requests"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (bookingId: string) => {
    try {
      const response = await bookingAPI.acceptUserBooking(bookingId);
      if (response.data.success) {
        toast.success("Booking accepted successfully!");
        // Refresh the list
        fetchRequests();
        // Redirect to booking details
        navigate(`/vendor/bookings/${bookingId}`);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to accept booking request"
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

  // Only show active booking requests (i.e. booking exists and is currently pending)
  const activeRequests = requests.filter(
    (req) => req.bookingId && req.bookingId.bookingStatus === "pending"
  );

  return (
    <div className="max-w-full space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] bg-clip-text text-transparent">
          Booking Requests
        </h1>
        <p className="text-slate-500 mt-1">
          Review and accept new service requests in your area
        </p>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="bg-white py-20 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#63D64F]"></div>
          <p className="mt-4 text-slate-500 font-semibold text-sm">
            Loading requests...
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeRequests.length === 0 ? (
            <div className="bg-white py-20 rounded-2xl border border-slate-100 shadow-sm text-center text-slate-400 flex flex-col items-center justify-center">
              <ClipboardList size={48} className="text-slate-200 mb-4" />
              <p className="font-bold text-slate-500 text-base">
                No pending requests
              </p>
              <p className="text-xs text-slate-400 mt-1">
                New booking requests for your service area will show up here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {activeRequests.map((req) => {
                const booking = req.bookingId!;
                const dateTime = formatBookingDateTime(booking);
                return (
                  <div
                    key={req._id}
                    className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    {/* Booking Details */}
                    <div className="flex-1 space-y-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                          #{booking.bookingId || booking._id.slice(-8).toUpperCase()}
                        </span>
                        <span className="text-xs text-slate-400">
                          Requested: {new Date(req.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* Customer & Location */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-start gap-2 text-slate-700">
                          <User className="w-4 h-4 text-slate-400 mt-0.5" />
                          <div>
                            <p className="font-bold text-sm">{booking.userId?.name || "Patient"}</p>
                            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                              <Phone className="w-3 h-3" /> {booking.userId?.phone || "N/A"}
                            </p>
                          </div>
                        </div>

                        {booking.userId?.address && (
                          <div className="flex items-start gap-2 text-slate-700">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                            <div>
                              <p className="font-semibold text-xs">Service Location</p>
                              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                                {booking.userId.address}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Services */}
                      <div className="flex flex-wrap gap-1.5 pt-1.5">
                        {booking.services?.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-green-50 border border-green-100 text-green-700 text-[10px] font-bold"
                          >
                            {s.serviceName || s.serviceId?.serviceName || "Healthcare Service"}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Preferred Slot & Price & Accept Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 min-w-[200px]">
                      <div className="text-left md:text-right space-y-1">
                        <div className="text-xs text-slate-400 font-medium">Preferred Schedule</div>
                        <div className="text-sm font-bold text-slate-700">
                          📅 {dateTime.date}
                        </div>
                        <div className="text-xs text-blue-600 font-bold">
                          🕐 {dateTime.time}
                        </div>
                      </div>

                      <div className="text-right flex items-center gap-4 md:flex-col md:gap-2 w-full md:w-auto">
                        <div className="flex items-baseline gap-1 md:justify-end">
                          <span className="text-xs text-slate-400 font-semibold">Total:</span>
                          <span className="text-lg font-black text-slate-800">
                            ₹{booking.grandTotal}
                          </span>
                        </div>

                        <div className="flex gap-2 flex-1 md:flex-none">
                          <button
                            onClick={() => handleAcceptRequest(booking._id)}
                            className="flex-1 md:flex-none px-5 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-bold text-xs rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle2 size={13} />
                            Accept
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
