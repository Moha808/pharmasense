import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const { user, isLoading, error, login, logout, switchDemoRole } = useAuthStore();
  
  return {
    user,
    role: user?.role || 'guest',
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff',
    isAuthenticated: Boolean(user),
    isLoading,
    error,
    login,
    logout,
    switchDemoRole
  };
}
