import axios from 'axios';
import { API_CONFIG, API_ENDPOINTS } from '../config/api.config';

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) => 
    api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password }),
  register: (userData: any) => 
    api.post(API_ENDPOINTS.AUTH.REGISTER, userData),
};

// User APIs
export const userAPI = {
  getAllUsers: () => api.get(API_ENDPOINTS.USERS.BASE),
  getUserById: (id: string) => api.get(API_ENDPOINTS.USERS.BY_ID(id)),
  updateUser: (id: string, data: any) => api.put(API_ENDPOINTS.USERS.BY_ID(id), data),
  toggleUserStatus: (id: string) => api.put(API_ENDPOINTS.USERS.TOGGLE_STATUS(id)),
  activateUser: (id: string) => api.put(API_ENDPOINTS.USERS.ACTIVATE(id)),
  deactivateUser: (id: string) => api.put(API_ENDPOINTS.USERS.DEACTIVATE(id)),
  updateProfile: (data: any) => api.put(API_ENDPOINTS.USERS.UPDATE_PROFILE, data),
  getMe: () => api.get(API_ENDPOINTS.USERS.ME),
};

// Vendor APIs
export const vendorAPI = {
  register: (vendorData: any) => api.post(API_ENDPOINTS.VENDORS.REGISTER, vendorData),
  login: (email: string, password: string) => 
    api.post(API_ENDPOINTS.VENDORS.LOGIN, { email, password }),
  getAllVendors: () => api.get(API_ENDPOINTS.VENDORS.BASE),
  getVendorById: (id: string) => api.get(API_ENDPOINTS.VENDORS.BY_ID(id)),
  activateVendor: (id: string) => api.put(API_ENDPOINTS.VENDORS.ACTIVATE(id)),
  deactivateVendor: (id: string) => api.put(API_ENDPOINTS.VENDORS.DEACTIVATE(id)),
  updateProfile: (data: any) => api.put(API_ENDPOINTS.VENDORS.UPDATE_PROFILE, data),
};

// Service APIs
export const serviceAPI = {
  getAllServices: () => api.get(API_ENDPOINTS.SERVICES.BASE),
  getServiceById: (id: string) => api.get(API_ENDPOINTS.SERVICES.BY_ID(id)),
  getVendorServices: () => api.get(API_ENDPOINTS.SERVICES.BY_VENDOR),
  createService: (serviceData: any) => api.post(API_ENDPOINTS.SERVICES.CREATE, serviceData),
};

// Booking APIs
export const bookingAPI = {
  getAllBookings: () => api.get(API_ENDPOINTS.BOOKINGS.ADMIN_ALL),
  getBookingById: (id: string) => api.get(API_ENDPOINTS.BOOKINGS.BY_ID(id)),
  createBooking: (bookingData: any) => api.post(API_ENDPOINTS.BOOKINGS.CREATE, bookingData),
  getUserBookings: () => api.get(API_ENDPOINTS.BOOKINGS.USER_BOOKINGS),
  getVendorBookings: () => api.get(API_ENDPOINTS.BOOKINGS.VENDOR_BOOKINGS),
  getAvailableBookings: () => api.get(API_ENDPOINTS.BOOKINGS.AVAILABLE),
  acceptBooking: (id: string) => api.put(API_ENDPOINTS.BOOKINGS.ACCEPT(id)),
  startService: (id: string) => api.put(API_ENDPOINTS.BOOKINGS.START(id)),
  completeService: (id: string) => api.put(API_ENDPOINTS.BOOKINGS.COMPLETE(id)),
  cancelBooking: (id: string, reason?: string) => 
    api.put(API_ENDPOINTS.BOOKINGS.CANCEL(id), { reason }),
  updateBookingStatus: (id: string, status: string) => 
    api.put(API_ENDPOINTS.BOOKINGS.UPDATE_STATUS(id), { status }),
};

// Prescription APIs
export const prescriptionAPI = {
  uploadImage: (image: string) => api.post('/prescriptions/upload-image', { image }),
  uploadPrescription: (bookingId: string, prescriptionUrl: string) => 
    api.post(`/prescriptions/upload/${bookingId}`, { prescriptionUrl }),
  getPrescription: (bookingId: string) => api.get(`/prescriptions/${bookingId}`),
  deletePrescription: (bookingId: string) => api.delete(`/prescriptions/${bookingId}`),
};

// Report APIs
export const reportAPI = {
  generateReport: (bookingId: string, data: any) => 
    api.post(`/reports/generate/${bookingId}`, data),
  uploadReport: (bookingId: string, reportUrl: string) => 
    api.post(`/reports/upload/${bookingId}`, { reportUrl }),
  getReport: (bookingId: string) => api.get(`/reports/${bookingId}`),
  getAllReports: () => api.get('/reports/admin/all'),
};

// Invoice APIs
export const invoiceAPI = {
  generateInvoice: (bookingId: string) => 
    api.get(`/invoices/${bookingId}`, { responseType: 'blob' }),
  getInvoiceUrl: (bookingId: string) => api.get(`/invoices/url/${bookingId}`),
};

export default api;
