import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  age: number;
  gender: string;
  address: string;
  pincode: string;
  isActive: boolean;
  createdAt: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
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
    updateUserStatus: (state, action: PayloadAction<{ userId: string; isActive: boolean }>) => {
      const user = state.users.find(u => u._id === action.payload.userId);
      if (user) {
        user.isActive = action.payload.isActive;
      }
    },
  },
});

export const { setUsers, setLoading, setError, updateUserStatus } = userSlice.actions;
export default userSlice.reducer;
