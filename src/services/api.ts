import axios from "axios";
import { API_CONFIG, API_ENDPOINTS } from "../config/api.config";

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password }),
  register: (userData: any) => api.post(API_ENDPOINTS.AUTH.REGISTER, userData),
};

// User APIs
export const userAPI = {
  getAllUsers: () => api.get(API_ENDPOINTS.USERS.BASE),
  getPaginatedUsers: (params?: any) =>
    api.get("/users/admin/paginated", { params }),
  getUserById: (id: string) => api.get(API_ENDPOINTS.USERS.BY_ID(id)),
  createUser: (userData: any) => api.post("/users/admin/create", userData),
  updateUser: (id: string, data: any) =>
    api.put(API_ENDPOINTS.USERS.BY_ID(id), data),
  toggleUserStatus: (id: string) =>
    api.put(API_ENDPOINTS.USERS.TOGGLE_STATUS(id)),
  activateUser: (id: string) => api.put(API_ENDPOINTS.USERS.ACTIVATE(id)),
  deactivateUser: (id: string) => api.put(API_ENDPOINTS.USERS.DEACTIVATE(id)),
  deleteUser: (id: string) => api.delete(API_ENDPOINTS.USERS.BY_ID(id)),
  updateProfile: (data: any) =>
    api.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, data),
  getMe: () => api.get(API_ENDPOINTS.USERS.ME),
  uploadUserFile: (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) {
      formData.append("folder", folder);
    }
    return api.post("/users/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getReviews: (userId: string) => api.get(`/users/${userId}/reviews`),
};

// Vendor APIs
export const vendorAPI = {
  register: (vendorData: any) =>
    api.post(API_ENDPOINTS.VENDORS.REGISTER, vendorData),
  login: (email: string, password: string) =>
    api.post(API_ENDPOINTS.VENDORS.LOGIN, { email, password }),
  getAllVendors: () => api.get(API_ENDPOINTS.VENDORS.BASE),
  getPaginatedVendors: (params?: any) =>
    api.get("/vendors/admin/paginated", { params }),
  getVendorById: (id: string) => api.get(API_ENDPOINTS.VENDORS.BY_ID(id)),
  createVendor: (vendorData: any) =>
    api.post("/vendors/admin/create", vendorData),
  updateVendor: (id: string, data: any) =>
    api.put(API_ENDPOINTS.VENDORS.BY_ID(id), data),
  activateVendor: (id: string) => api.put(API_ENDPOINTS.VENDORS.ACTIVATE(id)),
  deactivateVendor: (id: string) =>
    api.put(API_ENDPOINTS.VENDORS.DEACTIVATE(id)),
  deleteVendor: (id: string) => api.delete(API_ENDPOINTS.VENDORS.BY_ID(id)),
  updateProfile: (data: any) =>
    api.put(API_ENDPOINTS.VENDORS.UPDATE_PROFILE, data),
  verifyDocument: (id: string, documentKey: string, status: string, rejectionReason?: string) =>
    api.put(`/vendors/${id}/verify-document`, { documentKey, status, rejectionReason }),
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/vendors/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getReviews: (vendorId: string) => api.get(`/vendors/${vendorId}/reviews`),
  getIdCardDetails: (vendorId: string) => api.get(`/vendors/${vendorId}/id-card`),
};

