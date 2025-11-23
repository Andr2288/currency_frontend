import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { fetchCsrfToken } from "../lib/axios";

const LoginPage = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const navigate = useNavigate();
    const { login, isLoggingIn, authUser } = useAuthStore();

    // Завантажуємо CSRF токен при mount
    useEffect(() => {
        fetchCsrfToken();
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setError("Заповніть всі поля");
            return;
        }

        setError("");

        const success = await login(username, password);

        if (success) {
            const user = useAuthStore.getState().authUser;

            if (user && user.role === "Admin") {
                navigate("/admin/dashboard");
            } else {
                navigate("/");
            }
        } else {
            setError("Невірний логін або пароль");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                                <Lock className="w-8 h-8 text-primary-content" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold">Вхід в систему</h2>
                        <p className="text-gray-600 mt-2">Введіть дані для входу</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin}>
                        {/* Username */}
                        <div className="form-control mb-4">
                            <label className="label">
                                <span className="label-text font-semibold">Логін</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="w-5 h-5 text-gray-400 z-10" />
                                </div>
                                <input
                                    type="text"
                                    className="input input-bordered w-full pl-10"
                                    placeholder="Введіть логін"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        setError("");
                                    }}
                                    autoComplete="username"
                                    disabled={isLoggingIn}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="form-control mb-6">
                            <label className="label">
                                <span className="label-text font-semibold">Пароль</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="w-5 h-5 text-gray-400 z-10" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="input input-bordered w-full pl-10 pr-10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setError("");
                                    }}
                                    autoComplete="current-password"
                                    disabled={isLoggingIn}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoggingIn}
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5 text-gray-400 z-10" />
                                    ) : (
                                        <Eye className="w-5 h-5 text-gray-400 z-10" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="alert alert-error mb-4">
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`btn btn-primary w-full ${isLoggingIn ? 'loading' : ''}`}
                            disabled={isLoggingIn}
                        >
                            {isLoggingIn ? "Вхід..." : "Увійти"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;