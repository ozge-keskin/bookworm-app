// API Configuration
// This configuration works for any developer's computer

import { Platform } from 'react-native';

// Determine the base URL based on platform and environment
const getBaseURL = () => {
  if (__DEV__) {
    // For development
    if (Platform.OS === 'ios') {
      // iOS Simulator can use localhost
      return "http://localhost:3000";
    } else if (Platform.OS === 'android') {
      // For Android Emulator, 10.0.2.2 is the host machine's localhost
      // This is the standard way to access localhost from Android emulator
      return "http://10.0.2.2:3000";
    }
    // Fallback to localhost for other platforms (web, etc.)
    return "http://localhost:3000";
  }
  return "https://your-production-api.com"; // Production
};

const API_BASE_URL = getBaseURL();

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  UPDATE_PASSWORD: `${API_BASE_URL}/api/auth/update-password`,
  UPDATE_USERNAME: `${API_BASE_URL}/api/auth/update-username`,
  
  // Book endpoints
  BOOKS: `${API_BASE_URL}/api/books`,
  CREATE_BOOK: `${API_BASE_URL}/api/books`,
  GET_BOOKS: `${API_BASE_URL}/api/books`,
  DELETE_BOOK: `${API_BASE_URL}/api/books`,
  UPDATE_BOOK: `${API_BASE_URL}/api/books`,
};

// Network connectivity test function
export const testNetworkConnection = async () => {
  try {
    console.log(`Testing connection to: ${API_BASE_URL}/api/health`);
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Network test successful:', data);
      return { success: true, data };
    } else {
      console.log('Network test failed - HTTP status:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.log('Network test error:', error.message);
    
    // Provide helpful error messages for common issues
    if (error.message.includes('Network request failed')) {
      return { 
        success: false, 
        error: 'Cannot connect to server. Make sure the backend is running on port 3000.' 
      };
    }
    
    return { success: false, error: error.message };
  }
};

// Debug function to log current API configuration
export const logAPIConfig = () => {
  console.log('=== API Configuration ===');
  console.log('Platform:', Platform.OS);
  console.log('Base URL:', API_BASE_URL);
  console.log('Dev Mode:', __DEV__);
  console.log('All Endpoints:', API_ENDPOINTS);
  console.log('========================');
};

// Environment validation
export const validateEnvironment = () => {
  const issues = [];
  
  if (!API_BASE_URL) {
    issues.push('API_BASE_URL is not defined');
  }
  
  if (!API_BASE_URL.includes('3000')) {
    issues.push('API is not using port 3000');
  }
  
  if (issues.length > 0) {
    console.warn('⚠️ Environment issues detected:', issues);
    return { valid: false, issues };
  }
  
  console.log('✅ Environment validation passed');
  return { valid: true, issues: [] };
};

export default API_BASE_URL;
