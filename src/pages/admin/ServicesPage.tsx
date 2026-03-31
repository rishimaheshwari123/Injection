import { useEffect, useState } from 'react';
import { Search, Package, Download } from 'lucide-react';
import { serviceAPI } from '../../services/api';
import { setServices, setLoading } from '../../store/slices/serviceSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

const ServicesPage = () => {
  const dispatch = useAppDispatch();
  const { services, loading } = useAppSelector((state) => state.services);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    dispatch(setLoading(true));
    try {
      const response = await serviceAPI.getAllServices();
      if (response.data.success) {
        dispatch(setServices(response.data.data));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch services');
      console.error('Error fetching services:', error);
    }
  };

  const handleExportToExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = filteredServices.map((service: any) => ({
        'Service Name': service.serviceName,
        'Category': service.category,
        'Description': service.description,
        'Base Price': service.basePrice,
        'Duration (mins)': service.duration,
        'Service Type': service.serviceType,
        'Vendor Name': service.vendorId?.businessName || 'N/A',
        'Status': service.isActive ? 'Active' : 'Inactive',
        'Created At': new Date(service.createdAt).toLocaleDateString('en-IN'),
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Services');
      
      // Generate filename with current date
      const fileName = `Services_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Save file
      XLSX.writeFile(wb, fileName);
      
      toast.success('Services data exported successfully!');
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    }
  };

  const filteredServices = services.filter((service: any) =>
    service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.vendorId?.businessName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Services Management</h1>
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
              placeholder="Search services..."
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service: any) => (
            <div key={service._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] p-3 rounded-lg">
                  <Package className="text-white" size={24} />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  service.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-2">{service.serviceName}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-gray-800">{service.category}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-bold text-[#63D64F]">₹{service.basePrice}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-800">{service.duration} mins</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-800">{service.serviceType}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">Vendor:</p>
                <p className="font-medium text-gray-800">{service.vendorId?.businessName || 'N/A'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No services found</p>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
