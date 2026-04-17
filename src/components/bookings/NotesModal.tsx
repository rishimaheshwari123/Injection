import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface NotesModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (note: string) => Promise<void>;
  booking: any;
}

const NotesModal = ({ show, onClose, onSubmit, booking }: NotesModalProps) => {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!notes.trim()) return;
    
    setSubmitting(true);
    try {
      await onSubmit(notes.trim());
      setNotes('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!show || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Booking Notes</h2>
          <button
            onClick={() => {
              setNotes('');
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Patient: <span className="font-medium text-gray-800">{booking.patientName}</span></p>
            <p className="text-sm text-gray-600">Booking ID: <span className="font-medium text-gray-800">{booking._id}</span></p>
          </div>
          
          {/* Show all existing notes */}
          {booking.notes && booking.notes.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-3">Previous Notes ({booking.notes.length})</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {booking.notes.map((note: any, index: number) => (
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
              value={booking.additionalRequirements || 'No additional requirements'}
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
                setNotes('');
                onClose();
              }}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSubmit}
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
  );
};

export default NotesModal;
