import { useEffect, useState } from 'react';
import { Search, Upload, Eye, FileText, X, Loader2 } from 'lucide-react';
import { bookingAPI, reportAPI } from '../../services/api';
import { toast } from 'react-toastify';

const ReportsPage = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'with' | 'without'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportPreview, setReportPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [reportType, setReportType] = useState<'lab' | 'imaging' | 'general' | 'other'>('general');
  const [reportName, setReportName] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await bookingAPI.getAllBookings();
      if (response.data.success) {
        setBookings(response.data.data);
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
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size should be less than 10MB');
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

  const resetAndClose = () => {
    setShowUploadModal(false);
    setReportFile(null);
    setReportPreview('');
    setSelectedBooking(null);
    setReportType('general');
    setReportName('');
  };

  const handleUpload = async () => {
    if (!selectedBooking) return;

    if (!reportFile) {
      toast.error('Please select a report file to upload');
      return;
    }

    if (!reportName.trim()) {
      toast.error('Please enter a report name');
      return;
    }

    setUploading(true);
    try {
      console.log('Uploading report...', reportFile.name);
      
      // Upload file to Cloudinary using prescription API (same endpoint)
      const formData = new FormData();
      formData.append('image', reportFile);
      
      const uploadResponse = await fetch('http://localhost:8080/api/prescriptions/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      const uploadData = await uploadResponse.json();
      console.log('Upload response:', uploadData);
      
      if (uploadData.success) {
        // Save report with URL
        await reportAPI.uploadReport(
          selectedBooking._id,
          uploadData.data.url,
          reportType,
          reportName
        );
        toast.success('Report uploaded successfully!');
        resetAndClose();
        fetchBookings();
      } else {
        toast.error('Failed to upload report: ' + uploadData.message);
      }
    } catch (error: any) {
      console.error('Error uploading report:', error);
      toast.error('Failed to upload report: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleViewReports = (booking: any) => {
    setSelectedBooking(booking);
    setShowViewModal(true);
  };

  const filteredBookings = bookings.filter((booking: any) => {
    const matchesSearch = 
      booking.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking._id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ? true :
      filterStatus === 'with' ? (booking.reports && booking.reports.length > 0) :
      !(booking.reports && booking.reports.length > 0);
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getReportTypeBadge = (type: string) => {
    const badges = {
      lab: 'bg-purple-100 text-purple-700',
      imaging: 'bg-blue-100 text-blue-700',
      general: 'bg-green-100 text-green-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return badges[type as keyof typeof badges] || badges.other;
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Reports Management</h1>
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
            <option value="with">With Reports</option>
            <option value="without">Without Reports</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-800">{bookings.length}</p>
            </div>
            <FileText size={40} className="text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">With Reports</p>
              <p className="text-3xl font-bold text-green-600">
                {bookings.filter(b => b.reports && b.reports.length > 0).length}
              </p>
            </div>
            <Upload size={40} className="text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Without Reports</p>
              <p className="text-3xl font-bold text-orange-600">
                {bookings.filter(b => !(b.reports && b.reports.length > 0)).length}
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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Reports</th>
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
                    {booking.reports && booking.reports.length > 0 ? (
                      <span className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <FileText size={16} />
                        {booking.reports.length} report(s)
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">Not uploaded</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {booking.reports && booking.reports.length > 0 ? (
                        <>
                          <button
                            onClick={() => handleViewReports(booking)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Reports"
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

      {!loading && filteredBookings.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No bookings found</p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {selectedBooking.reports && selectedBooking.reports.length > 0 
                  ? 'Add Another Report' 
                  : 'Upload Report'}
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
                {selectedBooking.reports && selectedBooking.reports.length > 0 && (
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Existing Reports:</span> {selectedBooking.reports.length}
                  </p>
                )}
              </div>

              {/* Report Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="e.g., Blood Test Report, X-Ray Chest"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                />
              </div>

              {/* Report Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                >
                  <option value="general">General Report</option>
                  <option value="lab">Lab Test</option>
                  <option value="imaging">Imaging (X-Ray, CT, MRI)</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Report File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Supported: JPG, PNG, GIF, PDF (Max 10MB)</p>
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
                  disabled={uploading || !reportFile || !reportName.trim()}
                  className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading && <Loader2 size={18} className="animate-spin" />}
                  {uploading ? 'Uploading...' : 'Upload Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Reports Modal */}
      {showViewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
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

              {/* All Reports */}
              <div className="space-y-4">
                {selectedBooking.reports && selectedBooking.reports.length > 0 ? (
                  [...selectedBooking.reports].reverse().map((report: any, index: number) => (
                    <div key={index} className="border-2 border-gray-300 rounded-xl p-6 bg-gray-50">
                      {/* Report Header */}
                      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-300">
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{report.reportName}</h3>
                          <p className="text-sm text-gray-600">
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
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getReportTypeBadge(report.reportType)}`}>
                          {report.reportType === 'lab' ? '🔬 Lab Test' :
                           report.reportType === 'imaging' ? '📷 Imaging' :
                           report.reportType === 'general' ? '📄 General' :
                           '📋 Other'}
                        </span>
                      </div>

                      {/* Report Content */}
                      <div className="bg-gray-100 rounded-lg p-4">
                        {report.reportUrl?.endsWith('.pdf') ? (
                          <div className="text-center">
                            <FileText size={64} className="mx-auto text-red-500 mb-4" />
                            <p className="text-gray-700 mb-4">PDF Document</p>
                            <button
                              onClick={() => window.open(report.reportUrl, '_blank')}
                              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              Open PDF
                            </button>
                          </div>
                        ) : (
                          <div>
                            <img 
                              src={report.reportUrl} 
                              alt={report.reportName} 
                              className="max-h-96 rounded-lg border border-gray-400 mx-auto cursor-pointer hover:opacity-90 transition-opacity"
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

export default ReportsPage;
