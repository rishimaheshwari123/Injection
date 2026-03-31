import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Service {
  _id: string;
  serviceName: string;
  description: string;
  category: string;
  basePrice: number;
  duration: number;
  serviceType: string;
  vendorId: {
    _id: string;
    businessName: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
}

interface ServiceState {
  services: Service[];
  loading: boolean;
  error: string | null;
}

const initialState: ServiceState = {
  services: [],
  loading: false,
  error: null,
};

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    setServices: (state, action: PayloadAction<Service[]>) => {
      state.services = action.payload;
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
  },
});

export const { setServices, setLoading, setError } = serviceSlice.actions;
export default serviceSlice.reducer;
