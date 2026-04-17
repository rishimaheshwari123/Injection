import { useState } from 'react';
import { X, Loader2, Calendar, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

interface RescheduleBookingModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (newDate: string, newTime: string, reason: string) => Promise<void>;
  booking: any;
}

const RescheduleBookingModal = ({ show, onClose, onSubmit, booking }: RescheduleBookingModalProps) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newDate) {
      toast.error('Please select a new date');
      return;
    }

    if (!newTime) {
      toast.error('Please select a new time');
      return;
    }

    if (!reason.trim()) {
      toast.error('Please provide a reason for rescheduling');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(newDate, newTime, reason);
      setNewDate('');
      setNewTime('');
      setReason('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setNewDate('');
    setNewTime('');
    setReason('');
    onClose();
  };

  // Parse current booking date/time
  const getCurrentDateTime = () => {
    if (booking?.preferredTimeSlot) {
      const [datePart, timePart] = booking.preferredTimeSlot.split(' ');
      
      if (datePart && timePart) {
        // Format date as "17 April 2026"
        const date = new Date(datePart);
        const formattedDate = date.toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
        
        // Convert time to 12-hour format with AM/PM
        const [hours, minutes] = timePart.split(':');
        const hour = parseInt(hours, 10);
        const period = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        const formattedTime = `${hour12}:${minutes} ${period}`;
        
        return { date: formattedDate, time: formattedTime };
      }
    }
    return { date: 'N/A', time: 'N/A' };
  };

  // Format new date for preview
  const formatNewDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format new time for preview
  const formatNewTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${period}`;
  };

  if (!show || !booking) return null;

  const currentDateTime = getCurrentDateTime();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Reschedule Booking</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={submitting}
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
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Booking ID:</span> {booking._id}
            </p>
          </div>

          {/* Current Date & Time */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">CURRENT SCHEDULE</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-800">{currentDateTime.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-800">{currentDateTime.time}</span>
              </div>
            </div>
          </div>

          {/* New Date & Time */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-600">NEW SCHEDULE</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Rescheduling <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for rescheduling..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              This reason will be recorded and visible to all parties.
            </p>
          </div>

          {/* Preview */}
          {newDate && newTime && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-xs font-semibold text-green-700 mb-2">✓ NEW SCHEDULE PREVIEW</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">{formatNewDate(newDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-green-600" />
                  <span className="text-sm font-medium text-green-800">{formatNewTime(newTime)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            disabled={submitting}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !newDate || !newTime || !reason.trim()}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && <Loader2 size={18} className="animate-spin" />}
            {submitting ? 'Rescheduling...' : 'Reschedule Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RescheduleBookingModal;
