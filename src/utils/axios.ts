import axios from 'axios'
import { AuthPaths } from "./urlpaths";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const schoolGroupCode = localStorage.getItem('schoolGroupCode') || 'default';
    const schoolCode = localStorage.getItem('schoolCode') || 'default';

    // ✅ Check for per-request override first, then fall back to localStorage
    const isAllSchools = (config as any)._forceSchoolCode
      ? false  // override: treat as single school
      : localStorage.getItem('isAllSchools') === 'true';

    if (config.url) {
      config.url = config.url.replace('{schoolGroupCode}', schoolGroupCode);
      if (!isAllSchools) {
        config.url = config.url.replace('{schoolCode}', schoolCode);
      } else {
        config.url = config.url.replace('{schoolCode}/', '');
        config.url = config.url.replace('{schoolCode}', '');
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: any = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${API_BASE_URL}${AuthPaths.refreshToken}`,
            { refreshToken },
          );
          const { accessToken, refreshToken: newRefreshToken } = data.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch {
          localStorage.clear();
          window.location.href = "/login";
        }
      } else {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

const AxiosFunc = {
  Get: (url: string, params?: any, config?: any) =>
    axiosInstance.get(url, { params, ...config }),
  Post: (url: string, data?: any, params?: any) =>
    axiosInstance.post(url, data, { params }),
  Put: (url: string, data?: any, params?: any) =>
    axiosInstance.put(url, data, { params }),
  Patch: (url: string, data?: any, params?: any) =>
    axiosInstance.patch(url, data, { params }),
  Delete: (url: string, data?: any, params?: any) =>
    axiosInstance.delete(url, { data, params }),
  PostFormData: (url: string, formData: FormData) =>
    axiosInstance.post(url, formData),
  PutFormData: (url: string, formData: FormData) =>
    axiosInstance.put(url, formData),
  PostFile: (url: string, data?: any, params?: any) =>
    axiosInstance.post(url, data, { params, responseType: "blob" }),
  GetFile: (url: string) => axiosInstance.get(url, { responseType: "blob" }),
};

export { axiosInstance };
export default AxiosFunc;