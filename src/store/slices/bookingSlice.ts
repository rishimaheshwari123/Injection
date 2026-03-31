import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Booking {
  _id: string;
  patientName: string;
  age: number;
  sex: string;
  address: string;
  pincode: string;
  email: string;
  selectedServices: Array<{
    serviceId: string;
    serviceName: string;
    price: number;
    quantity: number;
  }>;
  subtotal: number;
  gstAmount: number;
  grandTotal: number;
  preferredTimeSlot: string;
  staffPreference: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  vendorId?: {
    _id: string;
    businessName: string;
    name: string;
  };
  bookingStatus: string;
  createdAt: string;
}

interface BookingState {
  bookings: Booking[];
  loading: boolean;
  error: string | null;
}

const initialState: BookingState = {
  bookings: [],
  loading: false,
  error: null,
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    setBookings: (state, action: PayloadAction<Booking[]>) => {
      state.bookings = action.payload;
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

export const { setBookings, setLoading, setError } = bookingSlice.actions;
export default bookingSlice.reducer;
