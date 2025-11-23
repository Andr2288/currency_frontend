import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Loader } from "lucide-react";

const ProtectedRoute = ({ children }) => {
    const { authUser, isCheckingAuth } = useAuthStore();

    // Показуємо loader поки перевіряємо авторизацію
    if (isCheckingAuth) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="w-10 h-10 animate-spin" />
            </div>
        );
    }

    // Якщо не авторизований — редірект
    if (!authUser) {
        return <Navigate to="/admin/login" replace />;
    }

    // ❗Якщо не Admin — забороняємо доступ
    if (authUser.role !== "Admin") {
        return <Navigate to="/admin/login" replace />;
    }

    // Якщо все добре — показуємо контент
    return children;
};

export default ProtectedRoute;
