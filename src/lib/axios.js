import axios from "axios";

// Використовуємо HTTP порт, не HTTPS для development
export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5099/api",
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor - додаємо токен до кожного запиту
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - обробка помилок авторизації
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Видаляємо невалідний токен
            localStorage.removeItem("auth_token");

            // Редірект на логін тільки якщо це не сам логін endpoint
            if (!error.config.url.includes('/auth/login') &&
                !error.config.url.includes('/auth/register')) {
                window.location.href = "/admin/login";
            }
        }
        return Promise.reject(error);
    }
);