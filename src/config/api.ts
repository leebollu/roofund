
// API Configuration for different environments

const getApiBaseUrl = (): string => {
  // Check if we're in development (localhost)
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // For Lovable.dev previews, use Supabase Edge Functions
  if (window.location.hostname.includes('lovable.app')) {
    return 'https://zbnhyhxgatckymidothf.supabase.co/functions/v1';
  }
  
  // Default production API URL (Supabase Edge Functions)
  return 'https://zbnhyhxgatckymidothf.supabase.co/functions/v1';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  TEST_CONNECTION: `${API_BASE_URL}/test-email-connection`,
  FETCH_LATEST: `${API_BASE_URL}/fetch-latest-email`,
};

console.log('🔗 API Base URL:', API_BASE_URL);
