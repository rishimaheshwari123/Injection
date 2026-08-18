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
  city?: string;
  state?: string;
  pincode: string;
  longitude?: number;
  latitude?: number;
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
    addUser: (state, action: PayloadAction<User>) => {
      console.log('Redux addUser called with:', action.payload);
      console.log('Current users count:', state.users.length);
      state.users.unshift(action.payload);
      console.log('New users count:', state.users.length);
    },
    updateUser: (state, action: PayloadAction<User>) => {
      console.log('Redux updateUser called with:', action.payload);
      const index = state.users.findIndex(u => u._id === action.payload._id);
      console.log('User found at index:', index);
      if (index !== -1) {
        state.users[index] = action.payload;
        console.log('User updated at index:', index);
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter(u => u._id !== action.payload);
    },
  },
});

export const { setUsers, setLoading, setError, updateUserStatus, addUser, updateUser, removeUser } = userSlice.actions;
export default userSlice.reducer;
