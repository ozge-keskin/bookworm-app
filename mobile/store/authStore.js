import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  API_ENDPOINTS,
  testNetworkConnection,
  logAPIConfig,
} from "../constants/api";

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isHydrated: false, // <-- BURASI EKLENDİ
  hasCompletedOnboarding: false, // Add onboarding state
  register: async (username, email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Bir şeyler yanlış gitti");

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      set({
        token: data.token,
        user: data.user,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },
  login: async (email, password) => {
    set({ isLoading: true });

    // Debug API configuration
    logAPIConfig();

    try {
      // First test network connectivity
      console.log("Testing network connection before login...");
      const networkTest = await testNetworkConnection();
      if (!networkTest.success) {
        throw new Error(
          `Network connectivity test failed: ${networkTest.error}`
        );
      }

      console.log("Network test passed, attempting login...");
      console.log("Login URL:", API_ENDPOINTS.LOGIN);

      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log("Login response status:", response.status);
      const data = await response.json();
      console.log("Login response data:", data);

      if (!response.ok)
        throw new Error(data.message || "Bir şeyler yanlış gitti");

      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      await AsyncStorage.setItem("token", data.token);

      set({
        token: data.token,
        user: data.user,
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      console.error("Login error details:", error);
      set({ isLoading: false });
      return { success: false, error: error.message };
    }
  },
  logout: async () => {
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("hasCompletedOnboarding");
      set({
        user: null,
        token: null,
        hasCompletedOnboarding: false,
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  },
  setOnboardingCompleted: async () => {
    try {
      await AsyncStorage.setItem("hasCompletedOnboarding", "true");
      set({ hasCompletedOnboarding: true });
    } catch (error) {
      console.error("Error setting onboarding completion:", error);
    }
  },

  resetOnboarding: async () => {
    try {
      await AsyncStorage.removeItem("hasCompletedOnboarding");
      set({ hasCompletedOnboarding: false });
    } catch (error) {
      console.error("Error resetting onboarding:", error);
    }
  },

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const user = await AsyncStorage.getItem("user");
      const hasCompletedOnboarding = await AsyncStorage.getItem(
        "hasCompletedOnboarding"
      );

      if (token && user) {
        set({
          token,
          user: JSON.parse(user),
          hasCompletedOnboarding: hasCompletedOnboarding === "true",
        });
      } else {
        set({
          hasCompletedOnboarding: hasCompletedOnboarding === "true",
        });
      }
    } catch (error) {
      console.error("checkAuth error:", error);
    } finally {
      set({ isHydrated: true }); // <-- HATA BURADA ÇIKIYORDU, ARTIK ÇIKMAYACAK
    }
  },

  updatePassword: async (currentPassword, newPassword) => {
    try {
      const { token } = useAuthStore.getState();
      if (!token) {
        return { success: false, error: "Oturum bulunamadı" };
      }

      const response = await fetch(API_ENDPOINTS.UPDATE_PASSWORD, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || "Şifre güncellenemedi" };
      }

      return { success: true, message: data.message };
    } catch (error) {
      console.error("Password update error:", error);
      return { success: false, error: "Ağ hatası" };
    }
  },

  updateUsername: async (username) => {
    try {
      const { token } = useAuthStore.getState();
      if (!token) {
        return { success: false, error: "Oturum bulunamadı" };
      }

      const response = await fetch(API_ENDPOINTS.UPDATE_USERNAME, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || "Kullanıcı adı güncellenemedi" };
      }

      // Update local user data
      await AsyncStorage.setItem("user", JSON.stringify(data.user));
      set({ user: data.user });

      return { success: true, message: data.message, user: data.user };
    } catch (error) {
      console.error("Username update error:", error);
      return { success: false, error: "Ağ hatası" };
    }
  },
}));
