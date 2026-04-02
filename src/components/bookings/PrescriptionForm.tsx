import { Plus, X, Upload, FileText } from 'lucide-react';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

interface PrescriptionFormProps {
  prescriptionData: {
    doctorName: string;
    doctorRegistration: string;
    hospitalName: string;
    patientComplaints: string;
    diagnosis: string;
    medications: Medication[];
    labTests: string;
    specialInstructions: string;
    followUpDate: string;
  };
  setPrescriptionData: (data: any) => void;
  prescriptionFile: File | null;
  setPrescriptionFile: (file: File | null) => void;
  prescriptionPreview: string;
  setPrescriptionPreview: (preview: string) => void;
}

export const PrescriptionForm = ({
  prescriptionData,
  setPrescriptionData,
  prescriptionFile,
  setPrescriptionFile,
  prescriptionPreview,
  setPrescriptionPreview
}: PrescriptionFormProps) => {
  const handlePrescriptionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPrescriptionData({
      ...prescriptionData,
      [e.target.name]: e.target.value
    });
  };

  const handleMedicationChange = (index: number, field: string, value: string) => {
    const updatedMedications = [...prescriptionData.medications];
    updatedMedications[index] = { ...updatedMedications[index], [field]: value };
    setPrescriptionData({ ...prescriptionData, medications: updatedMedications });
  };

  const addMedication = () => {
    setPrescriptionData({
      ...prescriptionData,
      medications: [...prescriptionData.medications, { name: '', dosage: '', frequency: '', duration: '' }]
    });
  };

  const removeMedication = (index: number) => {
    const updatedMedications = prescriptionData.medications.filter((_, i) => i !== index);
    setPrescriptionData({ ...prescriptionData, medications: updatedMedications });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPrescriptionFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPrescriptionPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="border-t pt-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Prescription Details (Optional)</h3>
      
      <div className="space-y-4">
        {/* Doctor Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name</label>
            <input
              type="text"
              name="doctorName"
              value={prescriptionData.doctorName}
              onChange={handlePrescriptionChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Registration Number</label>
            <input
              type="text"
              name="doctorRegistration"
              value={prescriptionData.doctorRegistration}
              onChange={handlePrescriptionChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hospital/Clinic Name</label>
          <input
            type="text"
            name="hospitalName"
            value={prescriptionData.hospitalName}
            onChange={handlePrescriptionChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
          />
        </div>

        {/* Patient Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Patient Complaints</label>
          <textarea
            name="patientComplaints"
            value={prescriptionData.patientComplaints}
            onChange={handlePrescriptionChange}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Diagnosis</label>
          <textarea
            name="diagnosis"
            value={prescriptionData.diagnosis}
            onChange={handlePrescriptionChange}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
          />
        </div>

        {/* Medications */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Medications</label>
            <button
              type="button"
              onClick={addMedication}
              className="flex items-center gap-1 text-sm text-[#63D64F] hover:text-[#3DB9A6]"
            >
              <Plus size={16} />
              Add Medication
            </button>
          </div>
          {prescriptionData.medications.map((med, index) => (
            <div key={index} className="grid grid-cols-5 gap-2 mb-2">
              <input
                type="text"
                placeholder="Medicine Name"
                value={med.name}
                onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="Dosage"
                value={med.dosage}
                onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
              />
              <input
                type="text"
                placeholder="Frequency"
                value={med.frequency}
                onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Days"
                  value={med.duration}
                  onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                />
                {prescriptionData.medications.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Lab Tests</label>
          <textarea
            name="labTests"
            value={prescriptionData.labTests}
            onChange={handlePrescriptionChange}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
          <textarea
            name="specialInstructions"
            value={prescriptionData.specialInstructions}
            onChange={handlePrescriptionChange}
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
          <input
            type="date"
            name="followUpDate"
            value={prescriptionData.followUpDate}
            onChange={handlePrescriptionChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
          />
        </div>

        {/* Supporting Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supporting Image (Optional)
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer">
              <Upload size={20} />
              Choose File
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {prescriptionFile && (
              <span className="text-sm text-gray-600">{prescriptionFile.name}</span>
            )}
          </div>

          {prescriptionPreview && (
            <div className="mt-4 relative">
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
                  alt="Prescription preview" 
                  className="max-h-48 rounded-lg border border-gray-300 mx-auto"
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
      </div>
    </div>
  );
};
