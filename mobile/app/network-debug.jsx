import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import {
  testNetworkConnection,
  logAPIConfig,
  API_ENDPOINTS,
} from "../constants/api";
import { useTheme } from "../contexts/ThemeContext";

export default function NetworkDebugScreen() {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { theme, colors } = useTheme();

  const addResult = (test, result) => {
    setTestResults((prev) => [
      ...prev,
      { test, result, timestamp: new Date().toLocaleTimeString() },
    ]);
  };

  const runNetworkTest = async () => {
    setIsLoading(true);
    setTestResults([]);

    // Log API config
    logAPIConfig();
    addResult("API Configuration", "Logged to console");

    try {
      // Test health endpoint
      const healthTest = await testNetworkConnection();
      addResult(
        "Health Check",
        healthTest.success ? "SUCCESS" : `FAILED: ${healthTest.error}`
      );

      // Test auth endpoints accessibility
      const endpoints = [
        { name: "Login", url: API_ENDPOINTS.LOGIN },
        { name: "Register", url: API_ENDPOINTS.REGISTER },
        { name: "Books", url: API_ENDPOINTS.BOOKS },
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, {
            method: "HEAD", // Just check if endpoint exists
            timeout: 5000,
          });
          addResult(
            `${endpoint.name} Endpoint`,
            `${response.status} - ${response.statusText}`
          );
        } catch (error) {
          addResult(`${endpoint.name} Endpoint`, `FAILED: ${error.message}`);
        }
      }
    } catch (error) {
      addResult("Network Test", `ERROR: ${error.message}`);
    }

    setIsLoading(false);
  };

  const testSpecificIPs = async () => {
    setIsLoading(true);
    setTestResults([]);

    const testIPs = [
      "http://localhost:3000",
      "http://10.0.2.2:3000", // Android emulator standard
      "http://127.0.0.1:3000",
    ];

    for (const ip of testIPs) {
      try {
        const response = await fetch(`${ip}/api/health`, {
          method: "GET",
          timeout: 5000,
        });
        const data = await response.json();
        addResult(`Test ${ip}`, `SUCCESS: ${data.message}`);
      } catch (error) {
        addResult(`Test ${ip}`, `FAILED: ${error.message}`);
      }
    }

    setIsLoading(false);
  };

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.text,
      marginBottom: 20,
      textAlign: "center",
    },
    button: {
      backgroundColor: colors.primary,
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      alignItems: "center",
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    resultContainer: {
      backgroundColor: colors.card,
      borderRadius: 10,
      padding: 15,
      marginTop: 20,
    },
    resultItem: {
      marginBottom: 10,
      padding: 10,
      backgroundColor: colors.background,
      borderRadius: 5,
    },
    resultText: {
      color: colors.text,
      fontSize: 14,
    },
    timestamp: {
      color: colors.textSecondary,
      fontSize: 12,
    },
  });

  return (
    <ScrollView style={dynamicStyles.container}>
      <Text style={dynamicStyles.title}>Network Debug Tool</Text>

      <TouchableOpacity
        style={[dynamicStyles.button, isLoading && { opacity: 0.6 }]}
        onPress={runNetworkTest}
        disabled={isLoading}
      >
        <Text style={dynamicStyles.buttonText}>
          {isLoading ? "Testing..." : "Run Network Test"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[dynamicStyles.button, isLoading && { opacity: 0.6 }]}
        onPress={testSpecificIPs}
        disabled={isLoading}
      >
        <Text style={dynamicStyles.buttonText}>
          {isLoading ? "Testing..." : "Test Different IPs"}
        </Text>
      </TouchableOpacity>

      {testResults.length > 0 && (
        <View style={dynamicStyles.resultContainer}>
          <Text
            style={[
              dynamicStyles.resultText,
              { fontWeight: "bold", marginBottom: 10 },
            ]}
          >
            Test Results:
          </Text>
          {testResults.map((result, index) => (
            <View key={index} style={dynamicStyles.resultItem}>
              <Text style={dynamicStyles.resultText}>
                <Text style={{ fontWeight: "bold" }}>{result.test}:</Text>{" "}
                {result.result}
              </Text>
              <Text style={dynamicStyles.timestamp}>{result.timestamp}</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
