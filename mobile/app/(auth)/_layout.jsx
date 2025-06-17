import { Stack, useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../contexts/ThemeContext";
import CustomBackButton from "../../components/CustomBackButton";

export default function AuthLayout() {
  const router = useRouter();
  const { resetOnboarding } = useAuthStore();
  const { theme } = useTheme();

  const handleBackToOnboarding = async () => {
    await resetOnboarding();
    router.replace("/onboarding");
  };

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.background,
          height: 80,
        },
        headerTintColor: theme.textPrimary,
        headerTitle: "",
        headerShadowVisible: false,
        headerBackVisible: false,
        headerLeft: () => (
          <CustomBackButton
            onPress={handleBackToOnboarding}
            style={{ marginLeft: 8 }}
          />
        ),
        headerRight: () => null,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "",
          headerTitle: "",
        }}
      />
      <Stack.Screen
        name="signup"
        options={{
          title: "",
          headerTitle: "",
        }}
      />
    </Stack>
  );
}