// Service APIs
export const serviceAPI = {
  getAllServices: () => api.get("/services/admin/all"),
  getPublicServices: () => api.get("/services"),
  getPaginatedServices: (params?: any) =>
    api.get("/services/admin/paginated", { params }),
  getServiceById: (id: string) => api.get(API_ENDPOINTS.SERVICES.BY_ID(id)),
  getVendorServices: () => api.get(API_ENDPOINTS.SERVICES.BY_VENDOR),
  createService: (serviceData: any) =>
    api.post("/services/admin/create", serviceData),
  updateService: (id: string, serviceData: any) =>
    api.put(`/services/admin/${id}`, serviceData),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/services/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// Category APIs
export const categoryAPI = {
  getAllCategories: () => api.get("/categories"),
  createCategory: (name: string) => api.post("/categories", { name }),
};

// Booking APIs
export const bookingAPI = {
  getAllBookings: (params?: any) =>
    api.get(API_ENDPOINTS.BOOKINGS.ADMIN_ALL, { params }),
  getBookingById: (id: string) => api.get(API_ENDPOINTS.BOOKINGS.BY_ID(id)),
  createBooking: (bookingData: any) =>
    api.post(API_ENDPOINTS.BOOKINGS.CREATE, bookingData),
  getUserBookings: (params?: any) => api.get(API_ENDPOINTS.BOOKINGS.USER_BOOKINGS, { params }),
  submitReview: (bookingId: string, rating: number, reviewText: string) =>
    api.post(`/bookings/${bookingId}/review/vendor`, { rating, reviewText }),
  submitUserReview: (bookingId: string, rating: number, reviewText: string) =>
    api.post(`/bookings/${bookingId}/review/user`, { rating, reviewText }),
  getVendorBookings: () => api.get(API_ENDPOINTS.BOOKINGS.VENDOR_BOOKINGS),
  getAvailableBookings: () => api.get(API_ENDPOINTS.BOOKINGS.AVAILABLE),
  acceptBooking: (id: string) => api.put(API_ENDPOINTS.BOOKINGS.ACCEPT(id)),
  startService: (id: string) => api.put(API_ENDPOINTS.BOOKINGS.START(id)),
  completeService: (id: string) => api.put(API_ENDPOINTS.BOOKINGS.COMPLETE(id)),
  cancelBooking: (id: string, reason?: string) =>
    api.put(API_ENDPOINTS.BOOKINGS.CANCEL(id), { reason }),
  rescheduleBooking: (
    id: string,
    newDate: string,
    newTime: string,
    reason?: string,
  ) => api.put(`/bookings/${id}/reschedule`, { newDate, newTime, reason }),
  updateBookingStatus: (id: string, status: string) =>
    api.put(API_ENDPOINTS.BOOKINGS.UPDATE_STATUS(id), { status }),
  updateBooking: (id: string, bookingData: any) =>
    api.put(`/bookings/${id}`, bookingData),
  addBookingNote: (id: string, text: string) =>
    api.post(`/bookings/${id}/notes`, { text }),
  updatePrescription: (
    id: string,
    prescriptionData: any,
    prescriptionType: string,
  ) =>
    api.put(`/bookings/${id}/prescription`, {
      prescriptionData,
      prescriptionType,
    }),
  updatePrescriptionSummary: (id: string, summary: string) =>
    api.put(`/bookings/${id}/prescription-summary`, { summary }),
  updateRequestedItems: (id: string, requestedItems: any[]) =>
    api.put(`/bookings/${id}/requested-items`, { requestedItems }),
  updateRequestedItemStatus: (id: string, itemId: string, status: string) =>
    api.put(`/bookings/${id}/requested-items/${itemId}/status`, { status }),
};

// Prescription APIs
export const prescriptionAPI = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/prescriptions/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  uploadPrescription: (bookingId: string, prescriptionUrl: string) =>
    api.post(`/prescriptions/upload/${bookingId}`, { prescriptionUrl }),
  getPrescription: (bookingId: string) =>
    api.get(`/prescriptions/${bookingId}`),
  deletePrescription: (bookingId: string) =>
    api.delete(`/prescriptions/${bookingId}`),
};

// Report APIs
export const reportAPI = {
  generateReport: (bookingId: string, data: any) =>
    api.post(`/reports/generate/${bookingId}`, data),
  uploadReport: (
    bookingId: string,
    reportUrl: string,
    reportType?: string,
    reportName?: string,
  ) =>
    api.post(`/reports/upload/${bookingId}`, {
      reportUrl,
      reportType,
      reportName,
    }),
  getReport: (bookingId: string) => api.get(`/reports/${bookingId}`),
  getAllReports: () => api.get("/reports/admin/all"),
};

// Invoice APIs
export const invoiceAPI = {
  generateInvoice: (bookingId: string) =>
    api.get(`/invoices/${bookingId}`, { responseType: "blob" }),
  getInvoiceUrl: (bookingId: string) => api.get(`/invoices/url/${bookingId}`),
};

