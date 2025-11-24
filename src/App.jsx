import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import ConverterPage from "./pages/ConverterPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx"; // NEW: Import the history page
import LoginPage from "./pages/LoginPage.jsx";
import AdminDashboard from "./components/AdminDashboard.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import { useAuthStore } from "./store/useAuthStore.js";
import { useEffect } from "react";

import { Loader } from "lucide-react";

const App = () => {
    const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    if (isCheckingAuth && !authUser) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="size-10 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200">

            <Navbar />

            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/converter" element={<ConverterPage />} />
                <Route path="/history" element={<HistoryPage />} /> {/* NEW: Use the real HistoryPage */}

                {/* Login Route - доступний для всіх */}
                <Route path="/admin/login" element={<LoginPage />} />

                {/* Admin Routes - тільки для Admin */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="/admin" element={<Navigate to="/admin/login" replace />} />

                {/* Catch All */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
    );
};

export default App;