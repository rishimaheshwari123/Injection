import { X } from 'lucide-react';
import { toast } from 'react-toastify';

interface ServiceDetailModalProps {
  show: boolean;
  onClose: () => void;
  service: any;
  onAddToBooking?: (service: any) => void;
}

const ServiceDetailModal = ({ show, onClose, service, onAddToBooking }: ServiceDetailModalProps) => {
  if (!show || !service) return null;

  const handleAddToBooking = () => {
    if (onAddToBooking) {
      onAddToBooking(service);
      toast.success('Service added to selection!');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Service Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Service Header */}
          <div className="bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] rounded-lg p-6 text-white">
            <h3 className="text-2xl font-bold mb-2">{service.serviceName}</h3>
            <p className="text-white/90">{service.description}</p>
          </div>

          {/* Service Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Category</p>
              <p className="font-semibold text-gray-800">{typeof service.category === 'object' ? (service.category?.name || "N/A") : (service.category || "N/A")}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Base Price</p>
              <p className="font-semibold text-[#63D64F] text-xl">₹{service.basePrice}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="font-semibold text-gray-800">{service.duration} minutes</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Service Type</p>
              <p className="font-semibold text-gray-800">{service.serviceType}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {service.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {/* Requirements */}
          {service.requirements && (
            <div className="border-t pt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Requirements</h4>
              <p className="text-gray-600 bg-gray-50 rounded-lg p-4">{service.requirements}</p>
            </div>
          )}

          {/* Vendor Information */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-4">Vendor Information</h4>
            {service.vendorId ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-lg font-bold text-gray-800">{service.vendorId.businessName}</p>
                    <p className="text-sm text-gray-600">{service.vendorId.name}</p>
                  </div>
                  <div className="flex gap-2">
                    {service.vendorId.isVerified && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Verified</span>
                    )}
                    {service.vendorId.isActive && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Active</span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-600">Email</p>
                    <p className="text-sm font-medium text-gray-800">{service.vendorId.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Phone</p>
                    <p className="text-sm font-medium text-gray-800">{service.vendorId.phone}</p>
                  </div>
                  {service.vendorId.city && (
                    <div>
                      <p className="text-xs text-gray-600">City</p>
                      <p className="text-sm font-medium text-gray-800">{service.vendorId.city}</p>
                    </div>
                  )}
                  {service.vendorId.state && (
                    <div>
                      <p className="text-xs text-gray-600">State</p>
                      <p className="text-sm font-medium text-gray-800">{service.vendorId.state}</p>
                    </div>
                  )}
                  {service.vendorId.rating && (
                    <div>
                      <p className="text-xs text-gray-600">Rating</p>
                      <p className="text-sm font-medium text-gray-800">⭐ {service.vendorId.rating}/5</p>
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
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {onAddToBooking && (
              <button
                onClick={handleAddToBooking}
                className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all"
              >
                Add to Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailModal;
