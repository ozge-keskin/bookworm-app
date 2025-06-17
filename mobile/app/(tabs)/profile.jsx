import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Switch,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../contexts/ThemeContext";

export default function Profile() {
  const { user, logout, updatePassword, updateUsername } = useAuthStore();
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();

  // Modal states
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [usernameModalVisible, setUsernameModalVisible] = useState(false);

  // Password change form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Username change form
  const [newUsername, setNewUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const handleLogout = async () => {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinizden emin misiniz?",
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Çıkış Yap",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/onboarding");
          },
        },
      ]
    );
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Hata", "Tüm alanları doldurun");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Hata", "Yeni şifreler eşleşmiyor");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Hata", "Yeni şifre en az 6 karakter olmalıdır");
      return;
    }

    setPasswordLoading(true);
    const result = await updatePassword(currentPassword, newPassword);
    setPasswordLoading(false);

    if (result.success) {
      Alert.alert("Başarılı", result.message);
      setPasswordModalVisible(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      Alert.alert("Hata", result.error);
    }
  };

  const handleUsernameChange = async () => {
    if (!newUsername) {
      Alert.alert("Hata", "Yeni kullanıcı adını girin");
      return;
    }

    if (newUsername.length < 3) {
      Alert.alert("Hata", "Kullanıcı adı en az 3 karakter olmalıdır");
      return;
    }

    if (newUsername === user.username) {
      Alert.alert("Hata", "Yeni kullanıcı adı mevcut kullanıcı adı ile aynı");
      return;
    }

    setUsernameLoading(true);
    const result = await updateUsername(newUsername);
    setUsernameLoading(false);

    if (result.success) {
      Alert.alert("Başarılı", result.message);
      setUsernameModalVisible(false);
      setNewUsername("");
    } else {
      Alert.alert("Hata", result.error);
    }
  };
  const styles = {
    container: {
      flex: 1,
      backgroundColor: theme.background,
      paddingBottom: 100, // Add space for floating tab bar
    },
    // Logged in user styles
    profileHeader: {
      alignItems: "center",
      paddingVertical: 30,
      paddingHorizontal: 20,
    },
    avatarContainer: {
      marginBottom: 16,
    },
    welcomeText: {
      fontSize: 24,
      fontWeight: "700",
      color: theme.textPrimary,
      textAlign: "center",
    },
    userInfoContainer: {
      backgroundColor: theme.cardBackground,
      marginHorizontal: 20,
      borderRadius: 16,
      padding: 20,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    editableInfoItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },    themeItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 16,
    },
    infoTextContainer: {
      marginLeft: 12,
      flex: 1,
    },
    infoLabel: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.textPrimary,
    },
    themeLabel: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.textPrimary,
    },
    editButton: {
      padding: 8,
    },
    infoItemLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContainer: {
      backgroundColor: theme.modalBackground,
      borderRadius: 16,
      padding: 0,
      width: "90%",
      maxWidth: 400,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.textPrimary,
    },
    modalCloseButton: {
      padding: 4,
    },
    modalContent: {
      padding: 20,
    },
    inputContainer: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.textSecondary,
      marginBottom: 8,
    },
    modalInput: {
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: theme.textPrimary,
    },
    modalButtonContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 24,
      gap: 12,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    modalCancelButton: {
      backgroundColor: theme.cardBackground,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalCancelButtonText: {
      color: theme.textSecondary,
      fontSize: 16,
      fontWeight: "600",
    },
    modalSaveButton: {
      backgroundColor: theme.primary,
    },    modalSaveButtonText: {
      color: theme.white,
      fontSize: 16,
      fontWeight: "600",
    },
    // Action button styles
    actionsContainer: {
      paddingHorizontal: 20,
      paddingTop: 30,
    },
    logoutButton: {
      backgroundColor: "#e74c3c",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 14,
      borderRadius: 12,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3,
    },
    logoutButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
    buttonIcon: {
      marginRight: 8,
    },
    // Auth screen styles (when not logged in)
    authContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    authHeader: {
      alignItems: "center",
      marginBottom: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.textPrimary,
      marginTop: 16,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 22,
    },
    authButtonsContainer: {
      width: "100%",
      maxWidth: 300,
    },
    authButton: {
      backgroundColor: theme.primary,
      paddingVertical: 16,
      paddingHorizontal: 30,
      borderRadius: 12,
      marginBottom: 16,
      alignItems: "center",
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3,
    },
    authButtonText: {
      color: theme.white,
      fontSize: 18,
      fontWeight: "600",
    },
    loginButton: {
      backgroundColor: theme.white,
      borderWidth: 2,
      borderColor: theme.primary,
    },
    loginButtonText: {
      color: theme.primary,
    },
  };

  // If user is logged in, show profile info
  if (user) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color={theme.primary} />
          </View>
          <Text style={styles.welcomeText}>Hoş Geldiniz!</Text>
        </View>

        <View style={styles.userInfoContainer}>
          <View style={styles.editableInfoItem}>
            <View style={styles.infoItemLeft}>
              <Ionicons
                name="person-outline"
                size={20}
                color={theme.textSecondary}
              />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Kullanıcı Adı</Text>
                <Text style={styles.infoValue}>
                  {user.username || "Belirtilmemiş"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => {
                setNewUsername(user.username || "");
                setUsernameModalVisible(true);
              }}
            >
              <Ionicons name="create-outline" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.editableInfoItem}>
            <View style={styles.infoItemLeft}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={theme.textSecondary}
              />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Şifre</Text>
                <Text style={styles.infoValue}>••••••••</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setPasswordModalVisible(true)}
            >
              <Ionicons name="create-outline" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.infoItem}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={theme.textSecondary}
            />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>E-posta</Text>
              <Text style={styles.infoValue}>
                {user.email || "Belirtilmemiş"}
              </Text>
            </View>
          </View>

          <View style={styles.themeItem}>
            <View style={styles.infoTextContainer}>
              <Text style={styles.themeLabel}>
                {isDarkMode ? "Koyu Tema" : "Açık Tema"}
              </Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={isDarkMode ? theme.white : theme.white}
              ios_backgroundColor={theme.border}
            />
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons
              name="log-out-outline"
              size={20}
              color="#fff"
              style={styles.buttonIcon}
            />
            <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
          </TouchableOpacity>
        </View>

        {/* Password Change Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={passwordModalVisible}
          onRequestClose={() => setPasswordModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Şifre Değiştir</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setPasswordModalVisible(false)}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Mevcut Şifre</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Mevcut şifrenizi girin"
                    secureTextEntry
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholderTextColor={theme.placeholderText}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Yeni Şifre</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Yeni şifrenizi girin"
                    secureTextEntry
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholderTextColor={theme.placeholderText}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Yeni Şifre Tekrar</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Yeni şifrenizi tekrar girin"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholderTextColor={theme.placeholderText}
                  />
                </View>

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setPasswordModalVisible(false)}
                  >
                    <Text style={styles.modalCancelButtonText}>İptal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSaveButton]}
                    onPress={handlePasswordChange}
                    disabled={passwordLoading}
                  >
                    {passwordLoading ? (
                      <ActivityIndicator color={theme.white} size="small" />
                    ) : (
                      <Text style={styles.modalSaveButtonText}>Kaydet</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Username Change Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={usernameModalVisible}
          onRequestClose={() => setUsernameModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Kullanıcı Adı Değiştir</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setUsernameModalVisible(false)}
                >
                  <Ionicons
                    name="close"
                    size={24}
                    color={theme.textSecondary}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.modalContent}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Yeni Kullanıcı Adı</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="Yeni kullanıcı adınızı girin"
                    value={newUsername}
                    onChangeText={setNewUsername}
                    placeholderTextColor={theme.placeholderText}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.modalButtonContainer}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={() => setUsernameModalVisible(false)}
                  >
                    <Text style={styles.modalCancelButtonText}>İptal</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalSaveButton]}
                    onPress={handleUsernameChange}
                    disabled={usernameLoading}
                  >
                    {usernameLoading ? (
                      <ActivityIndicator color={theme.white} size="small" />
                    ) : (
                      <Text style={styles.modalSaveButtonText}>Kaydet</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // If user is not logged in, show auth buttons
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.authContainer}>
        <View style={styles.authHeader}>
          <Ionicons
            name="person-circle-outline"
            size={100}
            color={theme.textSecondary}
          />
          <Text style={styles.title}>Profil</Text>
          <Text style={styles.subtitle}>
            Hesabınıza giriş yapın veya yeni hesap oluşturun
          </Text>
        </View>

        <View style={styles.authButtonsContainer}>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity style={styles.authButton}>
              <Text style={styles.authButtonText}>Kayıt Ol</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)" asChild>
            <TouchableOpacity style={[styles.authButton, styles.loginButton]}>
              <Text style={[styles.authButtonText, styles.loginButtonText]}>
                Giriş Yap
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
