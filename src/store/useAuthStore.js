import {create} from "zustand"
import {axiosInstance} from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,

    // Перевірка авторизації при завантаженні
    checkAuth: async () => {
        try {
            // Перевіряємо чи є токен в localStorage
            const token = localStorage.getItem("auth_token");

            if (!token) {
                set({ authUser: null, isCheckingAuth: false });
                return;
            }

            // Якщо токен є, перевіряємо його валідність через /me endpoint
            const res = await axiosInstance.get("/auth/me", {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            set({
                authUser: res.data.user,
                isCheckingAuth: false
            });
        }
        catch (error) {
            // Якщо токен невалідний - видаляємо його
            localStorage.removeItem("auth_token");
            set({ authUser: null, isCheckingAuth: false });
            console.log("Error in checkAuth", error);
        }
    },

    // Логін
    login: async (username, password) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", {
                username,
                password
            });

            if (res.data.token) {
                // Зберігаємо токен в localStorage
                localStorage.setItem("auth_token", res.data.token);

                // Встановлюємо токен в axios для всіх майбутніх запитів
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

                set({
                    authUser: {
                        username: res.data.username,
                        email: res.data.email,
                        role: res.data.role
                    },
                    isLoggingIn: false
                });

                toast.success("Успішний вхід!");
                console.log(res.data);
                return true;
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.response?.data?.message || "Помилка входу");
            set({ isLoggingIn: false });
            return false;
        }
    },

    // Реєстрація
    register: async (username, email, password) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/register", {
                username,
                email,
                password
            });

            if (res.data.token) {
                localStorage.setItem("auth_token", res.data.token);
                axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

                set({
                    authUser: {
                        username: res.data.username,
                        email: res.data.email,
                        role: res.data.role
                    },
                    isSigningUp: false
                });

                toast.success("Реєстрація успішна!");
                return true;
            }
        } catch (error) {
            console.error("Register error:", error);
            toast.error(error.response?.data || "Помилка реєстрації");
            set({ isSigningUp: false });
            return false;
        }
    },

    // Вихід
    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            // Видаляємо токен і очищаємо стан
            localStorage.removeItem("auth_token");
            delete axiosInstance.defaults.headers.common['Authorization'];
            set({ authUser: null });
            toast.success("Ви вийшли з системи");
        }
    }
}));