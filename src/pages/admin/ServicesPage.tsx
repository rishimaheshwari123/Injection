import { useEffect, useState } from "react";
import {
  Search,
  Package,
  Download,
  Plus,
  X,
  Edit,
  Loader2,
  ImageIcon,
} from "lucide-react";
import { serviceAPI, vendorAPI, categoryAPI } from "../../services/api";
import { setServices, setLoading } from "../../store/slices/serviceSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

const ServicesPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { services, loading } = useAppSelector((state) => state.services);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [createServiceTypeOption, setCreateServiceTypeOption] = useState("At Home");
  const [editServiceTypeOption, setEditServiceTypeOption] = useState("At Home");
  const [categories, setCategoriesState] = useState<any[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [submittingCategory, setSubmittingCategory] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [totalPages, setTotalPages] = useState(1);
  const [totalServices, setTotalServices] = useState(0);
  const [customLimit, setCustomLimit] = useState("");
  const [jumpPage, setJumpPage] = useState("");
  const [formData, setFormData] = useState({
    serviceName: "",
    description: "",
    category: "",
    basePrice: "",
    duration: "45",
    serviceType: "At Home",
    vendors: [] as string[],
    requirements: "",
    image: "",
  });

  useEffect(() => {
    fetchVendors();
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchServices(1, limit, searchTerm);
  }, [searchTerm]);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAllCategories();
      if (response.data.success) {
        setCategoriesState(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setSubmittingCategory(true);
    try {
      const response = await categoryAPI.createCategory(newCategoryName.trim());
      if (response.data.success) {
        toast.success("Category created successfully!");
        setShowAddCategoryModal(false);
        setNewCategoryName("");
        await fetchCategories();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create category");
      console.error("Error creating category:", error);
    } finally {
      setSubmittingCategory(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return formData.image || null;
    try {
      const response = await serviceAPI.uploadImage(imageFile);
      return response.data.data.url;
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
      return null;
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await vendorAPI.getAllVendors();
      console.log("Vendors API Response:", response.data);
      if (response.data.success) {
        console.log("All Vendors:", response.data.data);
        // Show all vendors for now to debug
        setVendors(response.data.data);

        // Filter only verified and active vendors
        const verifiedVendors = response.data.data.filter(
          (v: any) =>
            v.isVerified && v.isActive && v.verificationStatus === "verified",
        );
        console.log("Verified Vendors:", verifiedVendors);
        console.log(
          "Total vendors:",
          response.data.data.length,
          "Verified:",
          verifiedVendors.length,
        );
      }
    } catch (error: any) {
      console.error("Error fetching vendors:", error);
      toast.error("Failed to fetch vendors");
    }
  };

  const fetchServices = async (page = currentPage, pageSize = limit, searchVal = searchTerm) => {
    dispatch(setLoading(true));
    try {
      const response = await serviceAPI.getPaginatedServices({
        page,
        limit: pageSize,
        search: searchVal
      });
      if (response.data.success) {
        dispatch(setServices(response.data.data));
        setTotalPages(response.data.totalPages || 1);
        setTotalServices(response.data.totalServices || 0);
        setCurrentPage(response.data.currentPage || 1);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch services");
      console.error("Error fetching services:", error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleExportToExcel = async () => {
    try {
      const response = await serviceAPI.getAllServices();
      if (!response.data.success) {
        toast.error("Failed to export data");
        return;
      }
      const allServices = response.data.data;

      // Prepare data for Excel
      const excelData = allServices.map((service: any) => ({
        "Service Name": service.serviceName,
        Category: typeof service.category === 'object' ? (service.category?.name || "N/A") : (service.category || "N/A"),
        Description: service.description,
        "Base Price": service.basePrice,
        "Duration (mins)": service.duration,
        "Service Type": service.serviceType,
        "Vendor Name": service.vendors?.map((v: any) => v.businessName).join(', ') || "N/A",
        Status: service.isActive ? "Active" : "Inactive",
        "Created At": new Date(service.createdAt).toLocaleDateString("en-IN"),
      }));

      // Create worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Create workbook
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Services");

      // Generate filename with current date
      const fileName = `Services_${new Date().toISOString().split("T")[0]}.xlsx`;

      // Save file
      XLSX.writeFile(wb, fileName);

      toast.success("Services data exported successfully!");
    } catch (error) {
      toast.error("Failed to export data");
      console.error("Export error:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const imageUrl = await uploadImage();

      const response = await serviceAPI.createService({
        ...formData,
        image: imageUrl,
        basePrice: Number(formData.basePrice),
        duration: Number(formData.duration),
      });

      if (response.data.success) {
        toast.success("Service created successfully!");
        setShowCreateModal(false);
        setCreateServiceTypeOption("At Home");
        setFormData({
          serviceName: "",
          description: "",
          category: "",
          basePrice: "",
          duration: "45",
          serviceType: "At Home",
          vendors: [],
          requirements: "",
          image: "",
        });
        setImageFile(null);
        setImagePreview("");
        fetchServices(1, limit, searchTerm);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create service");
      console.error("Error creating service:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (service: any) => {
    setEditingService(service);
    const isStandard = ["At Home", "At Clinic", "Both"].includes(service.serviceType);
    setEditServiceTypeOption(isStandard ? service.serviceType : "Custom");
    setFormData({
      serviceName: service.serviceName,
      description: service.description,
      category: service.category?._id || service.category,
      basePrice: service.basePrice.toString(),
      duration: service.duration.toString(),
      serviceType: service.serviceType,
      vendors: service.vendors ? service.vendors.map((v: any) => v._id || v) : [],
      requirements: service.requirements || "",
      image: service.image || "",
    });
    setImagePreview(service.image || "");
    setImageFile(null);
    setShowEditModal(true);
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    try {
      const imageUrl = await uploadImage();

      const response = await serviceAPI.updateService(editingService._id, {
        ...formData,
        image: imageUrl,
        basePrice: Number(formData.basePrice),
        duration: Number(formData.duration),
      });

      if (response.data.success) {
        toast.success("Service updated successfully!");
        setShowEditModal(false);
        setEditingService(null);
        setEditServiceTypeOption("At Home");
        setFormData({
          serviceName: "",
          description: "",
          category: "",
          basePrice: "",
          duration: "45",
          serviceType: "At Home",
          vendors: [],
          requirements: "",
          image: "",
        });
        setImageFile(null);
        setImagePreview("");
        fetchServices(currentPage, limit, searchTerm);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update service");
      console.error("Error updating service:", error);
    } finally {
      setSubmitting(false);
    }
  };



  const filteredServices = services;

  return (
    <div>
      {/* Header Row - Title, Export, Create */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Services Management
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Download size={20} />
            Export to Excel
          </button>
          <button
            onClick={() => {
              setCreateServiceTypeOption("At Home");
              setShowCreateModal(true);
              if (vendors.length === 0) {
                fetchVendors();
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            Create Service
          </button>
        </div>
      </div>

      {/* Search Row */}
      <div className="mb-6 flex items-center gap-3 w-full bg-white p-2 rounded-xl shadow-xs border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by service name, category, or vendor name..."
            value={tempSearchTerm}
            onChange={(e) => setTempSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setSearchTerm(tempSearchTerm);
              }
            }}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
          />
          {tempSearchTerm && (
            <button
              onClick={() => {
                setTempSearchTerm("");
                setSearchTerm("");
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <button
          onClick={() => setSearchTerm(tempSearchTerm)}
          className="px-5 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-semibold rounded-lg hover:shadow-md transition-all text-sm whitespace-nowrap"
        >
          Search
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#63D64F]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service: any) => (
            <div
              key={service._id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] p-0 rounded-lg overflow-hidden w-16 h-16 flex items-center justify-center">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.serviceName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="text-white" size={32} />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditClick(service)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Service"
                  >
                    <Edit size={18} />
                  </button>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      service.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {service.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-800 mb-2">
                {service.serviceName}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {service.description}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-gray-800">
                    {typeof service.category === 'object' ? (service.category?.name || "N/A") : (service.category || "N/A")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-bold text-[#63D64F]">
                    ₹{service.basePrice}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium text-gray-800">
                    {service.duration} mins
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium text-gray-800">
                    {service.serviceType}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-semibold mb-2">Vendors:</p>
                {service.vendors && service.vendors.length > 0 ? (
                  <div className="flex flex-wrap gap-x-2 gap-y-1">
                    {service.vendors.map((v: any, idx: number) => {
                      const vendorName = v.businessName || v.name || "Vendor";
                      const vendorId = v._id || v;
                      const isLast = idx === service.vendors.length - 1;
                      return (
                        <span key={idx} className="text-sm text-gray-800">
                          <a
                            href={`/admin/vendors/${vendorId}`}
                            onClick={(e) => {
                              e.preventDefault();
                              navigate(`/admin/vendors/${vendorId}`);
                            }}
                            className="text-blue-600 hover:text-blue-800 underline underline-offset-2 cursor-pointer font-semibold transition-colors"
                          >
                            {vendorName}
                          </a>
                          {!isLast && <span className="text-gray-400 ml-1">,</span>}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">None</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && filteredServices.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 p-4 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Show:</span>
            <select
              value={[6, 12, 24, 48, 96].includes(limit) && !customLimit ? limit : ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  const newLimit = parseInt(val);
                  setLimit(newLimit);
                  setCustomLimit('');
                  fetchServices(1, newLimit, searchTerm);
                }
              }}
              className="px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#63D64F] outline-none text-sm bg-white font-medium"
            >
              <option value="" disabled={!customLimit}>Select</option>
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={96}>96</option>
            </select>
            
            <input
              type="number"
              min={1}
              placeholder="Custom"
              value={customLimit}
              onChange={(e) => {
                const val = e.target.value;
                setCustomLimit(val);
                if (val) {
                  const newLimit = parseInt(val);
                  if (newLimit > 0) {
                    setLimit(newLimit);
                    fetchServices(1, newLimit, searchTerm);
                  }
                }
              }}
              className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#63D64F] outline-none text-sm text-center font-medium"
            />

            <span className="text-sm text-gray-500 ml-2 font-medium">
              Showing {services.length > 0 ? (currentPage - 1) * limit + 1 : 0} to {Math.min(currentPage * limit, totalServices)} of {totalServices} services
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => fetchServices(currentPage - 1, limit, searchTerm)}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Previous
              </button>
              
              <span className="px-4 py-1.5 text-sm text-gray-700 bg-gray-50 border rounded-lg font-medium">
                Page {currentPage} of {totalPages || 1}
              </span>

              <button
                onClick={() => fetchServices(currentPage + 1, limit, searchTerm)}
                disabled={currentPage === totalPages || totalPages === 0 || loading}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Next
              </button>
            </div>

            <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
              <span className="text-sm text-gray-600">Go to page:</span>
              <input
                type="number"
                min={1}
                max={totalPages || 1}
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                placeholder="Page"
                className="w-16 px-2 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#63D64F] outline-none text-sm text-center font-medium"
              />
              <button
                onClick={() => {
                  const targetPage = parseInt(jumpPage);
                  if (targetPage >= 1 && targetPage <= totalPages) {
                    fetchServices(targetPage, limit, searchTerm);
                    setJumpPage('');
                  } else {
                    toast.error(`Please enter a page between 1 and ${totalPages}`);
                  }
                }}
                disabled={loading || !jumpPage}
                className="px-3 py-1 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg font-semibold hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      )}

      {!loading && filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Package className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No services found</p>
        </div>
      )}

      {/* Create Service Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Create New Service
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="p-6 space-y-4">

              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Home Blood Collection"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                />
              </div>

              {/* Service Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#63D64F] transition-colors">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-32 w-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview("");
                            setFormData((prev) => ({ ...prev, image: "" }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="image-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-[#63D64F] hover:text-[#3DB9A6] focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input
                              id="image-upload"
                              name="image-upload"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Category
                  </button>
                </div>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  placeholder="Describe the service..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Base Price and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="500"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="45"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type
                </label>
                <select
                  value={createServiceTypeOption}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCreateServiceTypeOption(val);
                    if (val !== "Custom") {
                      setFormData((prev) => ({ ...prev, serviceType: val }));
                    } else {
                      setFormData((prev) => ({ ...prev, serviceType: "" }));
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                >
                  <option value="At Home">At Home</option>
                  <option value="At Clinic">At Clinic</option>
                  <option value="Both">Both</option>
                  <option value="Custom">Custom</option>
                </select>
                {createServiceTypeOption === "Custom" && (
                  <input
                    type="text"
                    placeholder="Enter custom service type"
                    value={formData.serviceType}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, serviceType: e.target.value }))
                    }
                    required
                    className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                  />
                )}
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements (Optional)
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Any special requirements or preparations needed..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  disabled={submitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? "Creating..." : "Create Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Service Modal */}
      {showEditModal && editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Edit Service</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingService(null);
                }}
                disabled={submitting}
                className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateService} className="p-6 space-y-4">
              {/* Vendor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 font-semibold">
                  Select Vendors (Optional)
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-3 space-y-2">
                  {vendors.map((vendor) => (
                    <label key={vendor._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={formData.vendors.includes(vendor._id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            vendors: checked 
                              ? [...prev.vendors, vendor._id] 
                              : prev.vendors.filter(id => id !== vendor._id)
                          }));
                        }}
                        className="w-4 h-4 text-[#63D64F] border-gray-300 rounded focus:ring-[#63D64F]"
                      />
                      <span className="text-sm text-gray-700">
                        {vendor.businessName} - {vendor.name} ({vendor.city})
                        {!vendor.isVerified && " [Not Verified]"}
                        {!vendor.isActive && " [Inactive]"}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="serviceName"
                  value={formData.serviceName}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Home Blood Collection"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                />
              </div>

              {/* Service Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#63D64F] transition-colors">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <div className="relative inline-block">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-32 w-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setImageFile(null);
                            setImagePreview("");
                            setFormData((prev) => ({ ...prev, image: "" }));
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="edit-image-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-[#63D64F] hover:text-[#3DB9A6] focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input
                              id="edit-image-upload"
                              name="edit-image-upload"
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={handleImageChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Category */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(true)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Category
                  </button>
                </div>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  placeholder="Describe the service..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Base Price and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Base Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="500"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="45"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type
                </label>
                <select
                  value={editServiceTypeOption}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditServiceTypeOption(val);
                    if (val !== "Custom") {
                      setFormData((prev) => ({ ...prev, serviceType: val }));
                    } else {
                      setFormData((prev) => ({ ...prev, serviceType: "" }));
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                >
                  <option value="At Home">At Home</option>
                  <option value="At Clinic">At Clinic</option>
                  <option value="Both">Both</option>
                  <option value="Custom">Custom</option>
                </select>
                {editServiceTypeOption === "Custom" && (
                  <input
                    type="text"
                    placeholder="Enter custom service type"
                    value={formData.serviceType}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, serviceType: e.target.value }))
                    }
                    required
                    className="mt-2 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                  />
                )}
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements (Optional)
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Any special requirements or preparations needed..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingService(null);
                  }}
                  disabled={submitting}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting && <Loader2 size={18} className="animate-spin" />}
                  {submitting ? "Updating..." : "Update Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">Add New Category</h3>
              <button
                type="button"
                onClick={() => {
                  setShowAddCategoryModal(false);
                  setNewCategoryName("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., General Consultation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddCategoryModal(false);
                    setNewCategoryName("");
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={submittingCategory || !newCategoryName.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingCategory && <Loader2 size={16} className="animate-spin" />}
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
