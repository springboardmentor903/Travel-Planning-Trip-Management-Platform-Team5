
import axios, { AxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",

  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT automatically to protected requests
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      const isAuthEndpoint =
        config.url?.includes("/auth/login") ||
        config.url?.includes("/auth/register");

      if (
        token &&
        token !== "undefined" &&
        token !== "null" &&
        token.trim() !== "" &&
        !isAuthEndpoint
      ) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Generic API helper
export async function apiRequest<T = any>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<T> {
  const response = await api.request<T>({
    url,
    method: config.method || "GET",
    data: config.data,
    params: config.params,
    headers: config.headers,
  });

  return response.data;
}

// Extract backend error message
export function getErrorMessage(
  err: any,
  fallbackMessage = "An error occurred"
): string {
  if (!err) return fallbackMessage;

  if (typeof err === "string") return err;

  const data = err.response?.data;

  if (!data) {
    return err.message || fallbackMessage;
  }

  if (typeof data === "string") {
    return data;
  }

  if (
    typeof data.message === "string" &&
    data.message.trim() !== ""
  ) {
    return data.message;
  }

  if (
    typeof data.error === "string" &&
    data.error.trim() !== ""
  ) {
    return data.error;
  }

  return fallbackMessage;
}

export default api;
