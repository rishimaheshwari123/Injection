import { useState, useEffect } from 'react';
import { X, Loader2, FileText } from 'lucide-react';

interface PrescriptionSummaryModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (summary: string) => Promise<void>;
  booking: any;
}

const PrescriptionSummaryModal = ({ show, onClose, onSubmit, booking }: PrescriptionSummaryModalProps) => {
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (booking) {
      setSummary(booking.prescriptionSummary || '');
    }
  }, [booking]);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit(summary.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!show || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in duration-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText className="text-[#3DB9A6]" size={22} />
            Prescription Summary
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Patient:</span> {booking.patientName}
            </p>
            <p className="text-sm text-blue-800 mt-1">
              <span className="font-semibold">Booking ID:</span> {booking._id}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Write/Edit Prescription Summary
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={6}
              placeholder="Enter prescription summary, diagnostic outcome, or follow-up details manually..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none resize-none text-sm transition-all"
            />
            <p className="text-xs text-gray-500 mt-1.5">
              This summary will be visible to both admin and vendors when viewing this booking or prescription.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] hover:from-[#52be3f] hover:to-[#339e8d] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 text-sm font-semibold"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Saving...' : 'Save Summary'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionSummaryModal;
