import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7099/api/v1';

// Tạo hoặc lấy sessionId duy nhất cho khách vãng lai
export const getSessionId = (): string => {
  let sessionId = localStorage.getItem('hdpe_session_id');
  if (!sessionId) {
    sessionId = 'guest_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
    localStorage.setItem('hdpe_session_id', sessionId);
  }
  return sessionId;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('hdpe_token');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('hdpe_refresh_token');
};

export const setAuthToken = (token: string, refreshToken?: string): void => {
  localStorage.setItem('hdpe_token', token);
  if (refreshToken) {
    localStorage.setItem('hdpe_refresh_token', refreshToken);
  }
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('hdpe_token');
  localStorage.removeItem('hdpe_refresh_token');
  localStorage.removeItem('hdpe_user');
};

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

// Interceptor gắn Bearer Token vào Headers
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Quản lý trạng thái gọi refresh token để tránh spam song song
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor xử lý lỗi 401 tự động refresh token
httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/KhachHang/DangNhap') ||
      requestUrl.includes('/KhachHang/DangKy') ||
      requestUrl.includes('/KhachHang/RefreshToken');

    // Nếu bị 401 và không phải là request đăng nhập/refresh
    if (error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      const currentRefreshToken = getRefreshToken();

      if (!currentRefreshToken) {
        removeAuthToken();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Đang có tiến trình refresh chạy, đẩy request này vào hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return httpClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi thẳng axios trực tiếp không qua interceptor để tránh lặp
        const response = await axios.post(`${API_BASE_URL}/KhachHang/RefreshToken`, {
          refreshToken: currentRefreshToken,
        });

        const resData = response.data;
        if (resData.success && resData.data) {
          const newAccessToken = resData.data.accessToken || resData.data.token;
          const newRefreshToken = resData.data.refreshToken;

          setAuthToken(newAccessToken, newRefreshToken);

          if (resData.data.user) {
            localStorage.setItem('hdpe_user', JSON.stringify(resData.data.user));
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          processQueue(null, newAccessToken);
          return httpClient(originalRequest);
        } else {
          processQueue(new Error('Refresh token không thành công'), null);
          removeAuthToken();
          return Promise.reject(error);
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        removeAuthToken();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default httpClient;
