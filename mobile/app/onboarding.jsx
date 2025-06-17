import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { onboarding } from "../constants/onboarding";
import Swiper from "react-native-swiper";
import CustomButton from "../components/CustomButton";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../contexts/ThemeContext";
import { StatusBar } from "expo-status-bar";

const { width } = Dimensions.get("window");

const Onboarding = () => {
  const router = useRouter();
  const swiperRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { setOnboardingCompleted } = useAuthStore();
  const { theme, isDarkMode } = useTheme();

  const isLastSlide = activeIndex === onboarding.length - 1;

  const handleNext = async () => {
    if (isLastSlide) {
      await setOnboardingCompleted();
      router.replace("/(auth)");
    } else {
      swiperRef.current?.scrollBy(1);
    }
  };

  const handleSkip = async () => {
    await setOnboardingCompleted();
    router.replace("/(auth)");
  };

  const styles = StyleSheet.create({
    safeAreaView: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    skipButton: {
      alignSelf: "flex-end",
      padding: 20,
      paddingRight: 30,
      zIndex: 1,
    },
    skipText: {
      fontSize: 16,
      color: theme.textSecondary,
      fontWeight: "500",
    },
    wrapper: {},
    swiperContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingBottom: 120,
      marginTop: -60,
    },
    imageContainer: {
      alignItems: "center",
      marginBottom: 30,
      position: "relative",
    },
    swiperImage: {
      width: width * 0.5,
      height: width * 0.7,
      resizeMode: "cover",
      borderRadius: 12,
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    iconOverlay: {
      position: "absolute",
      bottom: -16,
      right: -16,
      backgroundColor: theme.white,
      borderRadius: 25,
      width: 50,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: theme.shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      borderWidth: 2,
      borderColor: theme.cardBackground,
    },
    contentContainer: {
      alignItems: "center",
      paddingHorizontal: 20,
    },
    swiperTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: theme.textPrimary,
      textAlign: "center",
      marginBottom: 16,
      lineHeight: 34,
    },
    swiperDescription: {
      fontSize: 16,
      color: theme.textSecondary,
      textAlign: "center",
      lineHeight: 24,
      paddingHorizontal: 10,
    },
    pagination: {
      bottom: 130,
    },
    dotStyle: {
      width: 32,
      height: 8,
      backgroundColor: theme.border,
      margin: 5,
      borderRadius: 4,
    },
    activeDotStyle: {
      width: 32,
      height: 8,
      backgroundColor: theme.primary,
      margin: 5,
      borderRadius: 4,
    },
    buttonContainer: {
      position: "absolute",
      bottom: 50,
      left: 20,
      right: 20,
    },
    getStartedButton: {
      width: "100%",
    },
  });

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <SafeAreaView style={styles.safeAreaView}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>Geç</Text>
          </TouchableOpacity>

          <Swiper
            ref={swiperRef}
            style={styles.wrapper}
            showsButtons={false}
            showsPagination={true}
            loop={false}
            onIndexChanged={(index) => setActiveIndex(index)}
            dot={<View style={styles.dotStyle} />}
            activeDot={<View style={styles.activeDotStyle} />}
            paginationStyle={styles.pagination}
          >
            {onboarding.map((item, index) => (
              <View key={item.id} style={styles.swiperContainer}>
                <View style={styles.imageContainer}>
                  <Image source={item.image} style={styles.swiperImage} />
                  <View style={styles.iconOverlay}>
                    <Ionicons
                      name={
                        index === 0
                          ? "library"
                          : index === 1
                          ? "create"
                          : "people"
                      }
                      size={32}
                      color={theme.primary}
                    />
                  </View>
                </View>

                <View style={styles.contentContainer}>
                  <Text style={styles.swiperTitle}>{item.title}</Text>
                  <Text style={styles.swiperDescription}>
                    {item.description}
                  </Text>
                </View>
              </View>
            ))}
          </Swiper>

          <View style={styles.buttonContainer}>
            <CustomButton
              title={isLastSlide ? "Başla" : "İleri"}
              onPress={handleNext}
              style={styles.getStartedButton}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default Onboarding;
