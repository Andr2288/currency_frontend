import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import ConverterPage from "./pages/ConverterPage.jsx";
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
                <Route path="/history" element={
                    <div className="container mx-auto px-4 py-8">
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h1 className="text-3xl font-bold mb-4">📊 Історія курсів</h1>
                                <div className="alert alert-info">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span>Coming soon...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                } />

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