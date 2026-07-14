import axios from 'axios';

export const AUTH_TOKEN_KEY = 'taskflow_token';
export const AUTH_USER_KEY = 'taskflow_user';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api',
});

// Runs before every request: attaches the stored JWT as a Bearer header if present.
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Runs after every response: a 401 means the stored token is missing, invalid, or
// stale (e.g. its user no longer exists) — clear the dead session and send the
// user back to log in, rather than letting the page fall through to a misleading
// error like "not found" for what's actually an expired session.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== 'undefined' &&
      error.response?.status === 401 &&
      window.location.pathname !== '/login'
    ) {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      window.localStorage.removeItem(AUTH_USER_KEY);
      window.location.href = '/login?sessionExpired=1';
    }
    return Promise.reject(error);
  },
);
