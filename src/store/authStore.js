import { create } from 'zustand';
import { getCurrentSessionUser, logoutUser, loginWithEmail } from '../firebase/auth';

export const useAuthStore = create((set, get) => ({
  user: getCurrentSessionUser(),
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, isLoading: false, error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const user = await loginWithEmail(email, password);
      set({ user, isLoading: false, error: null });
      return user;
    } catch (err) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    await logoutUser();
    set({ user: null, isLoading: false, error: null });
  }
}));
