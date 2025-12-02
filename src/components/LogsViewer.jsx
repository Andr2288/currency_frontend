import { useState, useEffect } from "react";
import { FileText, AlertCircle, CheckCircle, Info, XCircle, RefreshCw } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const LogsViewer = () => {
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [count, setCount] = useState(50);
    const [levelFilter, setLevelFilter] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [count, levelFilter]);

    const fetchLogs = async () => {
        setIsLoading(true);
        try {
            let url = `/Logs?count=${count}`;
            if (levelFilter) {
                url += `&level=${levelFilter}`;
            }
            const response = await axiosInstance.get(url);
            setLogs(response.data);
        } catch (error) {
            console.error("Error fetching logs:", error);
            toast.error("Помилка завантаження логів");
        } finally {
            setIsLoading(false);
        }
    };

    const getLogIcon = (level) => {
        switch (level) {
            case "Info":
                return <Info className="w-4 h-4 text-info" />;
            case "Warning":
                return <AlertCircle className="w-4 h-4 text-warning" />;
            case "Error":
                return <XCircle className="w-4 h-4 text-error" />;
            default:
                return <CheckCircle className="w-4 h-4 text-success" />;
        }
    };

    const getLogBadgeColor = (level) => {
        switch (level) {
            case "Info":
                return "badge-info";
            case "Warning":
                return "badge-warning";
            case "Error":
                return "badge-error";
            default:
                return "badge-success";
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleString('uk-UA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="card-title gap-2">
                        <FileText className="w-5 h-5" />
                        Логи системи
                    </h2>

                    <div className="flex gap-2 items-center">
                        <select
                            className="select select-bordered select-sm"
                            value={levelFilter}
                            onChange={(e) => setLevelFilter(e.target.value)}
                        >
                            <option value="">Всі рівні</option>
                            <option value="Info">Info</option>
                            <option value="Warning">Warning</option>
                            <option value="Error">Error</option>
                        </select>

                        <select
                            className="select select-bordered select-sm"
                            value={count}
                            onChange={(e) => setCount(Number(e.target.value))}
                        >
                            <option value={20}>20 записів</option>
                            <option value={50}>50 записів</option>
                            <option value={100}>100 записів</option>
                            <option value={200}>200 записів</option>
                        </select>

                        <button
                            className={`btn btn-sm btn-primary gap-2 ${isLoading ? 'loading' : ''}`}
                            onClick={fetchLogs}
                            disabled={isLoading}
                        >
                            {!isLoading && <RefreshCw className="w-4 h-4" />}
                            Оновити
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-8">
                        <span className="loading loading-spinner loading-lg"></span>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="alert alert-info">
                        <Info className="w-5 h-5" />
                        <span>Логів поки немає</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead>
                            <tr>
                                <th>Час</th>
                                <th>Рівень</th>
                                <th>Джерело</th>
                                <th>Повідомлення</th>
                            </tr>
                            </thead>
                            <tbody>
                            {logs.map((log) => (
                                <tr key={log.id}>
                                    <td>
                                        <div className="text-xs font-mono">
                                            {formatTime(log.timestamp)}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`badge badge-sm gap-1 ${getLogBadgeColor(log.level)}`}>
                                            {getLogIcon(log.level)}
                                            {log.level}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-xs font-mono text-gray-600">
                                            {log.source}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="text-sm">
                                            {log.message}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="divider"></div>

                <div className="stats stats-vertical lg:stats-horizontal shadow">
                    <div className="stat">
                        <div className="stat-title">Всього</div>
                        <div className="stat-value text-primary">{logs.length}</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Info</div>
                        <div className="stat-value text-info">
                            {logs.filter(l => l.level === "Info").length}
                        </div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Warning</div>
                        <div className="stat-value text-warning">
                            {logs.filter(l => l.level === "Warning").length}
                        </div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Error</div>
                        <div className="stat-value text-error">
                            {logs.filter(l => l.level === "Error").length}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogsViewer;