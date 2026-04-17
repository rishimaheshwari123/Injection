import { X, FileText } from 'lucide-react';

interface ViewPrescriptionModalProps {
  show: boolean;
  onClose: () => void;
  booking: any;
}

const ViewPrescriptionModal = ({ show, onClose, booking }: ViewPrescriptionModalProps) => {
  if (!show || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Prescription History</h2>
            <p className="text-sm text-gray-600">Total: {booking.prescriptions?.length || 0} prescription(s)</p>
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

          {/* All Prescriptions */}
          <div className="space-y-6">
            {booking.prescriptions && booking.prescriptions.length > 0 ? (
              booking.prescriptions.map((prescription: any, prescIndex: number) => (
                <div key={prescIndex} className="border-2 border-gray-300 rounded-xl p-6 bg-gray-50">
                  {/* Prescription Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-300">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">
                        Prescription #{booking.prescriptions.length - prescIndex}
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
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <h4 className="font-bold text-yellow-900 mb-3">🩺 Clinical Details</h4>
                          {prescription.patientComplaints && (
                            <div className="mb-3">
                              <p className="text-sm text-yellow-700 font-medium">Chief Complaints:</p>
                              <p className="text-yellow-900">{prescription.patientComplaints}</p>
                            </div>
                          )}
                          {prescription.diagnosis && (
                            <div>
                              <p className="text-sm text-yellow-700 font-medium">Diagnosis:</p>
                              <p className="text-yellow-900">{prescription.diagnosis}</p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Medications */}
                      {prescription.medications && prescription.medications.length > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-bold text-green-900 mb-3">💊 Medications (Rx)</h4>
                          <div className="space-y-3">
                            {prescription.medications.map((med: any, medIndex: number) => (
                              <div key={medIndex} className="bg-white rounded-lg p-3 border border-green-300">
                                <p className="font-semibold text-green-900">{medIndex + 1}. {med.name}</p>
                                <div className="grid grid-cols-3 gap-2 mt-2 text-sm text-green-800">
                                  {med.dosage && <p><span className="font-medium">Dosage:</span> {med.dosage}</p>}
                                  {med.frequency && <p><span className="font-medium">Frequency:</span> {med.frequency}</p>}
                                  {med.duration && <p><span className="font-medium">Duration:</span> {med.duration}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Lab Tests */}
                      {prescription.labTests && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h4 className="font-bold text-purple-900 mb-2">🔬 Lab Tests Recommended</h4>
                          <p className="text-purple-900">{prescription.labTests}</p>
                        </div>
                      )}

                      {/* Special Instructions */}
                      {prescription.specialInstructions && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                          <h4 className="font-bold text-orange-900 mb-2">⚠️ Special Instructions</h4>
                          <p className="text-orange-900">{prescription.specialInstructions}</p>
                        </div>
                      )}

                      {/* Follow-up Date */}
                      {prescription.followUpDate && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                          <h4 className="font-bold text-indigo-900 mb-2">📅 Follow-up Date</h4>
                          <p className="text-indigo-900">{new Date(prescription.followUpDate).toLocaleDateString('en-IN')}</p>
                        </div>
                      )}

                      {/* Supporting Image */}
                      {prescription.supportingImageUrl && (
                        <div className="border-t pt-4">
                          <h4 className="font-semibold text-gray-800 mb-3">📎 Supporting Document</h4>
                          <img 
                            src={prescription.supportingImageUrl} 
                            alt="Supporting document" 
                            className="max-h-96 rounded-lg border border-gray-300 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(prescription.supportingImageUrl, '_blank')}
                          />
                          <p className="text-sm text-gray-600 text-center mt-2">Click to view full size</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Display Image Prescription
                    <div className="text-center">
                      {prescription.imageUrl?.endsWith('.pdf') ? (
                        <div>
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
                            className="max-h-96 rounded-lg border border-gray-300 mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(prescription.imageUrl, '_blank')}
                          />
                          <p className="text-sm text-gray-600 mt-3">Click image to view full size</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                <p className="text-gray-600">No prescriptions available</p>
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

export default ViewPrescriptionModal;
