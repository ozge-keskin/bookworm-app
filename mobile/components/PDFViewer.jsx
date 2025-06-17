import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { useTheme } from "../contexts/ThemeContext";

export default function PDFViewer() {
  const { pdfUrl, title } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { theme, isDarkMode } = useTheme();
  const router = useRouter();

  const handleLoadStart = () => {
    setLoading(true);
    setError(false);
  };

  const handleLoadEnd = () => {
    setLoading(false);
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView error:", nativeEvent);
    setLoading(false);
    setError(true);
  };

  const openInBrowser = async () => {
    try {
      const supported = await Linking.canOpenURL(pdfUrl);
      if (supported) {
        await Linking.openURL(pdfUrl);
      } else {
        Alert.alert("Hata", "URL açılamıyor.");
      }
    } catch (error) {
      Alert.alert("Hata", "PDF dış tarayıcıda açılamadı.");
    }
  };

  const retryWithDirectUrl = () => {
    setError(false);
    setLoading(true);
    setUseAlternative(!useAlternative);
  };

  const goBack = () => {
    router.back();
  };

  // Create Google Docs Viewer URL for better PDF display
  const googleDocsViewerUrl = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(
    pdfUrl
  )}`;

  // Alternative viewer URLs for fallback
  const mozillaPdfUrl = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(
    pdfUrl
  )}`;

  const [useAlternative, setUseAlternative] = useState(false);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.primary}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title || "PDF Görüntüleyici"}
        </Text>
        <TouchableOpacity onPress={openInBrowser} style={styles.browserButton}>
          <Ionicons name="open-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* PDF Content */}
      <View
        style={[styles.pdfContainer, { backgroundColor: theme.background }]}
      >
        {loading && (
          <View
            style={[
              styles.loadingContainer,
              { backgroundColor: `${theme.background}E6` },
            ]}
          >
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textPrimary }]}>
              PDF yükleniyor...
            </Text>
          </View>
        )}

        {!error ? (
          <WebView
            source={{
              uri: useAlternative ? mozillaPdfUrl : googleDocsViewerUrl,
            }}
            style={styles.webview}
            onLoadStart={handleLoadStart}
            onLoadEnd={handleLoadEnd}
            onError={handleError}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequireUserAction={false}
          />
        ) : (
          <View style={styles.errorContainer}>
            <Ionicons
              name="document-text-outline"
              size={64}
              color={theme.textSecondary}
            />
            <Text style={[styles.errorTitle, { color: theme.textPrimary }]}>
              PDF Yüklenemedi
            </Text>
            <Text style={[styles.errorText, { color: theme.textSecondary }]}>
              Dosya yüklenirken bir sorun oluştu. Dış tarayıcıda açmayı deneyin.
            </Text>
            <TouchableOpacity
              onPress={openInBrowser}
              style={[styles.errorButton, { backgroundColor: theme.primary }]}
            >
              <Ionicons
                name="open-outline"
                size={16}
                color="#fff"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.errorButtonText}>Tarayıcıda Aç</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={retryWithDirectUrl}
              style={[
                styles.errorButton,
                styles.secondaryButton,
                { borderColor: theme.primary },
              ]}
            >
              <Ionicons
                name="refresh-outline"
                size={16}
                color={theme.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.errorButtonText,
                  styles.secondaryButtonText,
                  { color: theme.primary },
                ]}
              >
                {useAlternative ? "Google Viewer Dene" : "PDF.js Dene"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={goBack}
              style={[
                styles.errorButton,
                styles.secondaryButton,
                { borderColor: theme.primary },
              ]}
            >
              <Text
                style={[
                  styles.errorButtonText,
                  styles.secondaryButtonText,
                  { color: theme.primary },
                ]}
              >
                Geri Dön
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  browserButton: {
    padding: 8,
    marginLeft: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginRight: 8,
  },
  pdfContainer: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  errorButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  errorButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    // Color will be set inline with theme
  },
});
