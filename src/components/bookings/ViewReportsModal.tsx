import { X, FileText } from 'lucide-react';

interface ViewReportsModalProps {
  show: boolean;
  onClose: () => void;
  booking: any;
}

const ViewReportsModal = ({ show, onClose, booking }: ViewReportsModalProps) => {
  if (!show || !booking) return null;

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
      'lab': 'bg-blue-100 text-blue-700',
      'imaging': 'bg-purple-100 text-purple-700',
      'general': 'bg-green-100 text-green-700',
      'other': 'bg-gray-100 text-gray-700'
    };
    return badges[type as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
            <p className="text-sm text-gray-600">Total: {booking.reports?.length || 0} report(s)</p>
          </div>
          <button
            onClick={onClose}
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
                <span className="ml-2 text-blue-900">{booking.patientName}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Age/Gender:</span>
                <span className="ml-2 text-blue-900">{booking.age} years, {booking.sex}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Email:</span>
                <span className="ml-2 text-blue-900">{booking.email}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Phone:</span>
                <span className="ml-2 text-blue-900">{booking.alternateMobile}</span>
              </div>
            </div>
          </div>

          {/* All Reports */}
          <div className="space-y-4">
            {booking.reports && booking.reports.length > 0 ? (
              booking.reports.map((report: any, index: number) => (
                <div key={index} className="border-2 border-gray-300 rounded-xl p-6 bg-gray-50 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          {report.reportName || `Report #${index + 1}`}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getReportTypeBadge(report.reportType)}`}>
                          {report.reportType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Uploaded on {formatDate(report.addedAt)}
                      </p>
                      <p className="text-xs text-gray-500">By: {report.addedBy}</p>
                    </div>
                    <button
                      onClick={() => window.open(report.reportUrl, '_blank')}
                      className="px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      <FileText size={16} />
                      View Report
                    </button>
                  </div>

                  {/* Report Preview */}
                  <div className="mt-4 border-t border-gray-300 pt-4">
                    {report.reportUrl?.endsWith('.pdf') ? (
                      <div className="bg-gray-100 rounded-lg p-6 text-center">
                        <FileText size={48} className="mx-auto text-red-500 mb-3" />
                        <p className="text-gray-700 font-medium">PDF Document</p>
                        <p className="text-sm text-gray-600 mt-1">Click "View Report" to open</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <img 
                          src={report.reportUrl} 
                          alt={report.reportName || 'Report'} 
                          className="max-h-64 rounded-lg border border-gray-300 mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(report.reportUrl, '_blank')}
                        />
                        <p className="text-sm text-gray-600 mt-2">Click image to view full size</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : booking.reportUrl ? (
              // Legacy single report
              <div className="border-2 border-gray-300 rounded-xl p-6 bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Report</h3>
                    <p className="text-sm text-gray-600">
                      Generated on {booking.reportGeneratedAt ? formatDate(booking.reportGeneratedAt) : 'N/A'}
                    </p>
                  </div>
                  <button
                    onClick={() => window.open(booking.reportUrl, '_blank')}
                    className="px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                  >
                    <FileText size={16} />
                    View Report
                  </button>
                </div>
                <div className="mt-4 border-t border-gray-300 pt-4">
                  {booking.reportUrl?.endsWith('.pdf') ? (
                    <div className="bg-gray-100 rounded-lg p-6 text-center">
                      <FileText size={48} className="mx-auto text-red-500 mb-3" />
                      <p className="text-gray-700 font-medium">PDF Document</p>
                    </div>
                  ) : (
                    <img 
                      src={booking.reportUrl} 
                      alt="Report" 
                      className="max-h-64 rounded-lg border border-gray-300 mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(booking.reportUrl, '_blank')}
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">No reports available</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewReportsModal;
