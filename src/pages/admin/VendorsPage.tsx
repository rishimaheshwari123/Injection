import { useEffect, useState } from 'react';
import { Search, CheckCircle, XCircle, Download } from 'lucide-react';
import { vendorAPI } from '../../services/api';
import { setVendors, setLoading, updateVendorStatus } from '../../store/slices/vendorSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const VendorsPage = () => {
  const dispatch = useAppDispatch();
  const { vendors, loading } = useAppSelector((state) => state.vendors);
  const [searchTerm, setSearchTerm] = useState('');

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
      console.error('Error fetching vendors:', error);
    }
  };

  const handleActivate = async (vendorId: string, businessName: string) => {
    try {
      const response = await vendorAPI.activateVendor(vendorId);
      if (response.data.success) {
        dispatch(updateVendorStatus({ vendorId, isActive: true, isVerified: true }));
        toast.success(`${businessName} activated and verified successfully!`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to activate vendor');
      console.error('Error activating vendor:', error);
    }
  };

  const handleDeactivate = async (vendorId: string, businessName: string) => {
    try {
      const response = await vendorAPI.deactivateVendor(vendorId);
      if (response.data.success) {
        dispatch(updateVendorStatus({ vendorId, isActive: false, isVerified: false }));
        toast.success(`${businessName} deactivated successfully!`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to deactivate vendor');
      console.error('Error deactivating vendor:', error);
    }
  };

  const handleExportToExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = filteredVendors.map((vendor: any) => ({
        'Business Name': vendor.businessName,
        'Owner Name': vendor.name,
        'Email': vendor.email,
        'Phone': vendor.phone,
        'Business Type': vendor.businessType,
        'City': vendor.city,
        'State': vendor.state,
        'Pincode': vendor.pincode,
        'Services Offered': vendor.servicesOffered?.join(', ') || 'N/A',
        'Verification Status': vendor.verificationStatus,
        'Active Status': vendor.isActive ? 'Active' : 'Inactive',
        'Rating': vendor.rating || 0,
        'Created At': new Date(vendor.createdAt).toLocaleDateString('en-IN'),
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Vendors');
      
      // Generate filename with current date
      const fileName = `Vendors_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, fileName);
      
      toast.success('Vendors data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    }
  };

  const filteredVendors = vendors.filter((vendor: any) =>
    vendor.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Vendors Management</h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Download size={20} />
            Export to Excel
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#63D64F]"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Business Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Owner</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVendors.map((vendor: any) => (
                  <tr key={vendor._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{vendor.businessName}</p>
                        <p className="text-sm text-gray-600">{vendor.city}, {vendor.state}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{vendor.name}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-700">{vendor.email}</p>
                        <p className="text-sm text-gray-600">{vendor.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {vendor.businessType}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          vendor.verificationStatus === 'verified' ? 'bg-green-100 text-green-700' :
                          vendor.verificationStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {vendor.verificationStatus}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          vendor.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {vendor.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {vendor.isActive ? (
                        <button
                          onClick={() => handleDeactivate(vendor._id, vendor.businessName)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        >
                          <XCircle size={16} />
                          Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(vendor._id, vendor.businessName)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                        >
                          <CheckCircle size={16} />
                          Activate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsPage;
