import { Link } from "react-router-dom";
import { Home, ArrowLeftRight, History, Settings, User, LogOut } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const { authUser, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <div className="navbar bg-base-300 shadow-lg">
            <div className="navbar-start">
                <Link to="/" className="btn btn-ghost text-xl">
                    💱 Currency Exchange
                </Link>
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1 gap-2">
                    <li>
                        <Link to="/" className="gap-2">
                            <Home className="w-4 h-4" />
                            Головна
                        </Link>
                    </li>
                    <li>
                        <Link to="/converter" className="gap-2">
                            <ArrowLeftRight className="w-4 h-4" />
                            Конвертер
                        </Link>
                    </li>
                    <li>
                        <Link to="/history" className="gap-2">
                            <History className="w-4 h-4" />
                            Історія
                        </Link>
                    </li>
                </ul>
            </div>

            <div className="navbar-end gap-2">
                {authUser ? (
                    <>
                        {/* Показуємо адмін панель ТІЛЬКИ для ролі Admin */}
                        {authUser.role === "Admin" && (
                            <Link to="/admin/dashboard" className="btn btn-ghost btn-sm gap-2">
                                <Settings className="w-4 h-4" />
                                Адмін панель
                            </Link>
                        )}

                        {/* Для всіх залогінених показуємо ім'я та кнопку виходу */}
                        <div className="dropdown dropdown-end">
                            <label tabIndex={0} className="btn btn-ghost btn-sm gap-2">
                                <User className="w-4 h-4" />
                                {authUser.username}
                            </label>
                            <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-4">
                                <li>
                                    <button onClick={handleLogout} className="gap-2">
                                        <LogOut className="w-4 h-4" />
                                        Вийти
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </>
                ) : (
                    <Link to="/admin/login" className="btn btn-ghost btn-sm gap-2">
                        <Settings className="w-4 h-4" />
                        Вхід
                    </Link>
                )}
            </div>
        </div>
    );
};

export default Navbar;