// Lab Partner APIs
export const labPartnerAPI = {
  getAllLabPartners: () => api.get("/lab-partners"),
  getLabPartnerById: (id: string) => api.get(`/lab-partners/${id}`),
  createLabPartner: (data: any) => api.post("/lab-partners", data),
  updateLabPartner: (id: string, data: any) =>
    api.put(`/lab-partners/${id}`, data),
  deleteLabPartner: (id: string) => api.delete(`/lab-partners/${id}`),
  uploadResult: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("result", file);
    return api.post(`/lab-partners/${id}/upload-result`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  updateStatus: (id: string, status: string) =>
    api.put(`/lab-partners/${id}/status`, { status }),
};

// Dashboard APIs
export const dashboardAPI = {
  getStats: () => api.get("/dashboard/stats"),
};

// Blog APIs
export const blogAPI = {
  getAllBlogs: (params?: any) => api.get(API_ENDPOINTS.BLOGS.BASE, { params }),
  adminGetAllBlogs: (params?: any) =>
    api.get(API_ENDPOINTS.BLOGS.ADMIN_ALL, { params }),
  getBlogById: (id: string) => api.get(API_ENDPOINTS.BLOGS.BY_ID(id)),
  getBlogBySlug: (slug: string) => api.get(API_ENDPOINTS.BLOGS.BY_SLUG(slug)),
  getBlogsByCategory: (category: string) =>
    api.get(API_ENDPOINTS.BLOGS.BY_CATEGORY(category)),
  searchBlogs: (query: string) =>
    api.get(API_ENDPOINTS.BLOGS.SEARCH, { params: { q: query } }),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/blogs/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  createBlog: (blogData: any) => api.post(API_ENDPOINTS.BLOGS.BASE, blogData),
  updateBlog: (id: string, blogData: any) =>
    api.put(API_ENDPOINTS.BLOGS.BY_ID(id), blogData),
  deleteBlog: (id: string) => api.delete(API_ENDPOINTS.BLOGS.BY_ID(id)),
  toggleBlogStatus: (id: string) =>
    api.put(API_ENDPOINTS.BLOGS.TOGGLE_STATUS(id)),
  toggleFeaturedStatus: (id: string) =>
    api.put(API_ENDPOINTS.BLOGS.TOGGLE_FEATURED(id)),
  likeBlog: (id: string) => api.put(API_ENDPOINTS.BLOGS.LIKE(id)),
};

// Gallery APIs
export const galleryAPI = {
  getGallery: () => api.get("/gallery"),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/gallery/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteImage: (publicId: string) => api.delete(`/gallery/${encodeURIComponent(publicId)}`),
};

// Hero APIs
export const heroAPI = {
  getHero: () => api.get("/hero"),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/hero/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  deleteImage: (publicId: string) => api.delete(`/hero/${encodeURIComponent(publicId)}`),
};

export const adminSettingAPI = {
  getAllSettings: () => api.get("/admin-settings/all"),
  getSettingById: (id: string) => api.get(`/admin-settings/${id}`),
  createSetting: (data: any) => api.post("/admin-settings/create", data),
  updateSetting: (id: string, data: any) =>
    api.put(`/admin-settings/update/${id}`, data),
  deleteSetting: (id: string) => api.delete(`/admin-settings/delete/${id}`),
};

// Vendor Service Request APIs
export const vendorServiceRequestAPI = {
  createRequest: (services: string[], vendorId?: string) =>
    api.post(API_ENDPOINTS.VENDOR_SERVICE_REQUESTS.CREATE, {
      services,
      vendorId,
    }),
  getMyRequests: () =>
    api.get(API_ENDPOINTS.VENDOR_SERVICE_REQUESTS.MY_REQUESTS),
  getAllRequests: (params?: any) =>
    api.get(API_ENDPOINTS.VENDOR_SERVICE_REQUESTS.GET_ALL, { params }),
  getRequestById: (id: string) =>
    api.get(API_ENDPOINTS.VENDOR_SERVICE_REQUESTS.BY_ID(id)),
  processRequest: (id: string, status: string, adminRemarks?: string) =>
    api.put(API_ENDPOINTS.VENDOR_SERVICE_REQUESTS.PROCESS(id), {
      status,
      adminRemarks,
    }),
};

// Notification APIs
export const notificationAPI = {
  getStats: () => api.get("/notifications/stats"),
  getDevices: (params?: any) => api.get("/notifications/devices", { params }),
  getTopics: () => api.get("/notifications/topics"),
  createTopic: (data: any) => api.post("/notifications/topics", data),
  deleteTopic: (id: string) => api.delete(`/notifications/topics/${id}`),
  subscribeToTopic: (
    topicKey: string,
    deviceIds: string[],
    customTokens?: string[],
  ) =>
    api.post("/notifications/topics/subscribe", {
      topicKey,
      deviceIds,
      customTokens,
    }),
  unsubscribeFromTopic: (topicKey: string, deviceIds: string[]) =>
    api.post("/notifications/topics/unsubscribe", { topicKey, deviceIds }),
  sendNotification: (data: {
    title: string;
    body: string;
    targetCategory: string;
    imageUrl?: string;
  }) => api.post("/notifications/send", data),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return api.post("/notifications/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default api;
