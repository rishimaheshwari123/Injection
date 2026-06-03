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
import { serviceAPI, vendorAPI } from "../../services/api";
import { setServices, setLoading } from "../../store/slices/serviceSlice";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";

const ServicesPage = () => {
  const dispatch = useAppDispatch();
  const { services, loading } = useAppSelector((state) => state.services);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [vendors, setVendors] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    serviceName: "",
    description: "",
    category: "",
    basePrice: "",
    duration: "45",
    serviceType: "At Home",
    vendorId: "",
    requirements: "",
    image: "",
  });

  useEffect(() => {
    fetchServices();
    fetchVendors();
  }, []);

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

  const fetchServices = async () => {
    dispatch(setLoading(true));
    try {
      const response = await serviceAPI.getAllServices();
      if (response.data.success) {
        dispatch(setServices(response.data.data));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch services");
      console.error("Error fetching services:", error);
    }
  };

  const handleExportToExcel = () => {
    try {
      // Prepare data for Excel
      const excelData = filteredServices.map((service: any) => ({
        "Service Name": service.serviceName,
        Category: service.category,
        Description: service.description,
        "Base Price": service.basePrice,
        "Duration (mins)": service.duration,
        "Service Type": service.serviceType,
        "Vendor Name": service.vendorId?.businessName || "N/A",
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

    if (!formData.vendorId) {
      toast.error("Please select a vendor");
      return;
    }

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
        setFormData({
          serviceName: "",
          description: "",
          category: "",
          basePrice: "",
          duration: "45",
          serviceType: "At Home",
          vendorId: "",
          requirements: "",
          image: "",
        });
        setImageFile(null);
        setImagePreview("");
        fetchServices();
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
    setFormData({
      serviceName: service.serviceName,
      description: service.description,
      category: service.category,
      basePrice: service.basePrice.toString(),
      duration: service.duration.toString(),
      serviceType: service.serviceType,
      vendorId: service.vendorId?._id || "",
      requirements: service.requirements || "",
      image: service.image || "",
    });
    setImagePreview(service.image || "");
    setImageFile(null);
    setShowEditModal(true);
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.vendorId) {
      toast.error("Please select a vendor");
      return;
    }

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
        setFormData({
          serviceName: "",
          description: "",
          category: "",
          basePrice: "",
          duration: "45",
          serviceType: "At Home",
          vendorId: "",
          requirements: "",
          image: "",
        });
        setImageFile(null);
        setImagePreview("");
        fetchServices();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update service");
      console.error("Error updating service:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    "Home Injections",
    "IV Drip Services",
    "Wound Dressing",
    "Day Care at Home",
    "Patient Monitoring",
    "Old Age Patient Care",
    "24 HR Patient Care",
    "Field Survey Service",
    "Data Collection Service",
    "Field Sample Collection",
    "Community Survey",
    "Awareness Activities",
    "Lab-based Training",
    "BSC/MSC Training",
    "DMLT Training",
    "Nursing Training",
    "Dissertation Program",
    "Placement Services",
    "Blood Collection",
    "BP/Sugar Monitoring",
    "ECG at Home",
    "Catheter Care",
    "Physiotherapy Session",
    "Other",
  ];

  const filteredServices = services.filter((service: any) => {
    const matchesSearch =
      service.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.vendorId?.businessName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesVendor =
      selectedVendor === "" || service.vendorId?._id === selectedVendor;

    return matchesSearch && matchesVendor;
  });

  return (
    <div>
      {/* First Row - Title, Search, Export */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Services Management
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none w-64"
            />
          </div>
          <button
            onClick={handleExportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Download size={20} />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Second Row - Create Service and Vendor Filter */}
      <div className="flex items-center justify-end gap-4 mb-6">
        <select
          value={selectedVendor}
          onChange={(e) => setSelectedVendor(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
        >
          <option value="">All Vendors</option>
          {vendors.map((vendor) => (
            <option key={vendor._id} value={vendor._id}>
              {vendor.businessName}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
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
                    {service.category}
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
                <p className="text-sm text-gray-600">Vendor:</p>
                <p className="font-medium text-gray-800">
                  {service.vendorId?.businessName || "N/A"}
                </p>
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
              {/* Vendor Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Vendor <span className="text-red-500">*</span>
                </label>
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                >
                  <option value="">
                    Choose a vendor ({vendors.length} available)
                  </option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.businessName} - {vendor.name} ({vendor.city})
                      {!vendor.isVerified && " [Not Verified]"}
                      {!vendor.isActive && " [Inactive]"}
                    </option>
                  ))}
                </select>
                {vendors.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    No vendors found. Please create vendors first.
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Admin can create services for any vendor
                </p>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
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
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                >
                  <option value="At Home">At Home</option>
                  <option value="At Clinic">At Clinic</option>
                  <option value="Both">Both</option>
                </select>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Vendor <span className="text-red-500">*</span>
                </label>
                <select
                  name="vendorId"
                  value={formData.vendorId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                >
                  <option value="">
                    Choose a vendor ({vendors.length} available)
                  </option>
                  {vendors.map((vendor) => (
                    <option key={vendor._id} value={vendor._id}>
                      {vendor.businessName} - {vendor.name} ({vendor.city})
                      {!vendor.isVerified && " [Not Verified]"}
                      {!vendor.isActive && " [Inactive]"}
                    </option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
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
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#63D64F] focus:border-transparent outline-none"
                >
                  <option value="At Home">At Home</option>
                  <option value="At Clinic">At Clinic</option>
                  <option value="Both">Both</option>
                </select>
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
    </div>
  );
};

export default ServicesPage;
