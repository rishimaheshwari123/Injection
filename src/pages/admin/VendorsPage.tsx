import { useEffect, useState } from 'react';
import { Search, Download, Plus, Edit, Trash2, X, Eye, MoreVertical, UserCheck, UserX } from 'lucide-react';
import { vendorAPI } from '../../services/api';
import { setVendors, setLoading, updateVendorStatus, addVendor, updateVendor, removeVendor } from '../../store/slices/vendorSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const VendorsPage = () => {
  const dispatch = useAppDispatch();
  const { vendors, loading } = useAppSelector((state: any) => state.vendors);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewVendor, setViewVendor] = useState<any>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  console.log('VendorsPage render - vendors count:', vendors.length);
  console.log('Vendors:', vendors);
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', alternatePhone: '',
    businessName: '', businessType: 'Individual', registrationNumber: '',
    gstNumber: '', experience: '', specialization: '', address: '',
    city: '', state: '', pincode: '', bio: '', profileImage: '',
    isActive: true, isVerified: false,
    bankDetails: {
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: ''
    }
  });
  const [servicesOffered, setServicesOffered] = useState<string[]>([]);
  const [serviceAreas, setServiceAreas] = useState<string[]>([]);

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    dispatch(setLoading(true));
    try {
      const response = await vendorAPI.getAllVendors();
      if (response.data.success) {
        dispatch(setVendors(response.data.data));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch vendors');
    }
  };

  const handleToggleStatus = async (vendorId: string, currentStatus: boolean, businessName: string) => {
    try {
      const response = currentStatus 
        ? await vendorAPI.deactivateVendor(vendorId)
        : await vendorAPI.activateVendor(vendorId);
      if (response.data.success) {
        dispatch(updateVendorStatus({ vendorId, isActive: !currentStatus, isVerified: !currentStatus }));
        toast.success(`${businessName} ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update vendor status');
    }
  };

  const handleDelete = async (vendorId: string, businessName: string) => {
    const confirmDelete = () => {
      toast.info(
        <div>
          <p className="font-semibold mb-2">Delete {businessName}?</p>
          <p className="text-sm mb-3">This action cannot be undone.</p>
          <div className="flex gap-2">
            <button onClick={async () => {
              toast.dismiss();
              try {
                const response = await vendorAPI.deleteVendor(vendorId);
                if (response.data.success) {
                  dispatch(removeVendor(vendorId));
                  toast.success(`${businessName} deleted successfully!`);
                }
              } catch (error: any) {
                toast.error(error.response?.data?.message || 'Failed to delete vendor');
              }
            }} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
              Delete
            </button>
            <button onClick={() => toast.dismiss()} className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400">
              Cancel
            </button>
          </div>
        </div>,
        { position: 'top-center', autoClose: false, closeButton: false, draggable: false }
      );
    };
    confirmDelete();
  };

  const handleOpenModal = (vendor: any = null) => {
    if (vendor) {
      setEditMode(true);
      setSelectedVendor(vendor);
      setFormData({
        ...vendor,
        password: '',
        bankDetails: vendor.bankDetails || {
          accountHolderName: '',
          accountNumber: '',
          ifscCode: '',
          bankName: ''
        }
      });
      setServicesOffered(vendor.servicesOffered || []);
      setServiceAreas(vendor.serviceAreas || []);
    } else {
      setEditMode(false);
      setSelectedVendor(null);
      setFormData({
        name: '', email: '', password: '', phone: '', alternatePhone: '',
        businessName: '', businessType: 'Individual', registrationNumber: '',
        gstNumber: '', experience: '', specialization: '', address: '',
        city: '', state: '', pincode: '', bio: '', profileImage: '',
        isActive: true, isVerified: false,
        bankDetails: {
          accountHolderName: '',
          accountNumber: '',
          ifscCode: '',
          bankName: ''
        }
      });
      setServicesOffered([]);
      setServiceAreas([]);
    }
    setShowModal(true);
  };

  const handleViewVendor = (vendor: any) => {
    setViewVendor(vendor);
    setShowViewModal(true);
    setOpenDropdown(null);
  };

  const toggleDropdown = (vendorId: string) => {
    setOpenDropdown(openDropdown === vendorId ? null : vendorId);
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const submitData = { ...formData, servicesOffered, serviceAreas };
      
      console.log('Submitting vendor data:', submitData);
      
      if (editMode && selectedVendor) {
        console.log('Updating vendor:', selectedVendor._id);
        const response = await vendorAPI.updateVendor(selectedVendor._id, submitData);
        console.log('Update response:', response.data);
        if (response.data.success) {
          dispatch(updateVendor(response.data.data));
          console.log('Vendor updated in Redux');
          toast.success('Vendor updated successfully!');
          setShowModal(false);
        }
      } else {
        console.log('Creating new vendor');
        const response = await vendorAPI.createVendor(submitData);
        console.log('Create response:', response.data);
        if (response.data.success) {
          dispatch(addVendor(response.data.data));
          console.log('Vendor added to Redux:', response.data.data);
          toast.success('Vendor created successfully!');
          setShowModal(false);
        }
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportToExcel = () => {
    try {
      const excelData = filteredVendors.map((vendor: any) => ({
        'Business Name': vendor.businessName, 'Owner': vendor.name, 'Email': vendor.email,
        'Phone': vendor.phone, 'Type': vendor.businessType, 'City': vendor.city,
        'State': vendor.state, 'Status': vendor.isActive ? 'Active' : 'Inactive',
        'Verified': vendor.isVerified ? 'Yes' : 'No'
      }));
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Vendors');
      XLSX.writeFile(wb, `Vendors_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Vendors data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
    }
  };

  const filteredVendors = vendors.filter((vendor: any) =>
    vendor.businessName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Vendors Management</h1>
        <div className="flex items-center gap-4">
          <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg">
            <Plus size={20} /> Add Vendor
          </button>
          <button onClick={handleExportToExcel} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download size={20} /> Export
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Search vendors..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] outline-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#63D64F]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md ">
          <div className="">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Business Info</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Owner</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVendors.map((vendor: any) => (
                  <tr key={vendor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">{vendor.businessName}</p>
                      <p className="text-sm text-gray-600">{vendor.city}, {vendor.state}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">{vendor.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700">{vendor.email}</p>
                      <p className="text-sm text-gray-600">{vendor.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {vendor.businessType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${vendor.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {vendor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); toggleDropdown(vendor._id); }}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                          <MoreVertical size={20} />
                        </button>
                        {openDropdown === vendor._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                            <button onClick={() => handleViewVendor(vendor)} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2">
                              <Eye size={16} className="text-green-600" /> View Profile
                            </button>
                            <button onClick={() => { handleOpenModal(vendor); setOpenDropdown(null); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2">
                              <Edit size={16} className="text-blue-600" /> Edit Vendor
                            </button>
                            <button onClick={() => { handleToggleStatus(vendor._id, vendor.isActive, vendor.businessName); setOpenDropdown(null); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2">
                              {vendor.isActive ? <><UserX size={16} className="text-orange-600" /> Deactivate</> : <><UserCheck size={16} className="text-green-600" /> Activate</>}
                            </button>
                            <button onClick={() => { handleDelete(vendor._id, vendor.businessName); setOpenDropdown(null); }} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t">
                              <Trash2 size={16} /> Delete Vendor
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">{editMode ? 'Edit Vendor' : 'Add New Vendor'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  {!editMode && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <input type="password" required={!editMode} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input type="tel" required value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
                    <input type="tel" value={formData.alternatePhone} onChange={(e) => setFormData({...formData, alternatePhone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
                    <input type="text" required value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Type *</label>
                    <select required value={formData.businessType} onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]">
                      <option value="Individual">Individual</option>
                      <option value="Clinic">Clinic</option>
                      <option value="Hospital">Hospital</option>
                      <option value="Laboratory">Laboratory</option>
                      <option value="Pharmacy">Pharmacy</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Registration Number</label>
                    <input type="text" value={formData.registrationNumber} onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Number</label>
                    <input type="text" value={formData.gstNumber} onChange={(e) => setFormData({...formData, gstNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                    <input type="number" value={formData.experience} onChange={(e) => setFormData({...formData, experience: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                    <input type="text" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Location Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                    <input type="text" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input type="text" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input type="text" required value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input type="text" required value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                    <input type="text" value={formData.bankDetails.accountHolderName} 
                      onChange={(e) => setFormData({...formData, bankDetails: {...formData.bankDetails, accountHolderName: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                    <input type="text" value={formData.bankDetails.accountNumber} 
                      onChange={(e) => setFormData({...formData, bankDetails: {...formData.bankDetails, accountNumber: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                    <input type="text" value={formData.bankDetails.ifscCode} 
                      onChange={(e) => setFormData({...formData, bankDetails: {...formData.bankDetails, ifscCode: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                    <input type="text" value={formData.bankDetails.bankName} 
                      onChange={(e) => setFormData({...formData, bankDetails: {...formData.bankDetails, bankName: e.target.value}})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F]" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Status</h3>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4 text-[#63D64F] border-gray-300 rounded" />
                    <span className="text-sm font-medium text-gray-700">Active Account</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={formData.isVerified} onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                      className="w-4 h-4 text-[#63D64F] border-gray-300 rounded" />
                    <span className="text-sm font-medium text-gray-700">Verified Account</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} disabled={submitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg disabled:opacity-50 flex items-center gap-2">
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {editMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>{editMode ? 'Update Vendor' : 'Create Vendor'}</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Vendor Details</h2>
              <button onClick={() => setShowViewModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">Business Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><p className="text-sm text-gray-600">Business Name</p><p className="font-medium text-gray-800">{viewVendor.businessName}</p></div>
                  <div><p className="text-sm text-gray-600">Business Type</p><p className="font-medium text-gray-800">{viewVendor.businessType}</p></div>
                  <div><p className="text-sm text-gray-600">Owner Name</p><p className="font-medium text-gray-800">{viewVendor.name}</p></div>
                  <div><p className="text-sm text-gray-600">Email</p><p className="font-medium text-gray-800">{viewVendor.email}</p></div>
                  <div><p className="text-sm text-gray-600">Phone</p><p className="font-medium text-gray-800">{viewVendor.phone}</p></div>
                  <div><p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${viewVendor.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {viewVendor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="md:col-span-2"><p className="text-sm text-gray-600">Address</p><p className="font-medium text-gray-800">{viewVendor.address}, {viewVendor.city}, {viewVendor.state} - {viewVendor.pincode}</p></div>
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end">
              <button onClick={() => setShowViewModal(false)} className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsPage;
