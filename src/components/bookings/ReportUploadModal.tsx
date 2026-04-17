import { useState } from 'react';
import { X, Loader2, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

interface ReportUploadModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (file: File, reportType: string, reportName: string) => Promise<void>;
  booking: any;
}

const ReportUploadModal = ({ show, onClose, onSubmit, booking }: ReportUploadModalProps) => {
  const [reportFile, setReportFile] = useState<File | null>(null);
  const [reportPreview, setReportPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [reportType, setReportType] = useState<'lab' | 'imaging' | 'general' | 'other'>('general');
  const [reportName, setReportName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload an image (JPG, PNG, GIF) or PDF file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      setReportFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setReportPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!reportFile) {
      toast.error('Please select a file');
      return;
    }

    if (!reportName.trim()) {
      toast.error('Please enter a report name');
      return;
    }

    setUploading(true);
    try {
      await onSubmit(reportFile, reportType, reportName);
      setReportFile(null);
      setReportPreview('');
      setReportName('');
      setReportType('general');
      onClose();
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setReportFile(null);
    setReportPreview('');
    setReportName('');
    setReportType('general');
    onClose();
  };

  if (!show || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Upload Report</h2>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Patient:</span> {booking.patientName}
            </p>
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Booking ID:</span> {booking._id}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              placeholder="e.g., Blood Test Report, X-Ray Report"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type <span className="text-red-500">*</span>
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
            >
              <option value="general">General</option>
              <option value="lab">Lab Report</option>
              <option value="imaging">Imaging (X-Ray, MRI, CT)</option>
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
              onChange={handleFileChange}
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

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={uploading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading || !reportFile || !reportName.trim()}
            className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {uploading && <Loader2 size={18} className="animate-spin" />}
            {uploading ? 'Uploading...' : 'Upload Report'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportUploadModal;
