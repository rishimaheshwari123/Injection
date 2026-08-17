import { useState, useEffect } from "react";
import {
  serviceAPI,
  vendorServiceRequestAPI,
} from "../../services/api";
import { toast } from "react-toastify";
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Package,
  FileQuestion,
  X,
  Sparkles,
} from "lucide-react";

interface Service {
  _id: string;
  serviceName: string;
  description: string;
  category: {
    _id: string;
    name: string;
  };
  basePrice: number;
  duration: number;
  serviceType: string;
  isActive: boolean;
}

interface ServiceRequest {
  _id: string;
  services: Array<{
    _id: string;
    serviceName: string;
    category: string;
    basePrice: number;
  }>;
  status: "pending" | "approved" | "rejected";
  adminRemarks?: string;
  createdAt: string;
}

export default function VendorServicesPage() {
  const [activeTab, setActiveTab] = useState<"assigned" | "requests">("assigned");
  
  // States for Assigned Services
  const [assignedServices, setAssignedServices] = useState<Service[]>([]);
  const [loadingAssigned, setLoadingAssigned] = useState(true);
  const [assignedSearch, setAssignedSearch] = useState("");

  // States for Requests History
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // States for Request Modal
  const [showModal, setShowModal] = useState(false);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [loadingAllServices, setLoadingAllServices] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    fetchAssignedServices();
    fetchRequests();
  }, []);

  const fetchAssignedServices = async () => {
    try {
      setLoadingAssigned(true);
      const response = await serviceAPI.getVendorServices();
      if (response.data.success) {
        setAssignedServices(response.data.data || []);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load assigned services"
      );
    } finally {
      setLoadingAssigned(false);
    }
  };

  const fetchRequests = async () => {
    try {
      setLoadingRequests(true);
      const response = await vendorServiceRequestAPI.getMyRequests();
      if (response.data.success) {
        setRequests(response.data.data || []);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load request history"
      );
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleOpenRequestModal = async () => {
    setShowModal(true);
    setSelectedServiceIds([]);
    try {
      setLoadingAllServices(true);
      const response = await serviceAPI.getPublicServices();
      if (response.data.success) {
        setAllServices(response.data.data || []);
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to load public services"
      );
    } finally {
      setLoadingAllServices(false);
    }
  };

  const handleCheckboxChange = (serviceId: string) => {
    if (selectedServiceIds.includes(serviceId)) {
      setSelectedServiceIds(selectedServiceIds.filter((id) => id !== serviceId));
    } else {
      setSelectedServiceIds([...selectedServiceIds, serviceId]);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedServiceIds.length === 0) {
      toast.error("Please select at least one service to request");
      return;
    }

    try {
      setSubmittingRequest(true);
      const response = await vendorServiceRequestAPI.createRequest(selectedServiceIds);
      if (response.data.success) {
        toast.success("Service request submitted successfully for approval!");
        setShowModal(false);
        fetchRequests(); // Reload requests list
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to submit service request"
      );
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Filters for assigned services
  const filteredAssigned = assignedServices.filter((s) => {
    if (!assignedSearch) return true;
    const term = assignedSearch.toLowerCase();
    return (
      s.serviceName.toLowerCase().includes(term) ||
      s.category?.name?.toLowerCase().includes(term) ||
      s.description.toLowerCase().includes(term)
    );
  });

  // Filter out services already assigned or already pending/requested
  const assignedIds = assignedServices.map((s) => s._id);
  const pendingOrRequestedIds = requests
    .filter((req) => req.status === "pending" || req.status === "approved")
    .flatMap((req) => req.services.map((s) => s._id));

  const availableForRequest = allServices.filter((s) => {
    const isAssigned = assignedIds.includes(s._id);
    const isRequested = pendingOrRequestedIds.includes(s._id);
    
    if (isAssigned || isRequested) return false;

    if (!modalSearch) return true;
    const term = modalSearch.toLowerCase();
    return (
      s.serviceName.toLowerCase().includes(term) ||
      s.category?.name?.toLowerCase().includes(term)
    );
  });

  const getStatusColor = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-amber-50 text-amber-700 border-amber-200",
      approved: "bg-green-50 text-green-700 border-green-200",
      rejected: "bg-rose-50 text-rose-700 border-rose-200",
    };
    return styles[status] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 size={14} className="text-green-600" />;
      case "rejected":
        return <XCircle size={14} className="text-red-600" />;
      default:
        return <Clock size={14} className="text-amber-500" />;
    }
  };

  return (
    <div className="max-w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] bg-clip-text text-transparent">
            Service Management
          </h1>
          <p className="text-slate-500 mt-1">
            Manage your active services and request additional services
          </p>
        </div>
        <button
          onClick={handleOpenRequestModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] text-white font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
        >
          <Plus size={18} />
          Request New Service
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-6">
        <button
          onClick={() => setActiveTab("assigned")}
          className={`pb-3 text-sm font-extrabold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "assigned"
              ? "border-[#3DB9A6] text-[#3DB9A6]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Package size={18} />
          My Services ({assignedServices.length})
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-3 text-sm font-extrabold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "requests"
              ? "border-[#3DB9A6] text-[#3DB9A6]"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FileQuestion size={18} />
          Service Requests ({requests.length})
        </button>
      </div>

      {/* Tab: My Services */}
      {activeTab === "assigned" && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search assigned services by name, category..."
                value={assignedSearch}
                onChange={(e) => setAssignedSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-[#63D64F] focus:ring-2 focus:ring-[#63D64F]/10 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {loadingAssigned ? (
            <div className="bg-white py-20 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#63D64F]"></div>
              <p className="mt-4 text-slate-500 font-semibold text-sm">Loading services...</p>
            </div>
          ) : filteredAssigned.length === 0 ? (
            <div className="bg-white py-20 rounded-2xl border border-slate-100 shadow-sm text-center text-slate-400 flex flex-col items-center justify-center">
              <Package size={48} className="text-slate-200 mb-4" />
              <p className="font-bold text-slate-500 text-base">No services found</p>
              <p className="text-xs text-slate-400 mt-1">
                {assignedSearch
                  ? "Try adjusting your search criteria"
                  : "No services are currently assigned to you. Click 'Request New Service' to request some!"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAssigned.map((service) => (
                <div
                  key={service._id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-bold border border-teal-100">
                        {service.category?.name || "Healthcare"}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        {service.serviceType || "At Home"}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#3DB9A6] transition-colors line-clamp-1">
                      {service.serviceName}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-slate-50 flex items-center justify-between text-sm">
                    <div>
                      <span className="text-xs font-semibold text-slate-400 block">Base Price</span>
                      <span className="text-base font-black text-slate-800">₹{service.basePrice}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-400 block">Duration</span>
                      <span className="font-bold text-slate-700">{service.duration} mins</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Requests History */}
      {activeTab === "requests" && (
        <div className="space-y-6">
          {loadingRequests ? (
            <div className="bg-white py-20 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[#63D64F]"></div>
              <p className="mt-4 text-slate-500 font-semibold text-sm">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="bg-white py-20 rounded-2xl border border-slate-100 shadow-sm text-center text-slate-400 flex flex-col items-center justify-center">
              <FileQuestion size={48} className="text-slate-200 mb-4" />
              <p className="font-bold text-slate-500 text-base">No request history</p>
              <p className="text-xs text-slate-400 mt-1">
                You have not requested any service approvals yet.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100">
                  <thead className="bg-slate-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Request Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Requested Services
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Admin Remarks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {requests.map((req) => (
                      <tr key={req._id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                          {new Date(req.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1.5 max-w-[400px]">
                            {req.services?.map((s) => (
                              <span
                                key={s._id}
                                className="px-2 py-0.5 rounded-lg bg-green-50 text-green-700 text-[10px] font-bold border border-green-100"
                              >
                                {s.serviceName}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full border uppercase ${getStatusColor(
                              req.status
                            )}`}
                          >
                            {getStatusIcon(req.status)}
                            {req.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-[250px] truncate" title={req.adminRemarks}>
                          {req.adminRemarks ? (
                            <span className="italic">"{req.adminRemarks}"</span>
                          ) : (
                            <span className="text-slate-400">—</span>
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
      )}

      {/* Request New Service Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[85vh] border border-slate-100 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center gap-2">
                <Sparkles size={20} className="text-[#3DB9A6]" />
                <h2 className="text-xl font-extrabold text-slate-800">
                  Request New Services
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {/* Search bar inside Modal */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search available services by name..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#3DB9A6] focus:ring-2 focus:ring-[#3DB9A6]/10 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Service Select List */}
              {loadingAllServices ? (
                <div className="py-20 flex flex-col items-center justify-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#3DB9A6]"></div>
                  <p className="mt-4 text-slate-400 font-semibold text-xs">Loading services list...</p>
                </div>
              ) : availableForRequest.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <Package size={36} className="mx-auto text-slate-200 mb-2" />
                  <p className="font-bold text-slate-500 text-sm">No new services available</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    You have already requested or been assigned all available services in the platform.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
                  {availableForRequest.map((service) => {
                    const isChecked = selectedServiceIds.includes(service._id);
                    return (
                      <label
                        key={service._id}
                        onClick={() => handleCheckboxChange(service._id)}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isChecked
                            ? "bg-teal-50/50 border-[#3DB9A6] shadow-sm"
                            : "bg-white border-slate-150 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by click on label
                            className="w-4 h-4 text-[#3DB9A6] border-slate-350 rounded focus:ring-[#3DB9A6]"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-sm text-slate-800 block truncate">
                              {service.serviceName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold uppercase">
                              {service.category?.name || "General"}
                            </span>
                          </div>
                        </div>
                        <div className="text-right pl-3">
                          <span className="font-black text-sm text-[#3DB9A6]">
                            ₹{service.basePrice}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl font-bold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitRequest}
                disabled={submittingRequest || selectedServiceIds.length === 0}
                className="px-5 py-2 bg-gradient-to-r from-[#63D64F] to-[#3DB9A6] hover:shadow-md text-white rounded-xl font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submittingRequest ? "Submitting..." : `Submit Request (${selectedServiceIds.length})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
