import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/store";
import { loginUser, registerUser, logoutUser } from "@/store/authSlice";
import { toast } from "react-toastify";

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, token, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  const login = async (email: string, password: string) => {
    try {
      const result = await dispatch(loginUser({ email, password }));

      if (loginUser.fulfilled.match(result)) {
        toast.success("Login successful!");
        router.push("/stakes");
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => {
    try {
      const result = await dispatch(registerUser(userData));

      if (registerUser.fulfilled.match(result)) {
        toast.success("Account created successfully!");
        router.push("/auth/login");
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutUser());
      router.push("/auth/login");
      toast.success("Logged out successfully");
      return true;
    } catch (error) {
      return false;
    }
  };

  const isAuthenticated = !!token;

  return {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
  };
};
