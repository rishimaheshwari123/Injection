import { useEffect, useState } from 'react';
import { Search, Calendar, Download, FileText, Receipt, Image, Plus, X, Edit2, MessageSquare, Loader2, MoreVertical, Upload } from 'lucide-react';
import { bookingAPI, prescriptionAPI, reportAPI, invoiceAPI, serviceAPI, vendorAPI, userAPI } from '../../services/api';
import { setBookings, addBooking, updateBooking, setLoading } from '../../store/slices/bookingSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const BookingsPage = () => {
  const dispatch = useAppDispatch();
  const { bookings, loading } = useAppSelector((state: any) => state.bookings);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showServiceDetailModal, setShowServiceDetailModal] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [vendorFilter, setVendorFilter] = useState('');
  const [vendors, setVendors] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [bookingType, setBookingType] = useState<'self' | 'others'>('self');
  const [selectedUser, setSelectedUser] = useState('');
  const [notes, setNotes] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState<string>('');
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [viewingPrescription, setViewingPrescription] = useState<any>(null);
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
  
  // Report Upload State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportPreview, setReportPreview] = useState<string>('');
  const [uploadingReport, setUploadingReport] = useState(false);
  const [selectedBookingForReport, setSelectedBookingForReport] = useState<any>(null);
  const [reportType, setReportType] = useState<'lab' | 'imaging' | 'general' | 'other'>('general');
  const [reportName, setReportName] = useState('');
  const [showViewReportsModal, setShowViewReportsModal] = useState(false);
  const [viewingReports, setViewingReports] = useState<any>(null);
  
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
    serviceLocation: 'At Home'
  });

  useEffect(() => {
    fetchBookings();
    fetchVendors();
    fetchServices();
    fetchUsers();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await vendorAPI.getAllVendors();
      if (response.data.success) {
        setVendors(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await serviceAPI.getAllServices();
      if (response.data.success) {
        setServices(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAllUsers();
      console.log('Users API Response:', response.data);
      if (response.data.success) {
        // Show all users, not just patients
        const allUsers = response.data.data;
        console.log('All Users:', allUsers);
        console.log('Total users:', allUsers.length);
        setUsers(allUsers);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

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
      const booking = bookings.find((b: any) => b._id === bookingId);
      if (!booking) {
        toast.error('Booking not found');
        return;
      }

      if (!booking.prescriptions || booking.prescriptions.length === 0) {
        toast.info('No prescription uploaded for this booking');
        return;
      }

      setViewingPrescription(booking);
      setShowPrescriptionModal(true);
    } catch (error: any) {
      toast.error('Failed to load prescription');
    }
  };

  const handleViewReport = async (booking: any) => {
    if (booking.reports && booking.reports.length > 0) {
      // Show all reports in modal
      setViewingReports(booking);
      setShowViewReportsModal(true);
    } else if (booking.reportUrl) {
      // Legacy single report - open directly
      window.open(booking.reportUrl, '_blank');
    } else {
      toast.info('No reports available for this booking');
    }
  };

  const handleReportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload an image (JPG, PNG, GIF) or PDF file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      setReportFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadReport = async () => {
    if (!reportFile || !selectedBookingForReport) return;

    if (!reportName.trim()) {
      toast.error('Please enter a report name');
      return;
    }

    setUploadingReport(true);
    try {
      // Upload to Cloudinary using file directly
      const uploadResponse = await prescriptionAPI.uploadImage(reportFile);
      if (uploadResponse.data.success) {
        // Update booking with report URL
        const updateResponse = await reportAPI.uploadReport(
          selectedBookingForReport._id,
          uploadResponse.data.data.url,
          reportType,
          reportName
        );
        
        if (updateResponse.data.success) {
          toast.success('Report uploaded successfully!');
          setShowReportModal(false);
          setReportFile(null);
          setReportPreview('');
          setSelectedBookingForReport(null);
          setReportName('');
          setReportType('general');
          fetchBookings(); // Refresh list
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload report');
    } finally {
      setUploadingReport(false);
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

  const filteredBookings = bookings.filter((booking: any) => {
    const matchesSearch = booking.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingStatus.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === '' || booking.bookingStatus === statusFilter;
    const matchesVendor = vendorFilter === '' || booking.vendorId?._id === vendorFilter;
    
    return matchesSearch && matchesStatus && matchesVendor;
  });

  const handleStatusUpdate = async () => {
    if (!selectedBooking || !newStatus) return;
    
    setSubmitting(true);
    try {
      const response = await bookingAPI.updateBookingStatus(selectedBooking._id, newStatus);
      if (response.data.success) {
        // Update booking in Redux store without refresh
        const updatedBooking = { ...selectedBooking, bookingStatus: newStatus };
        dispatch(updateBooking(updatedBooking));
        
        toast.success('Booking status updated successfully!');
        setShowStatusModal(false);
        setSelectedBooking(null);
        setNewStatus('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setSubmitting(false);
    }
  };

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
          vendorId: service.vendorId?._id || service.vendorId // Store vendor ID
        }]
      }));
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.selectedServices.reduce((sum: number, s: any) => sum + (s.price * s.quantity), 0);
    const grandTotal = subtotal; // No GST
    return { subtotal, grandTotal };
  };

  const handlePrescriptionDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPrescriptionData(prev => ({ ...prev, [name]: value }));
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updatedMedications = [...prescriptionData.medications];
    updatedMedications[index] = { ...updatedMedications[index], [field]: value };
    setPrescriptionData(prev => ({ ...prev, medications: updatedMedications }));
  };

  const addMedication = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: [...prev.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    }));
  };

  const removeMedication = (index: number) => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handlePrescriptionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload an image (JPG, PNG, GIF) or PDF file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      setPrescriptionFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    if (bookingType === 'self' && !selectedUser) {
      toast.error('Please select a user');
      return;
    }

    setSubmitting(true);
    try {
      const { subtotal, grandTotal } = calculateTotals();
      
      // Combine date and time for preferredTimeSlot
      const preferredTimeSlot = formData.preferredDate && formData.preferredTime 
        ? `${formData.preferredDate} ${formData.preferredTime}`
        : '';
      
      // Extract vendorId from first selected service
      const vendorId = formData.selectedServices.length > 0 
        ? formData.selectedServices[0].vendorId 
        : null;
      
      const bookingData = {
        ...formData,
        preferredTimeSlot,
        vendorId, // Add vendorId to booking
        userId: bookingType === 'self' ? selectedUser : 'NEW_PATIENT',
        subtotal,
        gstAmount: 0,
        grandTotal
      };

      const response = await bookingAPI.createBooking(bookingData);
      if (response.data.success) {
        const createdBooking = response.data.data;
        
        // Handle prescription based on type
        // Check if any prescription data is filled
        const hasFormData = prescriptionData.doctorName || 
                            prescriptionData.diagnosis || 
                            prescriptionData.medications.some(m => m.name);
        
        if (hasFormData) {
          try {
            // If supporting image is also uploaded
            if (prescriptionFile) {
              try {
                console.log('Uploading prescription image...', prescriptionFile.name);
                // Upload supporting image
                const uploadResponse = await prescriptionAPI.uploadImage(prescriptionFile);
                console.log('Upload response:', uploadResponse.data);
                
                if (uploadResponse.data.success) {
                  // Save form data + supporting image URL
                  await bookingAPI.updatePrescription(
                    createdBooking._id,
                    {
                      ...prescriptionData,
                      supportingImageUrl: uploadResponse.data.data.url
                    },
                    'form'
                  );
                  toast.success('Booking created with prescription form and image!');
                } else {
                  console.error('Image upload failed:', uploadResponse.data);
                  // Save form data without image
                  await bookingAPI.updatePrescription(createdBooking._id, prescriptionData, 'form');
                  toast.warning('Booking created with prescription form (image upload failed)');
                }
              } catch (error: any) {
                console.error('Error uploading prescription image:', error);
                console.error('Error response:', error.response?.data);
                // Save form data without image
                await bookingAPI.updatePrescription(createdBooking._id, prescriptionData, 'form');
                toast.warning(`Booking created with prescription form (image upload error: ${error.response?.data?.message || error.message})`);
              }
            } else {
              // Save form data only
              await bookingAPI.updatePrescription(createdBooking._id, prescriptionData, 'form');
              toast.success('Booking created with prescription form!');
            }
          } catch (error: any) {
            console.error('Error saving prescription:', error);
            toast.warning('Booking created but prescription form save failed: ' + (error.response?.data?.message || error.message));
          }
        } else {
          toast.success('Booking created successfully!');
        }
        
        // Add booking to Redux store without refresh
        dispatch(addBooking(createdBooking));
        
        setShowCreateModal(false);
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
          serviceLocation: 'At Home'
        });
        setBookingType('self');
        setSelectedUser('');
        setPrescriptionFile(null);
        setPrescriptionPreview('');
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
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

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
      {/* First Row - Title, Search, Export */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-800">Bookings Management</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none w-64"
            />
          </div>
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Download size={20} />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Second Row - Filters and Create Button on Right */}
      <div className="flex items-center justify-end mb-6">
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
          >
            <option value="">All Vendors</option>
            {vendors.map((vendor) => (
              <option key={vendor._id} value={vendor._id}>
                {vendor.businessName}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            Create Booking
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#63D64F]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md ">
          <div className="">
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
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === booking._id ? null : booking._id)}
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
                                  setSelectedBooking(booking);
                                  setNewStatus(booking.bookingStatus);
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
                                  setNotes(''); // Clear input for new note
                                  setShowNotesModal(true);
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-indigo-600"
                              >
                                <MessageSquare size={16} />
                                {booking.notes && booking.notes.length > 0 ? 'View/Add Notes' : 'Add Notes'}
                              </button>
                              <div className="border-t border-gray-200 my-2"></div>
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
                                  handleViewReport(booking);
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-green-600"
                              >
                                <FileText size={16} />
                                {booking.reports && booking.reports.length > 0 
                                  ? `View Reports (${booking.reports.length})` 
                                  : 'View Report'}
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedBookingForReport(booking);
                                  setReportName('');
                                  setReportType('general');
                                  setShowReportModal(true);
                                  setOpenDropdown(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-teal-600"
                              >
                                <Upload size={16} />
                                {booking.reports && booking.reports.length > 0 ? 'Add More Reports' : 'Upload Report'}
                              </button>
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
        </div>
      )}

      {!loading && filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No bookings found</p>
        </div>
      )}

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-2xl font-bold text-gray-800">Create New Booking</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
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
                        // Clear form when switching
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
                        // Clear form when switching
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
                      
                      // Auto-fill user details
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
                        // Clear form if no user selected
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
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Services</h3>
                <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                  {services.map((service) => (
                    <div
                      key={service._id}
                      className={`flex items-center gap-3 p-4 border rounded-lg transition-all ${
                        formData.selectedServices.find((s: any) => s.serviceId === service._id)
                          ? 'border-[#63D64F] bg-green-50'
                          : 'border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={!!formData.selectedServices.find((s: any) => s.serviceId === service._id)}
                        onChange={() => handleServiceToggle(service)}
                        className="w-5 h-5 text-[#63D64F] flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{service.serviceName}</p>
                            <p className="text-sm text-gray-600 line-clamp-1">{service.description}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-sm font-medium text-[#63D64F]">₹{service.basePrice}</span>
                              <span className="text-xs text-gray-500">{service.duration} mins</span>
                              <span className="text-xs text-gray-500">{service.category}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedService(service);
                              setShowServiceDetailModal(true);
                            }}
                            className="px-3 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
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

              {/* Prescription Upload (Optional) */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Prescription (Optional)</h3>
                
                {/* Prescription Form - Always visible */}
                <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-3">Prescription Details</h4>
                  
                  {/* Doctor Information */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Doctor Name
                      </label>
                      <input
                        type="text"
                        name="doctorName"
                        value={prescriptionData.doctorName}
                        onChange={handlePrescriptionDataChange}
                        placeholder="Dr. John Doe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        name="doctorRegistration"
                        value={prescriptionData.doctorRegistration}
                        onChange={handlePrescriptionDataChange}
                        placeholder="MCI-12345"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hospital/Clinic Name
                    </label>
                    <input
                      type="text"
                      name="hospitalName"
                      value={prescriptionData.hospitalName}
                      onChange={handlePrescriptionDataChange}
                      placeholder="City Hospital"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>

                  {/* Patient Complaints */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chief Complaints
                    </label>
                    <textarea
                      name="patientComplaints"
                      value={prescriptionData.patientComplaints}
                      onChange={handlePrescriptionDataChange}
                      placeholder="Fever, headache, body pain..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                    />
                  </div>

                  {/* Diagnosis */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diagnosis
                    </label>
                    <textarea
                      name="diagnosis"
                      value={prescriptionData.diagnosis}
                      onChange={handlePrescriptionDataChange}
                      placeholder="Viral fever, Upper respiratory tract infection..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                    />
                  </div>

                  {/* Medications */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Medications (Rx)
                      </label>
                      <button
                        type="button"
                        onClick={addMedication}
                        className="text-xs px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        + Add Medicine
                      </button>
                    </div>
                    <div className="space-y-3">
                      {prescriptionData.medications.map((med, index) => (
                        <div key={index} className="bg-white rounded-lg p-3 border border-gray-300">
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-600">Medicine {index + 1}</span>
                            {prescriptionData.medications.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeMedication(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Medicine name"
                              value={med.name}
                              onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Dosage (e.g., 500mg)"
                              value={med.dosage}
                              onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Frequency (e.g., 2x daily)"
                              value={med.frequency}
                              onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Duration (e.g., 5 days)"
                              value={med.duration}
                              onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                              className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lab Tests */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lab Tests Recommended
                    </label>
                    <textarea
                      name="labTests"
                      value={prescriptionData.labTests}
                      onChange={handlePrescriptionDataChange}
                      placeholder="CBC, Blood Sugar, Urine Test..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                    />
                  </div>

                  {/* Special Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Instructions
                    </label>
                    <textarea
                      name="specialInstructions"
                      value={prescriptionData.specialInstructions}
                      onChange={handlePrescriptionDataChange}
                      placeholder="Take medicine after food, avoid cold drinks..."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm"
                    />
                  </div>

                  {/* Follow-up Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Follow-up Date
                    </label>
                    <input
                      type="date"
                      name="followUpDate"
                      value={prescriptionData.followUpDate}
                      onChange={handlePrescriptionDataChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>

                  {/* Optional Prescription Image */}
                  <div className="border-t border-blue-300 pt-4 mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prescription Image/PDF (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handlePrescriptionFileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none text-sm bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload a scanned copy or photo of the prescription (Max 10MB)</p>
                    
                    {prescriptionPreview && (
                      <div className="relative mt-3">
                        <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                        {prescriptionFile?.type === 'application/pdf' ? (
                          <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-3">
                            <FileText size={32} className="text-red-500" />
                            <div>
                              <p className="font-medium text-gray-800">{prescriptionFile.name}</p>
                              <p className="text-sm text-gray-600">{(prescriptionFile.size / 1024).toFixed(2)} KB</p>
                            </div>
                          </div>
                        ) : (
                          <img 
                            src={prescriptionPreview} 
                            alt="Prescription preview" 
                            className="max-h-48 rounded-lg border border-gray-300 mx-auto"
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setPrescriptionFile(null);
                            setPrescriptionPreview('');
                          }}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={formData.preferredDate}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      name="preferredTime"
                      value={formData.preferredTime}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="col-span-2">
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
                  onClick={() => setShowCreateModal(false)}
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
                  {submitting ? 'Creating...' : 'Create Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Update Booking Status</h2>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedBooking(null);
                }}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Patient: <span className="font-medium text-gray-800">{selectedBooking.patientName}</span></p>
                <p className="text-sm text-gray-600">Current Status: <span className="font-medium text-gray-800">{selectedBooking.bookingStatus}</span></p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status <span className="text-red-500">*</span>
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedBooking(null);
                  }}
                  disabled={submitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Booking Notes</h2>
              <button
                onClick={() => {
                  setShowNotesModal(false);
                  setSelectedBooking(null);
                  setNotes('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Patient: <span className="font-medium text-gray-800">{selectedBooking.patientName}</span></p>
                <p className="text-sm text-gray-600">Booking ID: <span className="font-medium text-gray-800">{selectedBooking._id}</span></p>
              </div>
              
              {/* Show all existing notes */}
              {selectedBooking.notes && selectedBooking.notes.length > 0 && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Previous Notes ({selectedBooking.notes.length})</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedBooking.notes.map((note: any, index: number) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900 whitespace-pre-wrap mb-2">{note.text}</p>
                        <div className="flex items-center justify-between text-xs text-blue-600">
                          <span>By: {note.addedBy}</span>
                          <span>{new Date(note.addedAt).toLocaleString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Requirements (Patient)
                </label>
                <textarea
                  value={selectedBooking.additionalRequirements || 'No additional requirements'}
                  readOnly
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add New Note
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Add notes for internal reference..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none resize-none"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotesModal(false);
                    setSelectedBooking(null);
                    setNotes('');
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={async () => {
                    if (!notes.trim()) {
                      toast.error('Please enter a note');
                      return;
                    }
                    
                    setSubmitting(true);
                    try {
                      const response = await bookingAPI.addBookingNote(selectedBooking._id, notes.trim());
                      if (response.data.success) {
                        // Update Redux store with updated booking
                        dispatch(updateBooking(response.data.data));
                        toast.success('Note added successfully!');
                        setShowNotesModal(false);
                        setSelectedBooking(null);
                        setNotes('');
                      }
                    } catch (error: any) {
                      toast.error(error.response?.data?.message || 'Failed to add note');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting || !notes.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Service Detail Modal */}
      {showServiceDetailModal && selectedService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Service Details</h2>
              <button
                onClick={() => {
                  setShowServiceDetailModal(false);
                  setSelectedService(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Service Header */}
              <div className="bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] rounded-lg p-6 text-white">
                <h3 className="text-2xl font-bold mb-2">{selectedService.serviceName}</h3>
                <p className="text-white/90">{selectedService.description}</p>
              </div>

              {/* Service Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="font-semibold text-gray-800">{selectedService.category}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Base Price</p>
                  <p className="font-semibold text-[#63D64F] text-xl">₹{selectedService.basePrice}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-semibold text-gray-800">{selectedService.duration} minutes</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Service Type</p>
                  <p className="font-semibold text-gray-800">{selectedService.serviceType}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    selectedService.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedService.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Requirements */}
              {selectedService.requirements && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Requirements</h4>
                  <p className="text-gray-600 bg-gray-50 rounded-lg p-4">{selectedService.requirements}</p>
                </div>
              )}

              {/* Vendor Information */}
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-800 mb-4">Vendor Information</h4>
                {selectedService.vendorId ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-lg font-bold text-gray-800">{selectedService.vendorId.businessName}</p>
                        <p className="text-sm text-gray-600">{selectedService.vendorId.name}</p>
                      </div>
                      <div className="flex gap-2">
                        {selectedService.vendorId.isVerified && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Verified</span>
                        )}
                        {selectedService.vendorId.isActive && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Active</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="text-sm font-medium text-gray-800">{selectedService.vendorId.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600">Phone</p>
                        <p className="text-sm font-medium text-gray-800">{selectedService.vendorId.phone}</p>
                      </div>
                      {selectedService.vendorId.city && (
                        <div>
                          <p className="text-xs text-gray-600">City</p>
                          <p className="text-sm font-medium text-gray-800">{selectedService.vendorId.city}</p>
                        </div>
                      )}
                      {selectedService.vendorId.state && (
                        <div>
                          <p className="text-xs text-gray-600">State</p>
                          <p className="text-sm font-medium text-gray-800">{selectedService.vendorId.state}</p>
                        </div>
                      )}
                      {selectedService.vendorId.rating && (
                        <div>
                          <p className="text-xs text-gray-600">Rating</p>
                          <p className="text-sm font-medium text-gray-800">⭐ {selectedService.vendorId.rating}/5</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No vendor assigned</p>
                )}
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowServiceDetailModal(false);
                    setSelectedService(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleServiceToggle(selectedService);
                    setShowServiceDetailModal(false);
                    setSelectedService(null);
                    toast.success('Service added to selection!');
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Add to Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Prescription Modal */}
      {showPrescriptionModal && viewingPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Prescription History</h2>
                <p className="text-sm text-gray-600">Total: {viewingPrescription.prescriptions?.length || 0} prescription(s)</p>
              </div>
              <button
                onClick={() => {
                  setShowPrescriptionModal(false);
                  setViewingPrescription(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Patient Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Patient Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Name:</span>
                    <span className="ml-2 text-blue-900">{viewingPrescription.patientName}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Age/Gender:</span>
                    <span className="ml-2 text-blue-900">{viewingPrescription.age} years, {viewingPrescription.sex}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Email:</span>
                    <span className="ml-2 text-blue-900">{viewingPrescription.email}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Phone:</span>
                    <span className="ml-2 text-blue-900">{viewingPrescription.alternateMobile}</span>
                  </div>
                </div>
              </div>

              {/* All Prescriptions */}
              <div className="space-y-6">
                {viewingPrescription.prescriptions && viewingPrescription.prescriptions.length > 0 ? (
                  viewingPrescription.prescriptions.map((prescription: any, prescIndex: number) => (
                    <div key={prescIndex} className="border-2 border-gray-300 rounded-xl p-6 bg-gray-50">
                      {/* Prescription Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-300">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            Prescription #{viewingPrescription.prescriptions.length - prescIndex}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Added on {new Date(prescription.addedAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-xs text-gray-500">By: {prescription.addedBy}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          prescription.type === 'form' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        }`}>
                          {prescription.type === 'form' ? '📋 Form' : '📷 Image'}
                        </span>
                      </div>

                      {/* Prescription Content */}
                      {prescription.type === 'form' ? (
                        // Display Form Data
                        <div className="space-y-4">
                          {/* Doctor Information */}
                          {(prescription.doctorName || prescription.doctorRegistration || prescription.hospitalName) && (
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
                              <h4 className="font-bold text-lg mb-3">👨‍⚕️ Doctor Information</h4>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                {prescription.doctorName && (
                                  <div>
                                    <p className="opacity-90">Doctor Name</p>
                                    <p className="font-semibold text-lg">{prescription.doctorName}</p>
                                  </div>
                                )}
                                {prescription.doctorRegistration && (
                                  <div>
                                    <p className="opacity-90">Registration No.</p>
                                    <p className="font-semibold">{prescription.doctorRegistration}</p>
                                  </div>
                                )}
                                {prescription.hospitalName && (
                                  <div className="col-span-2">
                                    <p className="opacity-90">Hospital/Clinic</p>
                                    <p className="font-semibold">{prescription.hospitalName}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Clinical Details */}
                          {(prescription.patientComplaints || prescription.diagnosis) && (
                            <div className="grid grid-cols-2 gap-4">
                              {prescription.patientComplaints && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                  <h5 className="font-semibold text-yellow-900 mb-2">📋 Chief Complaints</h5>
                                  <p className="text-sm text-yellow-800 whitespace-pre-wrap">
                                    {prescription.patientComplaints}
                                  </p>
                                </div>
                              )}
                              {prescription.diagnosis && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                  <h5 className="font-semibold text-red-900 mb-2">🩺 Diagnosis</h5>
                                  <p className="text-sm text-red-800 whitespace-pre-wrap">
                                    {prescription.diagnosis}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Medications */}
                          {prescription.medications && prescription.medications.length > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h5 className="font-semibold text-green-900 mb-3">💊 Medications (Rx)</h5>
                              <div className="space-y-2">
                                {prescription.medications.map((med: any, medIndex: number) => (
                                  <div key={medIndex} className="bg-white rounded-lg p-3 border border-green-300">
                                    <p className="font-bold text-green-900">{medIndex + 1}. {med.name || 'N/A'}</p>
                                    <div className="grid grid-cols-3 gap-2 mt-1 text-sm">
                                      <div>
                                        <span className="text-green-700 font-medium">Dosage:</span>
                                        <span className="ml-1 text-green-900">{med.dosage || 'N/A'}</span>
                                      </div>
                                      <div>
                                        <span className="text-green-700 font-medium">Frequency:</span>
                                        <span className="ml-1 text-green-900">{med.frequency || 'N/A'}</span>
                                      </div>
                                      <div>
                                        <span className="text-green-700 font-medium">Duration:</span>
                                        <span className="ml-1 text-green-900">{med.duration || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Lab Tests & Instructions */}
                          {(prescription.labTests || prescription.specialInstructions) && (
                            <div className="grid grid-cols-2 gap-4">
                              {prescription.labTests && (
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                  <h5 className="font-semibold text-purple-900 mb-2">🔬 Lab Tests</h5>
                                  <p className="text-sm text-purple-800 whitespace-pre-wrap">
                                    {prescription.labTests}
                                  </p>
                                </div>
                              )}
                              {prescription.specialInstructions && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                  <h5 className="font-semibold text-orange-900 mb-2">📝 Instructions</h5>
                                  <p className="text-sm text-orange-800 whitespace-pre-wrap">
                                    {prescription.specialInstructions}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Follow-up Date */}
                          {prescription.followUpDate && (
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                              <h5 className="font-semibold text-indigo-900 mb-2">📅 Follow-up Date</h5>
                              <p className="text-lg font-bold text-indigo-900">
                                {new Date(prescription.followUpDate).toLocaleDateString('en-IN', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          )}

                          {/* Supporting Image */}
                          {prescription.supportingImageUrl && (
                            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                              <h5 className="font-semibold text-gray-900 mb-3">📎 Supporting Document</h5>
                              <img 
                                src={prescription.supportingImageUrl} 
                                alt="Supporting document" 
                                className="max-h-64 rounded-lg border border-gray-400 mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(prescription.supportingImageUrl, '_blank')}
                              />
                              <p className="text-xs text-gray-600 text-center mt-2">Click to view full size</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Display Image
                        <div className="bg-gray-100 rounded-lg p-4">
                          {prescription.imageUrl?.endsWith('.pdf') ? (
                            <div className="text-center">
                              <FileText size={64} className="mx-auto text-red-500 mb-4" />
                              <p className="text-gray-700 mb-4">PDF Document</p>
                              <button
                                onClick={() => window.open(prescription.imageUrl, '_blank')}
                                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                              >
                                Open PDF
                              </button>
                            </div>
                          ) : (
                            <div>
                              <img 
                                src={prescription.imageUrl} 
                                alt="Prescription" 
                                className="max-h-96 rounded-lg border border-gray-400 mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(prescription.imageUrl, '_blank')}
                              />
                              <p className="text-sm text-gray-600 text-center mt-3">Click image to view full size</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No prescriptions found</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowPrescriptionModal(false);
                    setViewingPrescription(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Upload Modal */}
      {showReportModal && selectedBookingForReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedBookingForReport.reports && selectedBookingForReport.reports.length > 0 
                  ? 'Add Another Report' 
                  : 'Upload Report'}
              </h2>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportFile(null);
                  setReportPreview('');
                  setSelectedBookingForReport(null);
                  setReportName('');
                  setReportType('general');
                }}
                disabled={uploadingReport}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Patient:</span> {selectedBookingForReport.patientName}
                </p>
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Booking ID:</span> {selectedBookingForReport._id}
                </p>
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Services:</span> {selectedBookingForReport.selectedServices.map((s: any) => s.serviceName).join(', ')}
                </p>
                {selectedBookingForReport.reports && selectedBookingForReport.reports.length > 0 && (
                  <p className="text-sm text-green-700 mt-2">
                    ✓ {selectedBookingForReport.reports.length} report(s) already uploaded
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="e.g., Blood Test Results, X-Ray Report"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                >
                  <option value="general">General Report</option>
                  <option value="lab">Lab Test Report</option>
                  <option value="imaging">Imaging Report (X-Ray, CT, MRI)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Report File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleReportFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Supported: JPG, PNG, GIF, PDF (Max 5MB)</p>
              </div>

              {reportPreview && (
                <div className="relative">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  {reportFile?.type === 'application/pdf' ? (
                    <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-3">
                      <FileText size={32} className="text-red-500" />
                      <div>
                        <p className="font-medium text-gray-800">{reportFile.name}</p>
                        <p className="text-sm text-gray-600">{(reportFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={reportPreview} 
                      alt="Report preview" 
                      className="max-h-64 rounded-lg border border-gray-300 mx-auto"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setReportFile(null);
                      setReportPreview('');
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

            </div>
            
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 flex-shrink-0 bg-white">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportFile(null);
                  setReportPreview('');
                  setSelectedBookingForReport(null);
                  setReportName('');
                  setReportType('general');
                }}
                disabled={uploadingReport}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadReport}
                disabled={!reportFile || !reportName.trim() || uploadingReport}
                className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {uploadingReport && <Loader2 size={18} className="animate-spin" />}
                {uploadingReport ? 'Uploading...' : 'Upload Report'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Reports Modal */}
      {showViewReportsModal && viewingReports && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
              <button
                onClick={() => {
                  setShowViewReportsModal(false);
                  setViewingReports(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Patient Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Patient Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Name:</span>
                    <span className="ml-2 text-blue-900">{viewingReports.patientName}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Age/Gender:</span>
                    <span className="ml-2 text-blue-900">{viewingReports.age} years, {viewingReports.sex}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Email:</span>
                    <span className="ml-2 text-blue-900">{viewingReports.email}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Phone:</span>
                    <span className="ml-2 text-blue-900">{viewingReports.alternateMobile}</span>
                  </div>
                </div>
              </div>

              {/* All Reports */}
              <div className="space-y-4">
                {viewingReports.reports && viewingReports.reports.length > 0 ? (
                  [...viewingReports.reports].reverse().map((report: any, reportIndex: number) => (
                    <div key={reportIndex} className="border-2 border-gray-300 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white hover:shadow-lg transition-shadow">
                      {/* Report Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-300">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <FileText size={20} className="text-green-600" />
                            {report.reportName || `Report #${viewingReports.reports.length - reportIndex}`}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Uploaded on {new Date(report.addedAt).toLocaleDateString('en-IN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          <p className="text-xs text-gray-500">By: {report.addedBy}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            report.reportType === 'lab' ? 'bg-purple-100 text-purple-700' :
                            report.reportType === 'imaging' ? 'bg-blue-100 text-blue-700' :
                            report.reportType === 'general' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {report.reportType === 'lab' ? '🔬 Lab Test' :
                             report.reportType === 'imaging' ? '📷 Imaging' :
                             report.reportType === 'general' ? '📄 General' :
                             '📋 Other'}
                          </span>
                          <button
                            onClick={() => window.open(report.reportUrl, '_blank')}
                            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                          >
                            <Download size={16} />
                            View/Download
                          </button>
                        </div>
                      </div>

                      {/* Report Preview */}
                      <div className="bg-gray-100 rounded-lg p-4">
                        {report.reportUrl?.endsWith('.pdf') ? (
                          <div className="text-center py-8">
                            <FileText size={64} className="mx-auto text-red-500 mb-4" />
                            <p className="text-gray-700 font-medium mb-2">PDF Document</p>
                            <p className="text-sm text-gray-600">{report.reportName}</p>
                          </div>
                        ) : (
                          <div>
                            <img 
                              src={report.reportUrl} 
                              alt={report.reportName || 'Report'} 
                              className="max-h-80 rounded-lg border border-gray-400 mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(report.reportUrl, '_blank')}
                            />
                            <p className="text-sm text-gray-600 text-center mt-3">Click image to view full size</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p>No reports found</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowViewReportsModal(false);
                    setViewingReports(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
