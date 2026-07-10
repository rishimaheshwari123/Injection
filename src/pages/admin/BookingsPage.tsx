import { useEffect, useState } from "react";
import {
  Search,
  Calendar,
  Download,
  FileText,
  Receipt,
  Image,
  Plus,
  Edit2,
  MessageSquare,
  MoreVertical,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import {
  bookingAPI,
  prescriptionAPI,
  reportAPI,
  invoiceAPI,
  serviceAPI,
  vendorAPI,
  userAPI,
} from "../../services/api";
import {
  setBookings,
  addBooking,
  updateBooking,
  setLoading,
} from "../../store/slices/bookingSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

// Import all modal components
import {
  CreateBookingModal,
  StatusUpdateModal,
  NotesModal,
  ServiceDetailModal,
  ViewPrescriptionModal,
  ReportUploadModal,
  ViewReportsModal,
  AddPrescriptionModal,
  RescheduleBookingModal,
  CancelBookingModal,
  PrescriptionSummaryModal,
  RequestedItemsModal,
} from "../../components/bookings";

const BookingsPage = () => {
  const dispatch = useAppDispatch();
  const { bookings, loading } = useAppSelector((state: any) => state.bookings);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [bookingToEdit, setBookingToEdit] = useState<any>(null);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchQuery);
    setCurrentPage(1);
  };

  const [vendorFilter, setVendorFilter] = useState("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [customLimit, setCustomLimit] = useState("");

  // Modal visibility states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showServiceDetailModal, setShowServiceDetailModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showViewReportsModal, setShowViewReportsModal] = useState(false);
  const [showAddPrescriptionModal, setShowAddPrescriptionModal] =
    useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [showRequestedItemsModal, setShowRequestedItemsModal] = useState(false);

  // Selected data for modals
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [viewingPrescription, setViewingPrescription] = useState<any>(null);
  const [selectedBookingForReport, setSelectedBookingForReport] =
    useState<any>(null);
  const [viewingReports, setViewingReports] = useState<any>(null);
  const [selectedBookingForPrescription, setSelectedBookingForPrescription] =
    useState<any>(null);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] =
    useState<any>(null);
  const [selectedBookingForCancel, setSelectedBookingForCancel] =
    useState<any>(null);

  // Data states
  const [vendors, setVendors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchBookings();
    fetchVendors();
    fetchServices();
    fetchUsers();
  }, [currentPage, limit, statusFilter, vendorFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchBookings();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchVendors = async () => {
    try {
      const response = await vendorAPI.getAllVendors();
      if (response.data.success) {
        setVendors(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await serviceAPI.getAllServices();
      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const fetchBookings = async () => {
    dispatch(setLoading(true));
    try {
      const params = {
        page: currentPage,
        limit,
        status: statusFilter,
        search: searchTerm,
        vendorId: vendorFilter,
      };
      const response = await bookingAPI.getAllBookings(params);
      if (response.data.success) {
        dispatch(setBookings(response.data.data));
        setTotalPages(response.data.totalPages || 1);
        setTotalBookings(
          response.data.totalBookings || response.data.data.length,
        );
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch bookings");
      console.error("Error fetching bookings:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleExportToExcel = () => {
    try {
      const excelData = bookings.map((booking: any) => {
        const dateTime = formatBookingDateTime(booking);
        return {
          "Patient Name": booking.patientName,
          Age: booking.age,
          Gender: booking.sex,
          Email: booking.email,
          Phone: booking.alternateMobile || "N/A",
          Address: booking.address,
          Pincode: booking.pincode,
          Services: booking.selectedServices
            .map((s: any) => s.serviceName)
            .join(", "),
          Subtotal: booking.subtotal,
          GST: 0,
          "Grand Total": booking.subtotal,
          Vendor: booking.vendorId?.businessName || "Not Assigned",
          Status: booking.bookingStatus,
          "Booking Date": dateTime.date,
          "Booking Time": dateTime.time,
          "Time Slot": booking.preferredTimeSlot || "N/A",
          "Staff Preference": booking.staffPreference,
          "Created At": new Date(booking.createdAt).toLocaleDateString("en-IN"),
        };
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Bookings");
      const fileName = `Bookings_Page_${currentPage}_${new Date().toISOString().split("T")[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      toast.success("Current page bookings exported successfully!");
    } catch (error) {
      toast.error("Failed to export data");
      console.error("Export error:", error);
    }
  };

  const handleViewPrescription = async (bookingId: string) => {
    try {
      const booking = bookings.find((b: any) => b._id === bookingId);
      if (!booking) {
        toast.error("Booking not found");
        return;
      }

      setViewingPrescription(booking);
      setShowPrescriptionModal(true);
    } catch (error: any) {
      toast.error("Failed to load prescription");
    }
  };

  const handleViewReport = async (booking: any) => {
    if (booking.reports && booking.reports.length > 0) {
      setViewingReports(booking);
      setShowViewReportsModal(true);
    } else if (booking.reportUrl) {
      window.open(booking.reportUrl, "_blank");
    } else {
      toast.info("No reports available for this booking");
    }
  };

  const handleDownloadInvoice = async (bookingId: string) => {
    try {
      const response = await invoiceAPI.generateInvoice(bookingId);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice_${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully!");
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to download invoice",
      );
    }
  };

  const filteredBookings = bookings.filter((booking: any) => {
    const matchesSearch =
      booking.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingStatus.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "" || booking.bookingStatus === statusFilter;
    const matchesVendor =
      vendorFilter === "" || booking.vendorId?._id === vendorFilter;

    return matchesSearch && matchesStatus && matchesVendor;
  });

  // Handler for CreateBookingModal
  const handleCreateBooking = async (data: any) => {
    const {
      formData,
      bookingType,
      selectedUser,
      prescriptionData,
      prescriptionFile,
      dateTimeSlots,
    } = data;

    const subtotal = formData.selectedServices.reduce(
      (sum: number, s: any) => sum + s.price * s.quantity,
      0,
    );
    const grandTotal = subtotal;

    const vendorId = formData.vendorId || (
      formData.selectedServices.length > 0
        ? formData.selectedServices[0].vendorId
        : null
    );

    try {
      // Create multiple bookings for each date-time slot
      const createdBookings = [];

      for (let i = 0; i < dateTimeSlots.length; i++) {
        const slot = dateTimeSlots[i];
        const preferredTimeSlot = `${slot.date} ${slot.time}`;

        const bookingData = {
          ...formData,
          preferredTimeSlot,
          vendorId,
          userId: bookingType === "self" ? selectedUser : "NEW_PATIENT",
          subtotal,
          gstAmount: 0,
          grandTotal,
        };

        const response = await bookingAPI.createBooking(bookingData);
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

          dispatch(addBooking(createdBooking));
        }
      }

      if (createdBookings.length > 0) {
        toast.success(
          `${createdBookings.length} booking(s) created successfully!`,
        );
        setShowCreateModal(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create bookings");
    }
  };

  const handleUpdateBooking = async (data: any) => {
    if (!bookingToEdit) return;

    const {
      formData,
      dateTimeSlots,
    } = data;

    const subtotal = formData.selectedServices.reduce(
      (sum: number, s: any) => sum + s.price * s.quantity,
      0,
    );

    const slot = dateTimeSlots[0] || { date: '', time: '' };
    const preferredTimeSlot = `${slot.date} ${slot.time}`;

    const vendorId = formData.vendorId || (
      formData.selectedServices.length > 0
        ? formData.selectedServices[0].vendorId
        : null
    );

    try {
      const bookingData = {
        ...formData,
        preferredTimeSlot,
        vendorId,
        subtotal,
        gstAmount: 0,
        grandTotal: subtotal,
      };

      const response = await bookingAPI.updateBooking(bookingToEdit._id, bookingData);
      if (response.data.success) {
        toast.success("Booking updated successfully!");
        dispatch(updateBooking(response.data.data));
        setShowCreateModal(false);
        setBookingToEdit(null);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update booking");
    }
  };

  // Handler for StatusUpdateModal
  const handleStatusUpdate = async (status: string) => {
    if (!selectedBooking) return;

    const response = await bookingAPI.updateBookingStatus(
      selectedBooking._id,
      status,
    );
    if (response.data.success) {
      const updatedBooking = { ...selectedBooking, bookingStatus: status };
      dispatch(updateBooking(updatedBooking));
      toast.success("Booking status updated successfully!");
    }
  };

  // Handler for NotesModal
  const handleAddNote = async (note: string) => {
    if (!selectedBooking) return;

    const response = await bookingAPI.addBookingNote(selectedBooking._id, note);
    if (response.data.success) {
      dispatch(updateBooking(response.data.data));
      toast.success("Note added successfully!");
    }
  };

  // Handler for ReportUploadModal
  const handleUploadReport = async (
    file: File,
    reportType: string,
    reportName: string,
  ) => {
    if (!selectedBookingForReport) return;

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
      }
    }
  };

  // Handler for AddPrescriptionModal
  const handleAddPrescription = async (
    prescriptionData: any,
    prescriptionFile: File | null,
  ) => {
    if (!selectedBookingForPrescription) return;

    try {
      // If supporting image is also uploaded
      if (prescriptionFile) {
        try {
          console.log("Uploading prescription image...", prescriptionFile.name);
          const uploadResponse =
            await prescriptionAPI.uploadImage(prescriptionFile);
          console.log("Upload response:", uploadResponse.data);

          if (uploadResponse.data.success) {
            // Save form data + supporting image URL
            await bookingAPI.updatePrescription(
              selectedBookingForPrescription._id,
              {
                ...prescriptionData,
                supportingImageUrl: uploadResponse.data.data.url,
              },
              "form",
            );
            toast.success("Prescription added with form and image!");
          } else {
            console.error("Image upload failed:", uploadResponse.data);
            // Save form data without image
            await bookingAPI.updatePrescription(
              selectedBookingForPrescription._id,
              prescriptionData,
              "form",
            );
            toast.warning("Prescription added with form (image upload failed)");
          }
        } catch (error: any) {
          console.error("Error uploading prescription image:", error);
          console.error("Error response:", error.response?.data);
          // Save form data without image
          await bookingAPI.updatePrescription(
            selectedBookingForPrescription._id,
            prescriptionData,
            "form",
          );
          toast.warning(
            `Prescription added with form (image upload error: ${error.response?.data?.message || error.message})`,
          );
        }
      } else {
        // Save form data only
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
      console.error("Error saving prescription:", error);
      toast.error(
        "Failed to add prescription: " +
        (error.response?.data?.message || error.message),
      );
    }
  };

  // Handler for RescheduleBookingModal
  const handleRescheduleBooking = async (
    newDate: string,
    newTime: string,
    reason: string,
  ) => {
    if (!selectedBookingForReschedule) return;

    try {
      const response = await bookingAPI.rescheduleBooking(
        selectedBookingForReschedule._id,
        newDate,
        newTime,
        reason,
      );

      if (response.data.success) {
        toast.success("Booking rescheduled successfully!");
        dispatch(updateBooking(response.data.data));
        setShowRescheduleModal(false);
        setSelectedBookingForReschedule(null);
        fetchBookings();
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to reschedule booking",
      );
    }
  };

  // Handler for CancelBookingModal
  const handleCancelBooking = async (reason: string) => {
    if (!selectedBookingForCancel) return;

    try {
      const response = await bookingAPI.cancelBooking(
        selectedBookingForCancel._id,
        reason,
      );

      if (response.data.success) {
        toast.success("Booking cancelled successfully!");
        dispatch(updateBooking(response.data.data));
        setShowCancelModal(false);
        setSelectedBookingForCancel(null);
        fetchBookings();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to cancel booking");
    }
  };

  const handleUpdateRequestedItems = async (items: any[]) => {
    if (!selectedBooking) return;
    try {
      const response = await bookingAPI.updateRequestedItems(
        selectedBooking._id,
        items
      );
      if (response.data.success) {
        dispatch(updateBooking(response.data.data));
        toast.success("Requested items updated successfully!");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to update requested items"
      );
      console.error("Error updating requested items:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatBookingDateTime = (booking: any) => {
    // If preferredTimeSlot exists, parse and format it
    if (booking.preferredTimeSlot) {
      try {
        // preferredTimeSlot format: "2026-04-20 10:00"
        const [datePart, timePart] = booking.preferredTimeSlot.split(" ");

        if (datePart && timePart) {
          const date = new Date(datePart);
          const formattedDate = date.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });

          // Convert 24-hour time to 12-hour format with AM/PM
          const [hours, minutes] = timePart.split(":");
          const hour = parseInt(hours, 10);
          const period = hour >= 12 ? "PM" : "AM";
          const hour12 = hour % 12 || 12; // Convert 0 to 12 for midnight
          const formattedTime = `${hour12}:${minutes} ${period}`;

          return {
            date: formattedDate,
            time: formattedTime,
            full: `${formattedDate} at ${formattedTime}`,
          };
        }
      } catch (error) {
        console.error("Error parsing preferredTimeSlot:", error);
      }
    }

    // Fallback to createdAt
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
      full: formatDate(booking.createdAt),
    };
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Bookings Management
        </h1>
        <div className="flex flex-wrap items-center gap-3 md:justify-end">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none text-sm bg-white"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Vendor Filter */}
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none text-sm bg-white max-w-xs"
          >
            <option value="">All Vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor._id} value={vendor._id}>
                {vendor.businessName || vendor.name}
              </option>
            ))}
          </select>

          {/* Export Button */}
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
          >
            <Download size={18} />
            Export
          </button>

          {/* Create Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium"
          >
            <Plus size={18} />
            Add Booking
          </button>
        </div>
      </div>

      {/* Full-width Search Box with Search Button */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by patient name, service name, vendor name, vendor ID, or patient ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none text-sm bg-white"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 bg-gray-800 text-white font-medium text-sm rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
        >
          <Search size={18} />
          Search
        </button>
      </form>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#63D64F]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Patient
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Services
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Vendor
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Booking Date & Time
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking: any) => (
                <tr
                  key={booking._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">
                        {booking.patientName}
                      </p>
                      <p className="text-sm text-gray-600">{booking.email}</p>
                      <p className="text-sm text-gray-600">
                        {booking.age} years, {booking.sex}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {booking.selectedServices.map(
                        (service: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            <p className="font-medium text-gray-800">
                              {service.serviceName}
                            </p>
                            <p className="text-gray-600">
                              Qty: {service.quantity} × ₹{service.price}
                            </p>
                          </div>
                        ),
                      )}

                      {booking.requestedItems && booking.requestedItems.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-dashed border-gray-200">
                          <p className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                            <ShoppingBag size={10} /> Requested Items
                          </p>
                          <div className="space-y-1">
                            {booking.requestedItems.map((item: any, idx: number) => (
                              <div key={idx} className="flex flex-wrap items-center gap-1 text-xs">
                                <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'brought' ? 'bg-green-500' :
                                  item.status === 'unavailable' ? 'bg-red-500' : 'bg-yellow-500'
                                  }`} />
                                <span className="font-medium text-gray-700">{item.itemName}</span>
                                <span className="text-gray-500 font-semibold">(x{item.quantity})</span>
                                <span className={`text-[9px] px-1 rounded-sm border uppercase font-bold scale-90 origin-left ${item.status === 'brought' ? 'bg-green-50 text-green-700 border-green-200' :
                                  item.status === 'unavailable' ? 'bg-red-50 text-red-700 border-red-200' :
                                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                                  }`}>
                                  {item.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {booking.vendorId ? (
                      <div>
                        <p className="font-medium text-gray-800">
                          {booking.vendorId.businessName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking.vendorId.name}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        Not assigned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-gray-800">
                        ₹{booking.subtotal}
                      </p>
                      <p className="text-sm text-gray-600">
                        Subtotal: ₹{booking.subtotal}
                      </p>
                      <p className="text-sm text-gray-600">
                        GST: ₹0
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${booking.bookingStatus === "completed"
                        ? "bg-green-100 text-green-700"
                        : booking.bookingStatus === "in-progress"
                          ? "bg-blue-100 text-blue-700"
                          : booking.bookingStatus === "accepted"
                            ? "bg-purple-100 text-purple-700"
                            : booking.bookingStatus === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {booking.bookingStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        📅 {formatBookingDateTime(booking).date}
                      </p>
                      <p className="text-sm font-medium text-blue-600">
                        🕐 {formatBookingDateTime(booking).time}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created:{" "}
                        {new Date(booking.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === booking._id ? null : booking._id,
                          )
                        }
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical size={20} className="text-gray-600" />
                      </button>

                      {openDropdown === booking._id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenDropdown(null)}
                          />
                          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                            <button
                              onClick={() => {
                                setBookingToEdit(booking);
                                setShowCreateModal(true);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-blue-600 font-semibold"
                            >
                              <Edit2 size={16} />
                              Edit Booking
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowStatusModal(true);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-orange-600"
                            >
                              <Edit2 size={16} />
                              Update Status
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowRequestedItemsModal(true);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-violet-600 font-semibold"
                            >
                              <ShoppingBag size={16} />
                              Requested Items
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowNotesModal(true);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-indigo-600"
                            >
                              <MessageSquare size={16} />
                              {booking.notes && booking.notes.length > 0
                                ? "View/Add Notes"
                                : "Add Notes"}
                            </button>
                            <div className="border-t border-gray-200 my-2"></div>
                            {booking.prescriptions && booking.prescriptions.length > 0 ? (
                              <>
                                <button
                                  onClick={() => {
                                    handleViewPrescription(booking._id);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-blue-600"
                                >
                                  <Image size={16} />
                                  View Prescription
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setShowSummaryModal(true);
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-emerald-600"
                                >
                                  <FileText size={16} />
                                  Prescription Summary
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedBookingForPrescription(booking);
                                  setShowAddPrescriptionModal(true);
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-cyan-600"
                              >
                                <Upload size={16} />
                                Add Prescription
                              </button>
                            )}

                            {((booking.reports && booking.reports.length > 0) || booking.reportUrl) ? (
                              <button
                                onClick={() => {
                                  handleViewReport(booking);
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-green-600"
                              >
                                <FileText size={16} />
                                {booking.reports && booking.reports.length > 0
                                  ? `View Reports (${booking.reports.length})`
                                  : "View Report"}
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedBookingForReport(booking);
                                  setShowReportModal(true);
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-teal-600"
                              >
                                <Upload size={16} />
                                Upload Report
                              </button>
                            )}
                            <button
                              onClick={() => {
                                handleDownloadInvoice(booking._id);
                                setOpenDropdown(null);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-purple-600"
                            >
                              <Receipt size={16} />
                              Download Invoice
                            </button>
                            <div className="border-t border-gray-200 my-2"></div>
                            <button
                              onClick={() => {
                                setSelectedBookingForReschedule(booking);
                                setShowRescheduleModal(true);
                                setOpenDropdown(null);
                              }}
                              disabled={
                                booking.bookingStatus === "completed" ||
                                booking.bookingStatus === "cancelled"
                              }
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Calendar size={16} />
                              Reschedule
                            </button>
                            <button
                              onClick={() => {
                                setSelectedBookingForCancel(booking);
                                setShowCancelModal(true);
                                setOpenDropdown(null);
                              }}
                              disabled={
                                booking.bookingStatus === "completed" ||
                                booking.bookingStatus === "cancelled"
                              }
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <X size={16} />
                              Cancel Booking
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && totalBookings > 0 && (
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-md gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#63D64F] outline-none"
              >
                <option value="10">10</option>
                <option value="20">20</option>
                <option value="50">50</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Custom limit"
                value={customLimit}
                onChange={(e) => setCustomLimit(e.target.value)}
                onBlur={() => {
                  if (customLimit && Number(customLimit) > 0) {
                    setLimit(Number(customLimit));
                    setCurrentPage(1);
                  }
                }}
                className="w-24 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#63D64F] outline-none"
              />
            </div>
            <span className="text-sm text-gray-500">
              Showing {Math.min((currentPage - 1) * limit + 1, totalBookings)}{" "}
              to {Math.min(currentPage * limit, totalBookings)} of{" "}
              {totalBookings} bookings
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Show only a few page numbers if there are too many
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${currentPage === pageNum
                        ? "bg-[#63D64F] text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100 border border-transparent hover:border-gray-200"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return (
                    <span key={pageNum} className="px-1 text-gray-400">
                      ...
                    </span>
                  );
                }
                return null;
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No bookings found</p>
        </div>
      )}

      {/* All Modals */}
      <CreateBookingModal
        show={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setBookingToEdit(null);
        }}
        onSubmit={bookingToEdit ? handleUpdateBooking : handleCreateBooking}
        services={services}
        users={users}
        vendors={vendors}
        bookingToEdit={bookingToEdit}
        onServiceDetailClick={(service) => {
          setSelectedService(service);
          setShowServiceDetailModal(true);
        }}
      />

      <StatusUpdateModal
        show={showStatusModal}
        onClose={() => {
          setShowStatusModal(false);
          setSelectedBooking(null);
        }}
        onSubmit={handleStatusUpdate}
        booking={selectedBooking}
      />

      <NotesModal
        show={showNotesModal}
        onClose={() => {
          setShowNotesModal(false);
          setSelectedBooking(null);
        }}
        onSubmit={handleAddNote}
        booking={selectedBooking}
      />

      <ServiceDetailModal
        show={showServiceDetailModal}
        onClose={() => {
          setShowServiceDetailModal(false);
          setSelectedService(null);
        }}
        service={selectedService}
      />

      <ViewPrescriptionModal
        show={showPrescriptionModal}
        onClose={() => {
          setShowPrescriptionModal(false);
          setViewingPrescription(null);
        }}
        booking={viewingPrescription}
        isAdmin={true}
        onUpdateSummary={async (summary) => {
          try {
            const response = await bookingAPI.updatePrescriptionSummary(
              viewingPrescription._id,
              summary
            );
            if (response.data.success) {
              dispatch(updateBooking(response.data.data));
              setViewingPrescription(response.data.data);
              toast.success("Prescription summary updated successfully!");
            }
          } catch (error: any) {
            toast.error(
              error.response?.data?.message || "Failed to update prescription summary",
            );
          }
        }}
      />

      <PrescriptionSummaryModal
        show={showSummaryModal}
        onClose={() => {
          setShowSummaryModal(false);
          setSelectedBooking(null);
        }}
        onSubmit={async (summary) => {
          try {
            const response = await bookingAPI.updatePrescriptionSummary(
              selectedBooking._id,
              summary
            );
            if (response.data.success) {
              dispatch(updateBooking(response.data.data));
              toast.success("Prescription summary updated successfully!");
            }
          } catch (error: any) {
            toast.error(
              error.response?.data?.message || "Failed to update prescription summary",
            );
          }
        }}
        booking={selectedBooking}
      />

      <ReportUploadModal
        show={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedBookingForReport(null);
        }}
        onSubmit={handleUploadReport}
        booking={selectedBookingForReport}
      />

      <ViewReportsModal
        show={showViewReportsModal}
        onClose={() => {
          setShowViewReportsModal(false);
          setViewingReports(null);
        }}
        booking={viewingReports}
      />

      <AddPrescriptionModal
        show={showAddPrescriptionModal}
        onClose={() => {
          setShowAddPrescriptionModal(false);
          setSelectedBookingForPrescription(null);
        }}
        onSubmit={handleAddPrescription}
        booking={selectedBookingForPrescription}
      />

      <RescheduleBookingModal
        show={showRescheduleModal}
        onClose={() => {
          setShowRescheduleModal(false);
          setSelectedBookingForReschedule(null);
        }}
        onSubmit={handleRescheduleBooking}
        booking={selectedBookingForReschedule}
      />

      <CancelBookingModal
        show={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setSelectedBookingForCancel(null);
        }}
        onSubmit={handleCancelBooking}
        booking={selectedBookingForCancel}
      />

      <RequestedItemsModal
        show={showRequestedItemsModal}
        onClose={() => {
          setShowRequestedItemsModal(false);
          setSelectedBooking(null);
        }}
        onSubmit={handleUpdateRequestedItems}
        booking={selectedBooking}
      />
    </div>
  );
};

export default BookingsPage;
