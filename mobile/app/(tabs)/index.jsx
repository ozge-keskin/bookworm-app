import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuthStore } from "../../store/authStore";
import { API_ENDPOINTS } from "../../constants/api";
import * as Clipboard from "expo-clipboard";
import { useTheme } from "../../contexts/ThemeContext";

export default function Home() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const { token } = useAuthStore();
  const { theme } = useTheme();
  const router = useRouter();

  const createStyles = (theme) =>
    StyleSheet.create({      container: {
        flex: 1,
        backgroundColor: theme.background,
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 100, // Add space for floating tab bar
      },
      loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      },      loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: theme.textPrimary,
      },
      listContainer: {
        paddingBottom: 100, // Increase space for floating tab bar
      },
      emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
      },
      emptyText: {
        fontSize: 18,
        fontWeight: "600",
        color: theme.textPrimary,
        marginTop: 16,
        textAlign: "center",
      },
      emptySubText: {
        fontSize: 14,
        color: theme.textSecondary,
        marginTop: 8,
        textAlign: "center",
        lineHeight: 20,
      },
      pageTitle: {
        textAlign: "center",
        fontSize: 22,
        fontWeight: "700",
        color: theme.textPrimary,
        marginVertical: 10,
      },
      bookCard: {
        flexDirection: "row",
        backgroundColor: theme.cardBackground,
        borderRadius: 12,
        marginBottom: 18,
        shadowColor: theme.shadowColor,
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        overflow: "hidden",
        position: "relative",
      },
      deleteButton: {
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 10,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        borderRadius: 12,
        padding: 2,
      },
      bookImage: {
        width: 110,
        height: 150,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
      },
      bookInfo: {
        flex: 1,
        padding: 14,
        justifyContent: "center",
      },
      bookTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: theme.textPrimary,
      },
      bookAuthor: {
        fontSize: 14,
        fontWeight: "600",
        color: theme.textSecondary,
        marginTop: 4,
      },
      bookDescription: {
        fontSize: 12,
        color: theme.textSecondary,
        marginTop: 6,
        lineHeight: 16,
      },
      pdfButton: {
        marginTop: 10,
        backgroundColor: theme.primary,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
      },
      pdfButtonText: {
        color: "#fff",
        fontWeight: "700",
      },
      shareButton: {
        marginTop: 8,
        backgroundColor: "#2196F3",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
      },
      shareButtonText: {
        color: "#fff",
        fontWeight: "700",
      },
      modalContainer: {
        flex: 1,
        backgroundColor: theme.modalBackground,
      },
      modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        backgroundColor: theme.cardBackground,
      },
      modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: theme.textPrimary,
      },
      saveButton: {
        color: theme.primary,
        fontSize: 16,
        fontWeight: "600",
      },
      modalContent: {
        flex: 1,
        padding: 20,
      },
      inputGroup: {
        marginBottom: 20,
      },
      inputLabel: {
        fontSize: 16,
        fontWeight: "600",
        color: theme.textPrimary,
        marginBottom: 8,
      },
      input: {
        backgroundColor: theme.inputBackground,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: theme.textPrimary,
      },
      textArea: {
        height: 100,
        textAlignVertical: "top",
      },
    });

  const styles = createStyles(theme);

  useEffect(() => {
    fetchBooks();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBooks();
    setRefreshing(false);
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.GET_BOOKS, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("API Response:", data);
        // Handle both paginated response and direct array
        const booksArray = data.books || data;
        setBooks(booksArray);
      } else {
        // Fallback to sample data if API fails
        setBooks([
          {
            id: "1",
            title: "Sefiller (Les Misérables)",
            author: "Victor Hugo",
            image:
              "https://img.kitapyurdu.com/v1/getImage/fn:11572198/wh:true/wi:800",
            pdfUrl:
              "https://yalcinkoresortaokulu.meb.k12.tr/meb_iys_dosyalar/44/10/760537/dosyalar/2019_05/08181114_sefiller-victor-hugo.pdf",
          },
          {
            id: "2",
            title: "Kürk Mantolu Madonna",
            author: "Sabahattin Ali",
            image:
              "https://img.kitapyurdu.com/v1/getImage/fn:6663013/wh:true/wi:800",
            pdfUrl:
              "https://yenicecumhuriyetortaokulu.meb.k12.tr/meb_iys_dosyalar/17/12/723206/dosyalar/2022_11/16163341_017-Sabahattin-Ali-Kurk-Mantolu-Madonna.pdf",
          },
          {
            id: "3",
            title: "Suç ve Ceza",
            author: "Fyodor Dostoyevski",
            image:
              "https://i.dr.com.tr/cache/500x400-0/originals/0000000222779-1.jpg",
            pdfUrl: "https://www.gutenberg.org/files/2554/2554-pdf.pdf",
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      // Fallback to sample data on error
      setBooks([
        {
          id: "1",
          title: "Sefiller (Les Misérables)",
          author: "Victor Hugo",
          image:
            "https://img.kitapyurdu.com/v1/getImage/fn:11572198/wh:true/wi:800",
          pdfUrl:
            "https://yalcinkoresortaokulu.meb.k12.tr/meb_iys_dosyalar/44/10/760537/dosyalar/2019_05/08181114_sefiller-victor-hugo.pdf",
        },
        {
          id: "2",
          title: "Kürk Mantolu Madonna",
          author: "Sabahattin Ali",
          image:
            "https://img.kitapyurdu.com/v1/getImage/fn:6663013/wh:true/wi:800",
          pdfUrl:
            "https://yenicecumhuriyetortaokulu.meb.k12.tr/meb_iys_dosyalar/17/12/723206/dosyalar/2022_11/16163341_017-Sabahattin-Ali-Kurk-Mantolu-Madonna.pdf",
        },
        {
          id: "3",
          title: "Suç ve Ceza",
          author: "Fyodor Dostoyevski",
          image:
            "https://i.dr.com.tr/cache/500x400-0/originals/0000000222779-1.jpg",
          pdfUrl: "https://www.gutenberg.org/files/2554/2554-pdf.pdf",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  const openPdf = async (pdfUrl, title) => {
    try {
      if (!pdfUrl) {
        Alert.alert("Hata", "PDF dosyası bulunamadı.");
        return;
      }

      // First try to open in in-app PDF viewer
      try {
        router.push({
          pathname: "/pdf-viewer",
          params: {
            pdfUrl: pdfUrl,
            title: title || "PDF Görüntüleyici",
          },
        });
      } catch (routerError) {
        // Fallback to external PDF viewer if in-app viewer fails
        console.log("In-app PDF viewer failed, trying external:", routerError);
        const supported = await Linking.canOpenURL(pdfUrl);
        if (supported) {
          await Linking.openURL(pdfUrl);
        } else {
          Alert.alert("Hata", "PDF dosyası açılamıyor.");
        }
      }
    } catch (error) {
      console.error("Error opening PDF:", error);
      Alert.alert("Hata", "PDF açılırken bir hata oluştu.");
    }
  };
  const deleteBook = async (bookId, bookTitle) => {
    Alert.alert(
      "Kitabı Sil",
      `"${bookTitle}" kitabını silmek istediğinizden emin misiniz?`,
      [
        {
          text: "İptal",
          style: "cancel",
        },
        {
          text: "Sil",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(
                `${API_ENDPOINTS.DELETE_BOOK}/${bookId}`,
                {
                  method: "DELETE",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              if (response.ok) {
                Alert.alert("Başarılı", "Kitap başarıyla silindi");
                // Refresh the books list
                fetchBooks();
              } else {
                const data = await response.json();
                Alert.alert(
                  "Hata",
                  data.message || "Kitap silinirken bir hata oluştu"
                );
              }
            } catch (error) {
              console.error("Error deleting book:", error);
              Alert.alert("Hata", "Bağlantı hatası. Lütfen tekrar deneyin.");
            }
          },
        },
      ]
    );
  };

  const openEditModal = (book) => {
    setEditingBook(book);
    setEditTitle(book.title);
    setEditDescription(book.description || "");
    setEditModalVisible(true);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingBook(null);
    setEditTitle("");
    setEditDescription("");
  };
  const updateBook = async () => {
    if (!editTitle.trim()) {
      Alert.alert("Hata", "Başlık boş olamaz");
      return;
    }

    try {
      setEditLoading(true);

      const response = await fetch(
        `${API_ENDPOINTS.UPDATE_BOOK}/${editingBook._id || editingBook.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            description: editDescription.trim(),
          }),
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        Alert.alert("Başarılı", "Kitap bilgileri güncellendi");
        closeEditModal();
        fetchBooks(); // Refresh the list
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Hata",
          errorData.message || "Kitap güncellenirken bir hata oluştu"
        );
      }
    } catch (error) {
      console.error("Error updating book:", error);
      Alert.alert("Hata", "Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setEditLoading(false);
    }
  };
  const shareBook = async (book) => {
    try {
      // Check if book and pdfUrl exist
      if (!book || !book.pdfUrl) {
        Alert.alert("Hata", "Bu kitabın PDF linki bulunamadı");
        return;
      }

      const shareMessage = `📚 "${
        book.title || "Kitap"
      }" adlı kitabı kontrol et!\n\n${
        book.description || "Harika bir kitap!"
      }\n\n🔗 PDF'i buradan okuyabilirsin: ${
        book.pdfUrl
      }\n\n#Bookworm #PDF #Kitap`;

      // Always show the dialog instead of trying to share the PDF directly
      const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(
        shareMessage
      )}`;
      const telegramUrl = `tg://msg?text=${encodeURIComponent(shareMessage)}`;

      Alert.alert("Paylaş", "Bu kitabı nasıl paylaşmak istiyorsun?", [
        {
          text: "WhatsApp",
          onPress: async () => {
            try {
              const supported = await Linking.canOpenURL(whatsappUrl);
              if (supported) {
                await Linking.openURL(whatsappUrl);
              } else {
                Alert.alert("Hata", "WhatsApp yüklü değil");
              }
            } catch (error) {
              console.error("WhatsApp error:", error);
              Alert.alert("Hata", "WhatsApp açılamadı");
            }
          },
        },
        {
          text: "Telegram",
          onPress: async () => {
            try {
              const supported = await Linking.canOpenURL(telegramUrl);
              if (supported) {
                await Linking.openURL(telegramUrl);
              } else {
                Alert.alert("Hata", "Telegram yüklü değil");
              }
            } catch (error) {
              console.error("Telegram error:", error);
              Alert.alert("Hata", "Telegram açılamadı");
            }
          },
        },
        {
          text: "Kopyala",
          onPress: async () => {
            try {
              await Clipboard.setStringAsync(shareMessage);
              Alert.alert("Başarılı", "Paylaşım mesajı panoya kopyalandı!");
            } catch (error) {
              console.error("Clipboard error:", error);
              Alert.alert("Hata", "Kopyalama başarısız");
            }
          },
        },
        {
          text: "İptal",
          style: "cancel",
        },
      ]);
    } catch (error) {
      console.error("Error sharing book:", error);
      Alert.alert("Hata", "Paylaşım sırasında bir hata oluştu");
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.bookCard}
      onPress={() => openEditModal(item)}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          deleteBook(item._id || item.id, item.title);
        }}
      >
        <Ionicons name="close-circle" size={24} color="#e74c3c" />
      </TouchableOpacity>
      <Image
        source={{
          uri:
            item.thumbnailImage ||
            item.image ||
            "https://via.placeholder.com/150x200?text=PDF",
        }}
        style={styles.bookImage}
        resizeMode="cover"
      />
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{item.title}</Text>
        <Text style={styles.bookAuthor}>
          {item.user?.username
            ? `Yükleyen: ${item.user.username}`
            : `Yazar: ${item.author || "Bilinmiyor"}`}
        </Text>
        {item.description && (
          <Text style={styles.bookDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            openPdf(item.pdfUrl, item.title);
          }}
          style={styles.pdfButton}
        >
          <Ionicons
            name="reader-outline"
            size={16}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.pdfButtonText}>PDF'i Oku</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            shareBook(item);
          }}
          style={styles.shareButton}
        >
          <Ionicons
            name="share-outline"
            size={16}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text style={styles.shareButtonText}>Paylaş</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Kitaplar yükleniyor...</Text>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Text style={styles.pageTitle}>Kitap Listesi</Text>
      {books.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="library-outline" size={64} color="#688f68" />
          <Text style={styles.emptyText}>Henüz kitap yüklenmemiş</Text>
          <Text style={styles.emptySubText}>
            İlk PDF'i yüklemek için "PDF Yükle" sekmesini kullanın
          </Text>
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderItem}
          keyExtractor={(item) => item._id || item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeEditModal}>
              <Ionicons name="close" size={24} color="#2e5a2e" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Kitap Düzenle</Text>
            <TouchableOpacity onPress={updateBook} disabled={editLoading}>
              {editLoading ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <Text style={styles.saveButton}>Kaydet</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Başlık</Text>
              <TextInput
                style={styles.input}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Kitap başlığı"
                multiline={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Açıklama</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editDescription}
                onChangeText={setEditDescription}
                placeholder="Kitap açıklaması"
                multiline={true}
                numberOfLines={4}
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#2e5a2e",
  },
  listContainer: {
    paddingBottom: 40,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2e5a2e",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubText: {
    fontSize: 14,
    color: "#688f68",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  pageTitle: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
    color: "#2e5a2e",
    marginVertical: 10,
  },
  bookCard: {
    flexDirection: "row",
    backgroundColor: "#f1f8f2",
    borderRadius: 12,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    overflow: "hidden",
    position: "relative",
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 12,
    padding: 2,
  },
  bookImage: {
    width: 110,
    height: 150,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  bookInfo: {
    flex: 1,
    padding: 14,
    justifyContent: "center",
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2e5a2e",
  },
  bookAuthor: {
    fontSize: 14,
    fontWeight: "600",
    color: "#688f68",
    marginTop: 4,
  },
  bookDescription: {
    fontSize: 12,
    color: "#666",
    marginTop: 6,
    lineHeight: 16,
  },
  pdfButton: {
    marginTop: 10,
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  pdfButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  shareButton: {
    marginTop: 8,
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
  shareButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#e8f5e9",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    backgroundColor: "#f1f8f2",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e5a2e",
  },
  saveButton: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2e5a2e",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
});
