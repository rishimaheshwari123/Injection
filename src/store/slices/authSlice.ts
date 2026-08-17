import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  isStaff?: boolean;
  rating?: number;
  totalReviews?: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  longitude?: number;
  latitude?: number;
  familyMembers?: any[];
  permissions?: {
    dashboard: boolean;
    users: boolean;
    vendors: boolean;
    services: boolean;
    bookings: boolean;
    prescriptions: boolean;
    reports: boolean;
    labPartners: boolean;
    insuranceClaims: boolean;
    faqs: boolean;
    coupons: boolean;
    supportTickets: boolean;
    contactInquiries: boolean;
    advertisements: boolean;
    staff: boolean;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      
      // Save to localStorage
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    updateUserInState: (state, action: PayloadAction<any>) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify({ ...state.user, ...action.payload }));
    },
  },
});

export const { loginSuccess, logout, setLoading, updateUserInState } = authSlice.actions;
export default authSlice.reducer;
