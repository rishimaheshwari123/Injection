import { useState } from 'react';
import { X, Loader2, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

interface AddPrescriptionModalProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (prescriptionData: any, prescriptionFile: File | null) => Promise<void>;
  booking: any;
}

const AddPrescriptionModal = ({ show, onClose, onSubmit, booking }: AddPrescriptionModalProps) => {
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
      
      setPrescriptionFile(file);
      
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
    setPrescriptionFile(null);
    setPrescriptionPreview('');
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
    onClose();
  };

  const handleSubmit = async () => {
    const hasFormData = prescriptionData.doctorName || 
                        prescriptionData.diagnosis || 
                        prescriptionData.medications.some(m => m.name);
    
    if (!hasFormData) {
      toast.error('Please fill at least some prescription details');
      return;
    }

    setUploading(true);
    try {
      await onSubmit(prescriptionData, prescriptionFile);
      resetAndClose();
    } finally {
      setUploading(false);
    }
  };

  if (!show || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">Add Prescription</h2>
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
              <span className="font-semibold">Patient:</span> {booking.patientName}
            </p>
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Booking ID:</span> {booking._id}
            </p>
          </div>

          {/* Prescription Form */}
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

            {/* Supporting Image Upload */}
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
              onClick={handleSubmit}
              disabled={uploading}
              className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {uploading && <Loader2 size={18} className="animate-spin" />}
              {uploading ? 'Adding...' : 'Add Prescription'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPrescriptionModal;
