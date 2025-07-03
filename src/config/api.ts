// API Configuration for different environments

const getApiBaseUrl = (): string => {
  // Check if we're in development (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // For Lovable.dev previews, use the deployed backend
  if (window.location.hostname.includes('lovable.app')) {
    // You'll need to update this with your actual deployed backend URL
    return 'https://your-backend-domain.com';
  }
  
  // Default production API URL
  return process.env.REACT_APP_API_URL || 'https://your-backend-domain.com';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  TEST_CONNECTION: `${API_BASE_URL}/api/email/test-connection`,
  FETCH_LATEST: `${API_BASE_URL}/api/email/fetch-latest`,
  HEALTH: `${API_BASE_URL}/health`
};

console.log('🔗 API Base URL:', API_BASE_URL);