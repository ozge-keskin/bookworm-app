import { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useAuthStore } from "../../store/authStore";
import { API_ENDPOINTS } from "../../constants/api";
import { useTheme } from "../../contexts/ThemeContext";

export default function Create() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfBase64, setPdfBase64] = useState(null);
  const [thumbnailImage, setThumbnailImage] = useState(null);
  const [thumbnailBase64, setThumbnailBase64] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { token } = useAuthStore();
  const { theme } = useTheme();

  // Dynamic styles based on theme
  const styles = {
    container: {
      flexGrow: 1,
      padding: 20,
      paddingBottom: 100, // Add space for floating tab bar
      backgroundColor: theme.background,
    },
    scrollViewStyle: {
      backgroundColor: theme.background,
    },
    card: {
      backgroundColor: theme.cardBackground,
      borderRadius: 16,
      padding: 24,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    header: {
      alignItems: "center",
      marginBottom: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.textPrimary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
    },
    form: {
      gap: 24,
    },
    formGroup: {
      gap: 8,
    },
    label: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.textPrimary,
      marginBottom: 8,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 16,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.textPrimary,
      paddingVertical: 16,
    },
    textArea: {
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      fontSize: 16,
      color: theme.textPrimary,
      height: 100,
      textAlignVertical: "top",
    },
    imagePicker: {
      backgroundColor: theme.inputBackground,
      borderWidth: 2,
      borderColor: theme.border,
      borderStyle: "dashed",
      borderRadius: 12,
      padding: 20,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 120,
    },
    pdfPreviewContainer: {
      alignItems: "center",
      gap: 8,
    },
    pdfFileName: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.textPrimary,
      textAlign: "center",
    },
    pdfFileSize: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    placeholderContainer: {
      alignItems: "center",
      gap: 12,
    },
    placeholderText: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
    },
    previewImage: {
      width: 200,
      height: 150,
      borderRadius: 8,
      marginTop: 12,
    },
    button: {
      backgroundColor: theme.primary,
      paddingVertical: 16,
      paddingHorizontal: 24,
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      elevation: 3,
    },
    buttonDisabled: {
      backgroundColor: theme.textSecondary,
      opacity: 0.6,
    },
    buttonText: {
      color: theme.white,
      fontSize: 16,
      fontWeight: "600",
    },
    buttonIcon: {
      marginRight: 8,
    },
    testButtonsContainer: {
      gap: 12,
      marginTop: 24,
    },
    testButton: {
      backgroundColor: theme.cardBackground,
      borderWidth: 2,
      borderColor: theme.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    testButtonText: {
      color: theme.primary,
      fontSize: 14,
      fontWeight: "600",
    },
  };

  // Test upload function (for debugging)
  const testUpload = async () => {
    if (!token) {
      Alert.alert("Hata", "Giriş yapmadan test yapamazsınız");
      return;
    }

    try {
      console.log("Testing upload with sample data...");
      const testData = {
        title: "Test Title",
        description: "Test Description",
        pdfBase64:
          "data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDYxMiA3OTJdL1BhcmVudCAyIDAgUi9SZXNvdXJjZXM8PC9Gb250PDwvRjEgNCAwIFI+Pj4+L0NvbnRlbnRzIDUgMCBSPj4KZW5kb2JqCjQgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvVGltZXMtUm9tYW4+PgplbmRvYmoKNSAwIG9iago8PC9MZW5ndGggNDQ+PgpzdHJlYW0KQlQKL0YxIDEyIFRmCjEwMCA3MDAgVGQKKFRlc3QgUERGKSBUagpFVApzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDI0NSAwMDAwMCBuIAowMDAwMDAwMzE4IDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA2L1Jvb3QgMSAwIFI+PgpzdGFydHhyZWYKNDEwCiUlRU9G", // Simple PDF base64
        pdfFileName: "test.pdf",
        pdfSize: 200,
      };

      const response = await fetch(`${API_ENDPOINTS.CREATE_BOOK}/test-upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(testData),
      });

      const data = await response.json();
      console.log("Test upload response:", data);

      if (response.ok) {
        Alert.alert("Test Başarılı ✅", JSON.stringify(data, null, 2));
      } else {
        Alert.alert("Test Hatası ❌", data.message || "Test failed");
      }
    } catch (error) {
      console.error("Test upload error:", error);
      Alert.alert("Test Hatası ❌", error.message);
    }
  };

  // Test connection function (for debugging)
  const testConnection = async () => {
    try {
      console.log("Testing connection to:", API_ENDPOINTS.BOOKS);
      console.log(
        "Using API base URL:",
        API_ENDPOINTS.BOOKS.replace("/api/books", "")
      );

      // First test server health
      const healthUrl = `${API_ENDPOINTS.BOOKS.replace(
        "/api/books",
        ""
      )}/api/health`;
      console.log("Testing health endpoint:", healthUrl);

      const healthResponse = await fetch(healthUrl);
      console.log("Health check status:", healthResponse.status);

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log("Health data:", healthData);

        // Then test books endpoint with auth
        if (token) {
          console.log("Testing authenticated books endpoint...");
          const booksResponse = await fetch(API_ENDPOINTS.BOOKS, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          console.log("Books endpoint status:", booksResponse.status);

          if (booksResponse.ok) {
            Alert.alert(
              "Test Başarılı ✅",
              "Sunucu bağlantısı ve kimlik doğrulama çalışıyor!"
            );
          } else {
            const errorData = await booksResponse.json();
            console.log("Books endpoint error:", errorData);
            Alert.alert(
              "Auth Test",
              `Books endpoint: ${booksResponse.status} - ${
                errorData.message || "Unknown error"
              }`
            );
          }
        } else {
          Alert.alert(
            "Test Uyarısı",
            "Sunucu bağlantısı çalışıyor ama giriş yapılmamış. Lütfen önce giriş yapın."
          );
        }
      } else {
        Alert.alert(
          "Test Hatası",
          `Server health check failed: ${healthResponse.status}`
        );
      }
    } catch (error) {
      console.error("Connection test error:", error);
      Alert.alert(
        "Test Error ❌",
        `Connection failed: ${error.message}\n\nTrying to connect to: ${API_ENDPOINTS.BOOKS}`
      );
    }
  };

  const pickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const selectedFile = result.assets[0];
        console.log("Selected PDF:", selectedFile);

        // Check file size (limit to 10MB for example)
        const maxSize = 10 * 1024 * 1024; // 10MB in bytes
        if (selectedFile.size > maxSize) {
          Alert.alert("Hata", "PDF dosyası 10MB'dan küçük olmalıdır");
          return;
        }

        // Read file as base64
        const base64 = await FileSystem.readAsStringAsync(selectedFile.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Create data URL for PDF
        const pdfDataUrl = `data:application/pdf;base64,${base64}`;

        setPdfFile(selectedFile);
        setPdfBase64(pdfDataUrl);

        Alert.alert("Başarılı", `PDF seçildi: ${selectedFile.name}`);
      }
    } catch (error) {
      console.error("PDF picker error:", error);
      Alert.alert("Hata", "PDF seçilirken bir hata oluştu");
    }
  };
  const pickThumbnailImage = async () => {
    try {
      // Request permissions for media library access
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert(
            "İzin Reddedildi",
            "Resim yüklemek için kamera rulosuna erişim izni gerekiyor"
          );
          return;
        }
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        // Set the image URI
        setThumbnailImage(result.assets[0].uri);

        if (result.assets[0].base64) {
          // Ensure proper data URL format for images
          const imageDataUrl = `data:image/jpeg;base64,${result.assets[0].base64}`;
          setThumbnailBase64(imageDataUrl);
          console.log(
            "✅ Thumbnail selected with base64 length:",
            result.assets[0].base64.length
          );
        } else {
          // Fallback: read file as base64
          try {
            const base64 = await FileSystem.readAsStringAsync(
              result.assets[0].uri,
              {
                encoding: FileSystem.EncodingType.Base64,
              }
            );
            const imageDataUrl = `data:image/jpeg;base64,${base64}`;
            setThumbnailBase64(imageDataUrl);
            console.log(
              "✅ Thumbnail selected with fallback base64 length:",
              base64.length
            );
          } catch (error) {
            console.error("❌ Error reading thumbnail as base64:", error);
            Alert.alert("Hata", "Resim işlenirken bir hata oluştu");
          }
        }
      }
    } catch (error) {
      console.error("Image picker error:", error);
      Alert.alert("Hata", "Resim seçilirken bir hata oluştu");
    }
  };
  const handleSubmit = async () => {
    if (!title || !description || !pdfBase64 || !pdfFile) {
      Alert.alert(
        "Hata",
        "Lütfen tüm zorunlu alanları doldurun (Başlık, Açıklama ve PDF)"
      );
      return;
    }

    if (!token) {
      Alert.alert("Hata", "Giriş yapmadan PDF yükleyemezsiniz");
      router.push("/(auth)");
      return;
    }

    // Check payload size to avoid network issues
    const requestPayload = {
      title,
      description,
      pdfBase64,
      pdfFileName: pdfFile.name,
      pdfSize: pdfFile.size,
      thumbnailImage: thumbnailBase64,
    };
    const payloadSize = JSON.stringify(requestPayload).length;
    const payloadSizeMB = payloadSize / (1024 * 1024);

    console.log(`Request payload size: ${payloadSizeMB.toFixed(2)} MB`);

    if (payloadSizeMB > 16) {
      Alert.alert(
        "Dosya Çok Büyük",
        `İstek boyutu ${payloadSizeMB.toFixed(
          2
        )} MB. Lütfen daha küçük bir PDF seçin (max ~10MB önerilir).`
      );
      return;
    }
    try {
      setLoading(true);

      console.log("=== PDF UPLOAD REQUEST START ===");
      console.log("API Endpoint:", API_ENDPOINTS.CREATE_BOOK);
      console.log("Request data:", {
        title,
        description: description.substring(0, 50) + "...",
        pdfFileName: pdfFile.name,
        pdfSize: pdfFile.size,
        pdfBase64Length: pdfBase64 ? pdfBase64.length : 0,
        hasThumbnail: !!thumbnailBase64,
        thumbnailLength: thumbnailBase64 ? thumbnailBase64.length : 0,
      });

      const response = await fetch(API_ENDPOINTS.CREATE_BOOK, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          pdfBase64,
          pdfFileName: pdfFile.name,
          pdfSize: pdfFile.size,
          thumbnailImage: thumbnailBase64, // Optional
        }),
      });
      console.log("Response status:", response.status);

      let data;
      try {
        data = await response.json();
        console.log("Response data:", data);
      } catch (parseError) {
        console.error("Failed to parse response JSON:", parseError);
        data = { message: "Sunucudan geçersiz yanıt" };
      }

      if (response.ok) {
        console.log("✅ PDF uploaded successfully, navigating to home...");
        Alert.alert("Başarılı", "PDF başarıyla yüklendi");
        // Reset form
        setTitle("");
        setDescription("");
        setPdfFile(null);
        setPdfBase64(null);
        setThumbnailImage(null);
        setThumbnailBase64(null);
        // Navigate to home tab
        console.log("About to navigate to /(tabs)/");
        router.replace("/(tabs)/");
      } else {
        console.error(
          "❌ Upload failed with status:",
          response.status,
          "Data:",
          data
        );
        Alert.alert(
          "Hata",
          data.message || `PDF yüklenirken hata (${response.status})`
        );
      }
    } catch (error) {
      console.error("Submit error:", error);

      // More specific error messages
      if (error.message && error.message.includes("Network request failed")) {
        Alert.alert(
          "Bağlantı Hatası",
          "Sunucuya bağlanılamadı. İnternet bağlantınızı kontrol edin ve tekrar deneyin."
        );
      } else if (error.message && error.message.includes("timeout")) {
        Alert.alert(
          "Zaman Aşımı",
          "İstek zaman aşımına uğradı. Lütfen tekrar deneyin."
        );
      } else if (error.message && error.message.includes("Unauthorized")) {
        Alert.alert(
          "Yetki Hatası",
          "Oturum süreniz dolmuş. Lütfen tekrar giriş yapın."
        );
        router.push("/(auth)");
      } else {
        // Improved error message handling
        const errorMessage = error.message || "Bilinmeyen bir hata oluştu";
        Alert.alert("Hata", `PDF yüklenirken hata: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.background }}
      edges={["top"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.background }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          style={styles.scrollViewStyle}
        >
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.title}>PDF Yükle</Text>
              <Text style={styles.subtitle}>PDF dosyalarınızı paylaşın</Text>
            </View>

            {/* FORM */}
            <View style={styles.form}>
              {/* DOCUMENT TITLE */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Başlık</Text>

                <View style={styles.inputContainer}>
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color={theme.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="PDF başlığını girin"
                    placeholderTextColor={theme.placeholderText}
                    value={title}
                    onChangeText={setTitle}
                  />
                </View>
              </View>
              {/* PDF FILE */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>PDF Dosyası *</Text>

                <TouchableOpacity onPress={pickPDF} style={styles.imagePicker}>
                  {pdfFile ? (
                    <View style={styles.pdfPreviewContainer}>
                      <Ionicons
                        name="document-text"
                        size={40}
                        color={theme.primary}
                      />
                      <Text style={styles.pdfFileName}>{pdfFile.name}</Text>
                      <Text style={styles.pdfFileSize}>
                        {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Ionicons
                        name="cloud-upload-outline"
                        size={40}
                        color={theme.textSecondary}
                      />
                      <Text style={styles.placeholderText}>
                        PDF seçmek için dokunun
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              {/* THUMBNAIL IMAGE (OPTIONAL) */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Kapak Resmi (Opsiyonel)</Text>

                <TouchableOpacity
                  onPress={pickThumbnailImage}
                  style={styles.imagePicker}
                >
                  {thumbnailImage ? (
                    <Image
                      source={{ uri: thumbnailImage }}
                      style={styles.previewImage}
                    />
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Ionicons
                        name="image-outline"
                        size={40}
                        color={theme.textSecondary}
                      />
                      <Text style={styles.placeholderText}>
                        Kapak resmi seçmek için dokunun
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
              {/* DESCRIPTION */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Açıklama</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="PDF hakkında kısa bir açıklama yazın..."
                  placeholderTextColor={theme.placeholderText}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
              </View>
              <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name="cloud-upload-outline"
                      size={20}
                      color={theme.white}
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.buttonText}>PDF Yükle</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
