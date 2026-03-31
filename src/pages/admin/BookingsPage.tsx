import { useEffect, useState } from 'react';
import { Search, Calendar, Download, FileText, Receipt, Image } from 'lucide-react';
import { bookingAPI, prescriptionAPI, reportAPI, invoiceAPI } from '../../services/api';
import { setBookings, setLoading } from '../../store/slices/bookingSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const BookingsPage = () => {
  const dispatch = useAppDispatch();
  const { bookings, loading } = useAppSelector((state: any) => state.bookings);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    dispatch(setLoading(true));
    try {
      const response = await bookingAPI.getAllBookings();
      if (response.data.success) {
        dispatch(setBookings(response.data.data));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch bookings');
      console.error('Error fetching bookings:', error);
    }
  };

  const handleExportToExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = filteredBookings.map((booking: any) => ({
        'Patient Name': booking.patientName,
        'Age': booking.age,
        'Gender': booking.sex,
        'Email': booking.email,
        'Phone': booking.alternateMobile || 'N/A',
        'Address': booking.address,
        'Pincode': booking.pincode,
        'Services': booking.selectedServices.map((s: any) => s.serviceName).join(', '),
        'Subtotal': booking.subtotal,
        'GST': booking.gstAmount,
        'Grand Total': booking.grandTotal,
        'Vendor': booking.vendorId?.businessName || 'Not Assigned',
        'Status': booking.bookingStatus,
        'Time Slot': booking.preferredTimeSlot,
        'Staff Preference': booking.staffPreference,
        'Created At': new Date(booking.createdAt).toLocaleDateString('en-IN'),
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
      
      // Generate filename with current date
      const fileName = `Bookings_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, fileName);
      
      toast.success('Bookings data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    }
  };

  const handleViewPrescription = async (bookingId: string) => {
    try {
      const response = await prescriptionAPI.getPrescription(bookingId);
      if (response.data.success && response.data.data.prescriptionUrl) {
        window.open(response.data.data.prescriptionUrl, '_blank');
      } else {
        toast.info('No prescription uploaded for this booking');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch prescription');
    }
  };

  const handleViewReport = async (bookingId: string) => {
    try {
      const response = await reportAPI.getReport(bookingId);
      if (response.data.success && response.data.data.reportUrl) {
        window.open(response.data.data.reportUrl, '_blank');
      } else {
        toast.info('Report not yet generated for this booking');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch report');
    }
  };

  const handleDownloadInvoice = async (bookingId: string) => {
    try {
      const response = await invoiceAPI.generateInvoice(bookingId);
      
      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      window.URL.revokeObjectURL(url);
      
      toast.success('Invoice downloaded successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to download invoice');
    }
  };

  const filteredBookings = bookings.filter((booking: any) =>
    booking.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.bookingStatus.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Bookings Management</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Download size={20} />
            Export to Excel
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#63D64F]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Patient</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Services</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Vendor</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking: any) => (
                  <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{booking.patientName}</p>
                        <p className="text-sm text-gray-600">{booking.email}</p>
                        <p className="text-sm text-gray-600">{booking.age} years, {booking.sex}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {booking.selectedServices.map((service: any, idx: number) => (
                          <div key={idx} className="text-sm">
                            <p className="font-medium text-gray-800">{service.serviceName}</p>
                            <p className="text-gray-600">Qty: {service.quantity} × ₹{service.price}</p>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {booking.vendorId ? (
                        <div>
                          <p className="font-medium text-gray-800">{booking.vendorId.businessName}</p>
                          <p className="text-sm text-gray-600">{booking.vendorId.name}</p>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-gray-800">₹{booking.grandTotal}</p>
                        <p className="text-sm text-gray-600">Subtotal: ₹{booking.subtotal}</p>
                        <p className="text-sm text-gray-600">GST: ₹{booking.gstAmount}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        booking.bookingStatus === 'completed' ? 'bg-green-100 text-green-700' :
                        booking.bookingStatus === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                        booking.bookingStatus === 'accepted' ? 'bg-purple-100 text-purple-700' :
                        booking.bookingStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{formatDate(booking.createdAt)}</p>
                      <p className="text-xs text-gray-600">{booking.preferredTimeSlot}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewPrescription(booking._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Prescription"
                        >
                          <Image size={18} />
                        </button>
                        <button
                          onClick={() => handleViewReport(booking._id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="View Report"
                        >
                          <FileText size={18} />
                        </button>
                        <button
                          onClick={() => handleDownloadInvoice(booking._id)}
                          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Download Invoice"
                        >
                          <Receipt size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No bookings found</p>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
