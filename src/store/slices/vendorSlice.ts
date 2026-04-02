import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Vendor {
  _id: string;
  name: string;
  email: string;
  phone: string;
  businessName: string;
  businessType: string;
  servicesOffered: string[];
  address: string;
  city: string;
  state: string;
  pincode: string;
  isVerified: boolean;
  isActive: boolean;
  verificationStatus: string;
  rating: number;
  createdAt: string;
}

interface VendorState {
  vendors: Vendor[];
  loading: boolean;
  error: string | null;
}

const initialState: VendorState = {
  vendors: [],
  loading: false,
  error: null,
};

const vendorSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {
    setVendors: (state, action: PayloadAction<Vendor[]>) => {
      state.vendors = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    updateVendorStatus: (state, action: PayloadAction<{ vendorId: string; isActive: boolean; isVerified: boolean }>) => {
      const vendor = state.vendors.find(v => v._id === action.payload.vendorId);
      if (vendor) {
        vendor.isActive = action.payload.isActive;
        vendor.isVerified = action.payload.isVerified;
        vendor.verificationStatus = action.payload.isActive ? 'verified' : 'pending';
      }
    },
    addVendor: (state, action: PayloadAction<Vendor>) => {
      console.log('Redux addVendor called with:', action.payload);
      console.log('Current vendors count:', state.vendors.length);
      state.vendors.unshift(action.payload);
      console.log('New vendors count:', state.vendors.length);
    },
    updateVendor: (state, action: PayloadAction<Vendor>) => {
      console.log('Redux updateVendor called with:', action.payload);
      const index = state.vendors.findIndex(v => v._id === action.payload._id);
      console.log('Vendor found at index:', index);
      if (index !== -1) {
        state.vendors[index] = action.payload;
        console.log('Vendor updated at index:', index);
      }
    },
    removeVendor: (state, action: PayloadAction<string>) => {
      console.log('Redux removeVendor called with ID:', action.payload);
      state.vendors = state.vendors.filter(v => v._id !== action.payload);
      console.log('Vendors after removal:', state.vendors.length);
    },
  },
});

export const { setVendors, setLoading, setError, updateVendorStatus, addVendor, updateVendor, removeVendor } = vendorSlice.actions;
export default vendorSlice.reducer;
