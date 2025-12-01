import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, LogOut, Database, Clock, CheckCircle, XCircle, Settings, FileText } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";
import ApiSourcesManagement from "./ApiSourcesManagement";
import LogsViewer from "./LogsViewer";

const AdminDashboard = () => {
    const [banks, setBanks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState("overview"); // overview | sources | logs
    const navigate = useNavigate();

    const { authUser, logout } = useAuthStore();

    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get("/ApiSources");
            setBanks(response.data);
        } catch (error) {
            console.error("Error fetching banks:", error);
            showMessage("Помилка завантаження банків", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFetchAll = async () => {
        setIsFetching(true);
        setMessage(null);

        try {
            const response = await axiosInstance.post("/ExchangeRates/fetch");
            showMessage(`Успішно оновлено ${response.data.count} курсів`, "success");
            await fetchBanks();
        } catch (error) {
            console.error("Error fetching rates:", error);
            showMessage("Помилка оновлення курсів", "error");
        } finally {
            setIsFetching(false);
        }
    };

    const handleFetchBySource = async (sourceName) => {
        setIsFetching(true);
        setMessage(null);

        try {
            const response = await axiosInstance.post(`/ExchangeRates/fetch/${sourceName}`);
            showMessage(`Оновлено ${response.data.count} курсів від ${sourceName}`, "success");
            await fetchBanks();
        } catch (error) {
            console.error("Error fetching rates:", error);
            showMessage(`Помилка оновлення курсів від ${sourceName}`, "error");
        } finally {
            setIsFetching(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/admin/login");
    };

    const showMessage = (text, type) => {
        setMessage({ text, type });
        setTimeout(() => setMessage(null), 5000);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Ніколи";
        const date = new Date(dateString);
        return date.toLocaleString('uk-UA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-base-200">
            {/* Header */}
            <div className="navbar bg-base-300 shadow-lg">
                <div className="navbar-start">
                    <h1 className="text-xl font-bold">🔐 Адмін панель</h1>
                </div>
                <div className="navbar-center">
                    {authUser && (
                        <div className="text-sm">
                            Вітаємо, <span className="font-semibold">{authUser.username}</span>
                        </div>
                    )}
                </div>
                <div className="navbar-end">
                    <button
                        className="btn btn-ghost btn-sm gap-2"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4" />
                        Вийти
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Message */}
                {message && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} mb-6`}>
                        {message.type === 'success' ? (
                            <CheckCircle className="w-6 h-6" />
                        ) : (
                            <XCircle className="w-6 h-6" />
                        )}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* Tabs */}
                <div className="tabs tabs-boxed mb-6 bg-base-100 p-2">
                    <button
                        className={`tab gap-2 ${activeTab === 'overview' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('overview')}
                    >
                        <Database className="w-4 h-4" />
                        Огляд
                    </button>
                    <button
                        className={`tab gap-2 ${activeTab === 'sources' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('sources')}
                    >
                        <Settings className="w-4 h-4" />
                        Управління джерелами
                    </button>
                    <button
                        className={`tab gap-2 ${activeTab === 'logs' ? 'tab-active' : ''}`}
                        onClick={() => setActiveTab('logs')}
                    >
                        <FileText className="w-4 h-4" />
                        Логи системи
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <>
                        {/* Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="stat bg-base-100 shadow rounded-lg">
                                <div className="stat-figure text-primary">
                                    <Database className="w-8 h-8" />
                                </div>
                                <div className="stat-title">Джерела API</div>
                                <div className="stat-value text-primary">{banks.length}</div>
                                <div className="stat-desc">Всього банків</div>
                            </div>

                            <div className="stat bg-base-100 shadow rounded-lg">
                                <div className="stat-figure text-success">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <div className="stat-title">Активні</div>
                                <div className="stat-value text-success">
                                    {banks.filter(b => b.isActive).length}
                                </div>
                                <div className="stat-desc">Працюють зараз</div>
                            </div>

                            <div className="stat bg-base-100 shadow rounded-lg">
                                <div className="stat-figure text-info">
                                    <Clock className="w-8 h-8" />
                                </div>
                                <div className="stat-title">Інтервал</div>
                                <div className="stat-value text-info">
                                    {banks[0]?.updateIntervalMinutes || 0}
                                </div>
                                <div className="stat-desc">хв оновлення</div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="card bg-base-100 shadow-xl mb-6">
                            <div className="card-body">
                                <h2 className="card-title">Швидкі дії</h2>
                                <div className="divider"></div>

                                <button
                                    className={`btn btn-primary btn-lg w-full gap-2 ${isFetching ? 'loading' : ''}`}
                                    onClick={handleFetchAll}
                                    disabled={isFetching}
                                >
                                    {!isFetching && <RefreshCw className="w-5 h-5" />}
                                    Оновити всі курси зараз
                                </button>
                            </div>
                        </div>

                        {/* Banks Table */}
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title mb-4">Джерела API (Банки)</h2>

                                {isLoading ? (
                                    <div className="flex justify-center py-8">
                                        <span className="loading loading-spinner loading-lg"></span>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="table table-zebra w-full">
                                            <thead>
                                            <tr>
                                                <th>Назва</th>
                                                <th>URL</th>
                                                <th>Формат</th>
                                                <th>Статус</th>
                                                <th>Останнє оновлення</th>
                                                <th>Дії</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {banks.map((bank) => (
                                                <tr key={bank.id}>
                                                    <td>
                                                        <div className="font-bold">{bank.name}</div>
                                                        <div className="text-sm opacity-70">
                                                            Інтервал: {bank.updateIntervalMinutes} хв
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="text-sm font-mono break-all max-w-xs">
                                                            {bank.url}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="badge badge-outline">
                                                            {bank.format}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        {bank.isActive ? (
                                                            <div className="badge badge-success gap-2">
                                                                <CheckCircle className="w-3 h-3" />
                                                                Активний
                                                            </div>
                                                        ) : (
                                                            <div className="badge badge-error gap-2">
                                                                <XCircle className="w-3 h-3" />
                                                                Неактивний
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div className="text-sm">
                                                            {formatDate(bank.lastUpdateAt)}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline gap-2"
                                                            onClick={() => handleFetchBySource(bank.name)}
                                                            disabled={isFetching || !bank.isActive}
                                                        >
                                                            <RefreshCw className="w-4 h-4" />
                                                            Оновити
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'sources' && <ApiSourcesManagement />}

                {activeTab === 'logs' && <LogsViewer />}
            </div>
        </div>
    );
};

export default AdminDashboard;