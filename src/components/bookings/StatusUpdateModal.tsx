import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface StatusUpdateModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (status: string) => Promise<void>;
  booking: any;
}

const StatusUpdateModal = ({ show, onClose, onSubmit, booking }: StatusUpdateModalProps) => {
  const [newStatus, setNewStatus] = useState(booking?.bookingStatus || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newStatus) return;
    
    setSubmitting(true);
    try {
      await onSubmit(newStatus);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!show || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Update Booking Status</h2>
          <button
            onClick={onClose}
            disabled={submitting}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Patient: <span className="font-medium text-gray-800">{booking.patientName}</span></p>
            <p className="text-sm text-gray-600">Current Status: <span className="font-medium text-gray-800">{booking.bookingStatus}</span></p>
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
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
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
  );
};

export default StatusUpdateModal;
