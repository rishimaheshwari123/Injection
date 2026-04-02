import { useEffect, useState } from 'react';
import { Search, Plus, Edit2, Trash2, Eye, X, Loader2, FileText } from 'lucide-react';
import { labPartnerAPI } from '../../services/api';
import { toast } from 'react-toastify';

const LabPartnersPage = () => {
  const [labPartners, setLabPartners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [viewingEntry, setViewingEntry] = useState<any>(null);
  const [uploadingEntry, setUploadingEntry] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resultFile, setResultFile] = useState<File | null>(null);
  const [resultPreview, setResultPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    labName: '',
    labAddress: '',
    labContact: '',
    labEmail: '',
    patientName: '',
    patientAge: '',
    patientGender: 'Male',
    patientContact: '',
    testType: '',
    sampleType: '',
    sampleCollectionDate: '',
    sampleSentDate: '',
    expectedResultDate: '',
    status: 'Sent to Lab',
    urgency: 'Normal',
    cost: '',
    remarks: ''
  });

  useEffect(() => {
    fetchLabPartners();
  }, []);

  const fetchLabPartners = async () => {
    setLoading(true);
    try {
      const response = await labPartnerAPI.getAllLabPartners();
      if (response.data.success) {
        setLabPartners(response.data.data);
      }
    } catch (error: any) {
      toast.error('Failed to fetch lab partners');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const resetForm = () => {
    setFormData({
      labName: '',
      labAddress: '',
      labContact: '',
      labEmail: '',
      patientName: '',
      patientAge: '',
      patientGender: 'Male',
      patientContact: '',
      testType: '',
      sampleType: '',
      sampleCollectionDate: '',
      sampleSentDate: '',
      expectedResultDate: '',
      status: 'Sent to Lab',
      urgency: 'Normal',
      cost: '',
      remarks: ''
    });
    setEditingEntry(null);
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingEntry) {
        const response = await labPartnerAPI.updateLabPartner(editingEntry._id, formData);
        if (response.data.success) {
          toast.success('Lab partner entry updated successfully!');
          await fetchLabPartners();
          resetForm();
        }
      } else {
        const response = await labPartnerAPI.createLabPartner(formData);
        if (response.data.success) {
          toast.success('Lab partner entry created successfully!');
          await fetchLabPartners();
          resetForm();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (entry: any) => {
    setEditingEntry(entry);
    setFormData({
      labName: entry.labName,
      labAddress: entry.labAddress,
      labContact: entry.labContact,
      labEmail: entry.labEmail || '',
      patientName: entry.patientName,
      patientAge: entry.patientAge.toString(),
      patientGender: entry.patientGender,
      patientContact: entry.patientContact,
      testType: entry.testType,
      sampleType: entry.sampleType,
      sampleCollectionDate: entry.sampleCollectionDate.split('T')[0],
      sampleSentDate: entry.sampleSentDate.split('T')[0],
      expectedResultDate: entry.expectedResultDate ? entry.expectedResultDate.split('T')[0] : '',
      status: entry.status,
      urgency: entry.urgency,
      cost: entry.cost.toString(),
      remarks: entry.remarks || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await labPartnerAPI.deleteLabPartner(id);
      if (response.data.success) {
        toast.success('Entry deleted successfully!');
        await fetchLabPartners();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete entry');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResultFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setResultPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadResult = async () => {
    if (!resultFile || !uploadingEntry) return;

    setUploading(true);
    try {
      const response = await labPartnerAPI.uploadResult(uploadingEntry._id, resultFile);
      if (response.data.success) {
        toast.success('Result uploaded successfully!');
        await fetchLabPartners();
        setShowUploadModal(false);
        setUploadingEntry(null);
        setResultFile(null);
        setResultPreview('');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload result');
    } finally {
      setUploading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await labPartnerAPI.updateStatus(id, newStatus);
      if (response.data.success) {
        toast.success('Status updated successfully!');
        await fetchLabPartners();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredEntries = labPartners.filter((entry: any) => {
    const matchesSearch = 
      entry.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.labName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.testType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' ? true : entry.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'Sent to Lab': 'bg-blue-100 text-blue-700',
      'In Progress': 'bg-yellow-100 text-yellow-700',
      'Completed': 'bg-green-100 text-green-700',
      'Cancelled': 'bg-red-100 text-red-700'
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  const getUrgencyBadge = (urgency: string) => {
    const badges = {
      'Normal': 'bg-gray-100 text-gray-700',
      'Urgent': 'bg-orange-100 text-orange-700',
      'Critical': 'bg-red-100 text-red-700'
    };
    return badges[urgency as keyof typeof badges] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Lab Partners Management</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus size={20} />
          Add New Entry
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by patient, lab, or test type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none w-full"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
        >
          <option value="all">All Status</option>
          <option value="Sent to Lab">Sent to Lab</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm">Total Entries</p>
          <p className="text-3xl font-bold text-gray-800">{labPartners.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm">Sent to Lab</p>
          <p className="text-3xl font-bold text-blue-600">
            {labPartners.filter(e => e.status === 'Sent to Lab').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm">In Progress</p>
          <p className="text-3xl font-bold text-yellow-600">
            {labPartners.filter(e => e.status === 'In Progress').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-3xl font-bold text-green-600">
            {labPartners.filter(e => e.status === 'Completed').length}
          </p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#63D64F]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Patient</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Lab Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Test Type</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sent Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Urgency</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Result</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEntries.map((entry: any) => (
                <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{entry.patientName}</p>
                      <p className="text-sm text-gray-600">{entry.patientAge}Y, {entry.patientGender}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">{entry.labName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">{entry.testType}</p>
                    <p className="text-xs text-gray-500">{entry.sampleType}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-700">{formatDate(entry.sampleSentDate)}</p>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={entry.status}
                      onChange={(e) => handleStatusChange(entry._id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(entry.status)} border-0 cursor-pointer`}
                    >
                      <option value="Sent to Lab">Sent to Lab</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyBadge(entry.urgency)}`}>
                      {entry.urgency}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {entry.resultReceived ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => window.open(entry.resultUrl, '_blank')}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          View Result
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          onClick={() => {
                            setUploadingEntry(entry);
                            setShowUploadModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Replace
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setUploadingEntry(entry);
                          setShowUploadModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Upload
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setViewingEntry(entry);
                          setShowViewModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleEdit(entry)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(entry._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredEntries.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No entries found</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-800">
                {editingEntry ? 'Edit Lab Partner Entry' : 'Add New Lab Partner Entry'}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Lab Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Lab Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lab Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="labName"
                      value={formData.labName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lab Contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="labContact"
                      value={formData.labContact}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lab Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="labAddress"
                      value={formData.labAddress}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lab Email
                    </label>
                    <input
                      type="email"
                      name="labEmail"
                      value={formData.labEmail}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Patient Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Patient Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="patientName"
                      value={formData.patientName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patient Contact <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="patientContact"
                      value={formData.patientContact}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="patientAge"
                      value={formData.patientAge}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="patientGender"
                      value={formData.patientGender}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Test Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Test Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="testType"
                      value={formData.testType}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Blood Test, Urine Test"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sample Type <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="sampleType"
                      value={formData.sampleType}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Blood, Urine, Tissue"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sample Collection Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="sampleCollectionDate"
                      value={formData.sampleCollectionDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sample Sent Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="sampleSentDate"
                      value={formData.sampleSentDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Result Date
                    </label>
                    <input
                      type="date"
                      name="expectedResultDate"
                      value={formData.expectedResultDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    >
                      <option value="Sent to Lab">Sent to Lab</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Urgency
                    </label>
                    <select
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    >
                      <option value="Normal">Normal</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost (₹)
                    </label>
                    <input
                      type="number"
                      name="cost"
                      value={formData.cost}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? 'Saving...' : editingEntry ? 'Update Entry' : 'Create Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Result Modal */}
      {showUploadModal && uploadingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Upload Result</h2>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadingEntry(null);
                  setResultFile(null);
                  setResultPreview('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Patient:</span> {uploadingEntry.patientName}
                </p>
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Test:</span> {uploadingEntry.testType}
                </p>
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">Lab:</span> {uploadingEntry.labName}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Result File <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Supported: JPG, PNG, GIF, PDF (Max 10MB)</p>
              </div>

              {resultPreview && (
                <div className="relative">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  {resultFile?.type === 'application/pdf' ? (
                    <div className="bg-gray-100 rounded-lg p-4 flex items-center gap-3">
                      <FileText size={32} className="text-red-500" />
                      <div>
                        <p className="font-medium text-gray-800">{resultFile.name}</p>
                        <p className="text-sm text-gray-600">{(resultFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                  ) : (
                    <img 
                      src={resultPreview} 
                      alt="Result preview" 
                      className="max-h-64 rounded-lg border border-gray-300 mx-auto"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setResultFile(null);
                      setResultPreview('');
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadingEntry(null);
                    setResultFile(null);
                    setResultPreview('');
                  }}
                  disabled={uploading}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUploadResult}
                  disabled={uploading || !resultFile}
                  className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {uploading && <Loader2 size={18} className="animate-spin" />}
                  {uploading ? 'Uploading...' : 'Upload Result'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewModal && viewingEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">Lab Partner Entry Details</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewingEntry(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Lab Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-3">Lab Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Lab Name:</span>
                    <span className="ml-2 text-blue-900">{viewingEntry.labName}</span>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Contact:</span>
                    <span className="ml-2 text-blue-900">{viewingEntry.labContact}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-blue-700 font-medium">Address:</span>
                    <span className="ml-2 text-blue-900">{viewingEntry.labAddress}</span>
                  </div>
                  {viewingEntry.labEmail && (
                    <div className="col-span-2">
                      <span className="text-blue-700 font-medium">Email:</span>
                      <span className="ml-2 text-blue-900">{viewingEntry.labEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Patient Information */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-3">Patient Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-green-700 font-medium">Name:</span>
                    <span className="ml-2 text-green-900">{viewingEntry.patientName}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Age/Gender:</span>
                    <span className="ml-2 text-green-900">{viewingEntry.patientAge} years, {viewingEntry.patientGender}</span>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Contact:</span>
                    <span className="ml-2 text-green-900">{viewingEntry.patientContact}</span>
                  </div>
                </div>
              </div>

              {/* Test Information */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-900 mb-3">Test Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-purple-700 font-medium">Test Type:</span>
                    <span className="ml-2 text-purple-900">{viewingEntry.testType}</span>
                  </div>
                  <div>
                    <span className="text-purple-700 font-medium">Sample Type:</span>
                    <span className="ml-2 text-purple-900">{viewingEntry.sampleType}</span>
                  </div>
                  <div>
                    <span className="text-purple-700 font-medium">Collection Date:</span>
                    <span className="ml-2 text-purple-900">{formatDate(viewingEntry.sampleCollectionDate)}</span>
                  </div>
                  <div>
                    <span className="text-purple-700 font-medium">Sent Date:</span>
                    <span className="ml-2 text-purple-900">{formatDate(viewingEntry.sampleSentDate)}</span>
                  </div>
                  {viewingEntry.expectedResultDate && (
                    <div>
                      <span className="text-purple-700 font-medium">Expected Result:</span>
                      <span className="ml-2 text-purple-900">{formatDate(viewingEntry.expectedResultDate)}</span>
                    </div>
                  )}
                  {viewingEntry.actualResultDate && (
                    <div>
                      <span className="text-purple-700 font-medium">Actual Result:</span>
                      <span className="ml-2 text-purple-900">{formatDate(viewingEntry.actualResultDate)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Additional Info */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(viewingEntry.status)}`}>
                    {viewingEntry.status}
                  </span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Urgency</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getUrgencyBadge(viewingEntry.urgency)}`}>
                    {viewingEntry.urgency}
                  </span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Cost</p>
                  <p className="text-lg font-bold text-gray-800">₹{viewingEntry.cost}</p>
                </div>
              </div>

              {/* Remarks */}
              {viewingEntry.remarks && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">Remarks</h3>
                  <p className="text-sm text-yellow-800">{viewingEntry.remarks}</p>
                </div>
              )}

              {/* Result */}
              {viewingEntry.resultReceived && viewingEntry.resultUrl && (
                <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Result</h3>
                  {viewingEntry.resultUrl.endsWith('.pdf') ? (
                    <div className="text-center">
                      <FileText size={64} className="mx-auto text-red-500 mb-4" />
                      <p className="text-gray-700 mb-4">PDF Document</p>
                      <button
                        onClick={() => window.open(viewingEntry.resultUrl, '_blank')}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Open PDF
                      </button>
                    </div>
                  ) : (
                    <div>
                      <img 
                        src={viewingEntry.resultUrl} 
                        alt="Result" 
                        className="max-h-96 rounded-lg border border-gray-400 mx-auto cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(viewingEntry.resultUrl, '_blank')}
                      />
                      <p className="text-sm text-gray-600 text-center mt-3">Click image to view full size</p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingEntry(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabPartnersPage;
