import { useEffect, useState } from 'react';
import { Search, Upload, Eye, FileText, X, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { bookingAPI, prescriptionAPI } from '../../services/api';
import { toast } from 'react-toastify';

const PrescriptionsPage = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with' | 'without'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionPreview, setPrescriptionPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
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
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [summaryInput, setSummaryInput] = useState('');
  const [savingSummary, setSavingSummary] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [customLimit, setCustomLimit] = useState("");
  const [stats, setStats] = useState({
    totalBookings: 0,
    withPrescription: 0,
    withoutPrescription: 0,
  });

  useEffect(() => {
    fetchBookings();
  }, [currentPage, limit, filterStatus]);

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

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit,
        search: searchTerm,
        prescriptionStatus: filterStatus,
      };
      const response = await bookingAPI.getAllBookings(params);
      if (response.data.success) {
        setBookings(response.data.data);
        setTotalPages(response.data.totalPages || 1);
        setTotalBookings(response.data.totalBookings || response.data.data.length);
        if (response.data.stats) {
          setStats(response.data.stats);
        }
      }
    } catch (error: any) {
      toast.error('Failed to fetch bookings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const resetAndClose = () => {
    setShowUploadModal(false);
    setPrescriptionFile(null);
    setPrescriptionPreview('');
    setSelectedBooking(null);
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
  };

  const handleUpload = async () => {
    if (!selectedBooking) return;

    // Check if any prescription data is filled
    const hasFormData = prescriptionData.doctorName || 
                        prescriptionData.diagnosis || 
                        prescriptionData.medications.some(m => m.name);
    
    if (!hasFormData) {
      toast.error('Please fill at least some prescription details');
      return;
    }

    setUploading(true);
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
              selectedBooking._id,
              {
                ...prescriptionData,
                supportingImageUrl: uploadResponse.data.data.url
              },
              'form'
            );
            toast.success('Prescription added with form and image!');
          } else {
            console.error('Image upload failed:', uploadResponse.data);
            // Save form data without image
            await bookingAPI.updatePrescription(selectedBooking._id, prescriptionData, 'form');
            toast.warning('Prescription added with form (image upload failed)');
          }
        } catch (error: any) {
          console.error('Error uploading prescription image:', error);
          console.error('Error response:', error.response?.data);
          // Save form data without image
          await bookingAPI.updatePrescription(selectedBooking._id, prescriptionData, 'form');
          toast.warning(`Prescription added with form (image upload error: ${error.response?.data?.message || error.message})`);
        }
      } else {
        // Save form data only
        await bookingAPI.updatePrescription(selectedBooking._id, prescriptionData, 'form');
        toast.success('Prescription added successfully!');
      }
      
      resetAndClose();
      fetchBookings();
    } catch (error: any) {
      console.error('Error saving prescription:', error);
      toast.error('Failed to add prescription: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleViewPrescription = (booking: any) => {
    setSelectedBooking(booking);
    setSummaryInput(booking.prescriptionSummary || '');
    setIsEditingSummary(false);
    setShowViewModal(true);
  };

  const handleSaveSummary = async () => {
    if (!selectedBooking) return;
    setSavingSummary(true);
    try {
      const response = await bookingAPI.updatePrescriptionSummary(selectedBooking._id, summaryInput);
      if (response.data.success) {
        toast.success("Prescription summary updated successfully!");
        setBookings(prev => prev.map(b => b._id === selectedBooking._id ? response.data.data : b));
        setSelectedBooking(response.data.data);
        setIsEditingSummary(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update prescription summary");
    } finally {
      setSavingSummary(false);
    }
  };

  const filteredBookings = bookings;

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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Prescriptions Management</h1>
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
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
          >
            <option value="all">All Bookings</option>
            <option value="with">With Prescription</option>
            <option value="without">Without Prescription</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-800">{stats.totalBookings}</p>
            </div>
            <FileText size={40} className="text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">With Prescription</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.withPrescription}
              </p>
            </div>
            <Upload size={40} className="text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Without Prescription</p>
              <p className="text-3xl font-bold text-orange-600">
                {stats.withoutPrescription}
              </p>
            </div>
            <FileText size={40} className="text-orange-500" />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#63D64F]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Booking ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Patient</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Services</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Prescription</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking: any) => (
                <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-mono text-gray-600">{booking._id.slice(-8)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{booking.patientName}</p>
                      <p className="text-sm text-gray-600">{booking.email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">
                      {booking.selectedServices.length} service(s)
                    </p>
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
                  </td>
                  <td className="px-6 py-4">
                    {booking.prescriptions && booking.prescriptions.length > 0 ? (
                      <span className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <FileText size={16} />
                        {booking.prescriptions.length} prescription(s)
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Not uploaded</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {booking.prescriptions && booking.prescriptions.length > 0 ? (
                        <>
                          <button
                            onClick={() => handleViewPrescription(booking)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Prescriptions"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowUploadModal(true);
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Add More"
                          >
                            <Upload size={18} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowUploadModal(true);
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all"
                        >
                          <Upload size={16} />
                          Upload
                        </button>
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
        <div className="mt-6 flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-xl shadow-md gap-4 mb-6">
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
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNum
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

      {!loading && filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No bookings found</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedBooking.prescriptions && selectedBooking.prescriptions.length > 0 
                  ? 'Add Another Prescription' 
                  : 'Upload Prescription'}
              </h2>
              <button
                onClick={resetAndClose}
                disabled={uploading}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Patient:</span> {selectedBooking.patientName}
                </p>
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Booking ID:</span> {selectedBooking._id}
                </p>
                {selectedBooking.prescriptions && selectedBooking.prescriptions.length > 0 && (
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Existing Prescriptions:</span> {selectedBooking.prescriptions.length}
                  </p>
                )}
              </div>

              {/* Prescription Form - Always Visible */}
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
                      Lab Tests
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
                      placeholder="Take medicine after meals, avoid cold drinks..."
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>

                  {/* Supporting Image Upload - At the End */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Supporting Image (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Upload supporting image if needed (JPG, PNG, GIF, PDF - Max 5MB)</p>
                  </div>

                  {prescriptionPreview && (
                    <div className="relative">
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
                          alt="Supporting document preview" 
                          className="max-h-64 rounded-lg border border-gray-300 mx-auto"
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

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={resetAndClose}
                  disabled={uploading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading && <Loader2 size={18} className="animate-spin" />}
                  {uploading ? 'Uploading...' : 'Add Prescription'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Prescription Modal */}
      {showViewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">Prescription Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedBooking(null);
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
                    <span className="ml-2 text-blue-900">{selectedBooking.patientName}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Age/Gender:</span>
                    <span className="ml-2 text-blue-900">{selectedBooking.age} years, {selectedBooking.sex}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Email:</span>
                    <span className="ml-2 text-blue-900">{selectedBooking.email}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Phone:</span>
                    <span className="ml-2 text-blue-900">{selectedBooking.alternateMobile}</span>
                  </div>
                </div>
              </div>

              {/* Prescription Summary */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-green-900 flex items-center gap-1.5">
                    <FileText size={16} />
                    Prescription Summary
                  </h3>
                  <button
                    onClick={() => setIsEditingSummary(!isEditingSummary)}
                    className="text-xs px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    {isEditingSummary ? 'Cancel' : 'Edit Summary'}
                  </button>
                </div>
                {isEditingSummary ? (
                  <div className="space-y-2">
                    <textarea
                      value={summaryInput}
                      onChange={(e) => setSummaryInput(e.target.value)}
                      placeholder="Enter prescription summary..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none text-sm resize-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveSummary}
                        disabled={savingSummary}
                        className="px-4 py-1.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all flex items-center gap-1.5"
                      >
                        {savingSummary && <Loader2 size={12} className="animate-spin" />}
                        Save Summary
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-green-800 whitespace-pre-wrap">
                    {selectedBooking.prescriptionSummary || 'No prescription summary manually added yet.'}
                  </p>
                )}
              </div>

              {/* All Prescriptions */}
              <div className="space-y-6">
                {selectedBooking.prescriptions && selectedBooking.prescriptions.length > 0 ? (
                  [...selectedBooking.prescriptions].reverse().map((prescription: any, prescIndex: number) => (
                    <div key={prescIndex} className="border-2 border-gray-300 rounded-xl p-6 bg-gray-50">
                      {/* Prescription Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-300">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">
                            Prescription #{selectedBooking.prescriptions.length - prescIndex}
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
                    setShowViewModal(false);
                    setSelectedBooking(null);
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

export default PrescriptionsPage;
