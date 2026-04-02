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
    addBooking: (state, action: PayloadAction<Booking>) => {
      state.bookings.unshift(action.payload);
    },
    updateBooking: (state, action: PayloadAction<Booking>) => {
      const index = state.bookings.findIndex(b => b._id === action.payload._id);
      if (index !== -1) {
        state.bookings[index] = action.payload;
      }
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

export const { setBookings, addBooking, updateBooking, setLoading, setError } = bookingSlice.actions;
export default bookingSlice.reducer;
