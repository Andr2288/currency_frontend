import axios from "axios";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5099/api",
    withCredentials: true, // Важливо для CSRF cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

// CSRF токен
let csrfToken = null;

// Функція для отримання CSRF токена
export const fetchCsrfToken = async () => {
    try {
        const response = await axiosInstance.get("/auth/csrf-token");
        csrfToken = response.data.csrfToken;
        return csrfToken;
    } catch (error) {
        console.error("Failed to fetch CSRF token:", error);
        return null;
    }
};

// Request interceptor - додаємо JWT токен та CSRF токен
axiosInstance.interceptors.request.use(
    async (config) => {
        // Додаємо JWT токен
        const token = localStorage.getItem("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Додаємо CSRF токен для POST/PUT/DELETE/PATCH запитів
        if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
            if (!csrfToken) {
                await fetchCsrfToken();
            }
            if (csrfToken) {
                config.headers['X-CSRF-TOKEN'] = csrfToken;
            }
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - обробка помилок
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        // Якщо CSRF токен недійсний - отримуємо новий
        if (error.response?.status === 400 && error.response?.data?.includes('antiforgery')) {
            csrfToken = null;
            await fetchCsrfToken();
            // Повторюємо запит
            return axiosInstance.request(error.config);
        }

        // Обробка 401 помилок
        if (error.response?.status === 401) {
            localStorage.removeItem("auth_token");

            if (!error.config.url.includes('/auth/login') &&
                !error.config.url.includes('/auth/register')) {
                window.location.href = "/admin/login";
            }
        }

        return Promise.reject(error);
    }
);