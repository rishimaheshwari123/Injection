export const API_CONFIG = {
  BASE_URL: "http://localhost:8080/api",
  // BASE_URL: "https://injection-hkgt.onrender.com/api",
  // BASE_URL: "https://api.prlthealthcare.com/api",
  TIMEOUT: 30000, // 30 seconds
};

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/users/login",
    REGISTER: "/users/register",
  },

  // OTP
  OTP: {
    SEND: "/otp/send",
    VERIFY: "/otp/verify",
  },

  // Users
  USERS: {
    BASE: "/users",
    ME: "/users/me",
    BY_ID: (id: string) => `/users/${id}`,
    TOGGLE_STATUS: (id: string) => `/users/${id}/toggle-status`,
    ACTIVATE: (id: string) => `/users/${id}/activate`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
    UPDATE_PROFILE: "/users/profile",
  },

  // Vendors
  VENDORS: {
    BASE: "/vendors",
    REGISTER: "/vendors/register",
    LOGIN: "/vendors/login",
    BY_ID: (id: string) => `/vendors/${id}`,
    ACTIVATE: (id: string) => `/vendors/${id}/activate`,
    DEACTIVATE: (id: string) => `/vendors/${id}/deactivate`,
    UPDATE_PROFILE: "/vendors/profile",
  },

  // Ambassadors
  AMBASSADORS: {
    BASE: "/ambassadors",
    REGISTER: "/ambassadors/register",
    LOGIN: "/ambassadors/login",
    ME: "/ambassadors/me",
    VENDORS: "/ambassadors/vendors",
    REGISTER_VENDOR: "/ambassadors/register-vendor",
    WALLET_HISTORY: "/ambassadors/wallet-history",
    WITHDRAW: "/ambassadors/withdraw",
    WITHDRAWALS: "/ambassadors/withdrawals",
    UPLOAD: "/ambassadors/upload",
    ADMIN_ALL: "/ambassadors/admin/all",
    ADMIN_BY_ID: (id: string) => `/ambassadors/admin/${id}`,
    ADMIN_TOGGLE_STATUS: (id: string) => `/ambassadors/admin/${id}/toggle-status`,
    ADMIN_VENDORS: (id: string) => `/ambassadors/admin/${id}/vendors`,
    ADMIN_WITHDRAWALS: "/ambassadors/admin/withdrawals/all",
    ADMIN_UPDATE_WITHDRAWAL: (ambassadorId: string, requestId: string) => `/ambassadors/admin/withdrawals/${ambassadorId}/${requestId}`
  },

  // Services
  SERVICES: {
    BASE: "/services",
    BY_ID: (id: string) => `/services/${id}`,
    BY_VENDOR: "/services/vendor/me",
    CREATE: "/services/create",
  },

  // Bookings
  BOOKINGS: {
    BASE: "/bookings",
    ADMIN_ALL: "/bookings/admin/all",
    BY_ID: (id: string) => `/bookings/${id}`,
    CREATE: "/bookings/create",
    USER_BOOKINGS: "/bookings/user/me",
    VENDOR_BOOKINGS: "/bookings/vendor/me",
    AVAILABLE: "/bookings/available",
    ACCEPT: (id: string) => `/bookings/${id}/accept`,
    START: (id: string) => `/bookings/${id}/start`,
    COMPLETE: (id: string) => `/bookings/${id}/complete`,
    CANCEL: (id: string) => `/bookings/${id}/cancel`,
    UPDATE_STATUS: (id: string) => `/bookings/${id}/status`,
  },

  // Blogs
  BLOGS: {
    BASE: "/blogs",
    ADMIN_ALL: "/blogs/admin/all",
    BY_ID: (id: string) => `/blogs/${id}`,
    BY_SLUG: (slug: string) => `/blogs/slug/${slug}`,
    BY_CATEGORY: (category: string) => `/blogs/category/${category}`,
    SEARCH: "/blogs/search",
    LIKE: (id: string) => `/blogs/${id}/like`,
    TOGGLE_STATUS: (id: string) => `/blogs/${id}/toggle-status`,
    TOGGLE_FEATURED: (id: string) => `/blogs/${id}/toggle-featured`,
  },

  // Vendor Service Requests
  VENDOR_SERVICE_REQUESTS: {
    BASE: "/vendor-service-requests",
    CREATE: "/vendor-service-requests/create",
    GET_ALL: "/vendor-service-requests/getAll",
    MY_REQUESTS: "/vendor-service-requests/my-requests",
    BY_ID: (id: string) => `/vendor-service-requests/${id}`,
    PROCESS: (id: string) => `/vendor-service-requests/${id}/process`,
  },
};
