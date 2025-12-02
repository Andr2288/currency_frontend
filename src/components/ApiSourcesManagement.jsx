import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Power, PowerOff, Save, X, TestTube2 } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ApiSourcesManagement = () => {
    const [sources, setSources] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isTestingApi, setIsTestingApi] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        url: "",
        format: "JSON",
        updateIntervalMinutes: 60,
        isActive: true
    });

    useEffect(() => {
        fetchSources();
    }, []);

    const fetchSources = async () => {
        setIsLoading(true);
        try {
            const response = await axiosInstance.get("/ApiSources");
            setSources(response.data);
        } catch (error) {
            console.error("Error fetching sources:", error);
            toast.error("Помилка завантаження джерел");
        } finally {
            setIsLoading(false);
        }
    };

    // НОВЕ: Тестування API перед створенням
    const handleTestApi = async () => {
        if (!formData.name || !formData.url) {
            toast.error("Заповніть назву та URL для тестування");
            return;
        }

        setIsTestingApi(true);
        setValidationErrors([]);

        try {
            const response = await axiosInstance.post("/ApiSources/test", formData);

            if (response.data.success) {
                toast.success("✅ API протестовано успішно! Можна створювати.");
                setValidationErrors([]);
            }
        } catch (error) {
            console.error("API test failed:", error);

            if (error.response?.data?.errors) {
                setValidationErrors(error.response.data.errors);
                toast.error("❌ API не пройшло валідацію");
            } else {
                toast.error("Помилка тестування API");
            }
        } finally {
            setIsTestingApi(false);
        }
    };

    const handleCreate = async () => {
        try {
            await axiosInstance.post("/ApiSources", formData);
            toast.success("✅ Джерело успішно створено");
            setIsCreating(false);
            resetForm();
            fetchSources();
        } catch (error) {
            console.error("Error creating source:", error);

            // Показуємо детальні помилки валідації
            if (error.response?.data?.errors) {
                setValidationErrors(error.response.data.errors);
                toast.error("❌ Структура API не відповідає шаблону");
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Помилка створення джерела");
            }
        }
    };

    const handleUpdate = async (id) => {
        try {
            await axiosInstance.put(`/ApiSources/${id}`, formData);
            toast.success("Джерело оновлено");
            setEditingId(null);
            resetForm();
            fetchSources();
        } catch (error) {
            console.error("Error updating source:", error);

            if (error.response?.data?.errors) {
                toast.error("Новий URL не відповідає шаблону");
            } else {
                toast.error("Помилка оновлення джерела");
            }
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Ви впевнені, що хочете видалити це джерело?")) return;

        try {
            await axiosInstance.delete(`/ApiSources/${id}`);
            toast.success("Джерело видалено");
            fetchSources();
        } catch (error) {
            console.error("Error deleting source:", error);
            toast.error("Помилка видалення джерела");
        }
    };

    const toggleSourceStatus = async (id, currentStatus) => {
        try {
            const source = sources.find(s => s.id === id);
            await axiosInstance.put(`/ApiSources/${id}`, {
                ...source,
                isActive: !currentStatus
            });

            toast.success(`Джерело ${!currentStatus ? 'активовано' : 'деактивовано'}`);
            fetchSources();
        } catch (error) {
            console.error("Error toggling source status:", error);
            toast.error("Помилка зміни статусу джерела");
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            url: "",
            format: "JSON",
            updateIntervalMinutes: 60,
            isActive: true
        });
        setValidationErrors([]);
    };

    const startEdit = (source) => {
        setFormData({
            name: source.name,
            url: source.url,
            format: source.format,
            updateIntervalMinutes: source.updateIntervalMinutes,
            isActive: source.isActive
        });
        setEditingId(source.id);
        setValidationErrors([]);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsCreating(false);
        resetForm();
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Керування джерелами API</h2>
                {!isCreating && (
                    <button
                        className="btn btn-primary gap-2"
                        onClick={() => setIsCreating(true)}
                    >
                        <Plus className="w-5 h-5" />
                        Додати джерело
                    </button>
                )}
            </div>

            {/* Create Form */}
            {isCreating && (
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h3 className="card-title">Нове джерело API</h3>

                        {/* Помилки валідації */}
                        {validationErrors.length > 0 && (
                            <div className="alert alert-error">
                                <div>
                                    <h4 className="font-bold">Помилки валідації:</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {validationErrors.map((error, index) => (
                                            <li key={index}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Назва *</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="ПриватБанк, НБУ, Монобанк..."
                                />
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">URL *</span>
                                </label>
                                <input
                                    type="url"
                                    className="input input-bordered"
                                    value={formData.url}
                                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                                    placeholder="https://api.example.com/rates"
                                />
                                <label className="label">
                                    <span className="label-text-alt">API повинно повертати JSON з валютними курсами</span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Формат</span>
                                </label>
                                <select
                                    className="select select-bordered"
                                    value={formData.format}
                                    onChange={(e) => setFormData({...formData, format: e.target.value})}
                                >
                                    <option value="JSON">JSON</option>
                                </select>
                                <label className="label">
                                    <span className="label-text-alt">Поки підтримується тільки JSON</span>
                                </label>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Інтервал оновлення (хвилини)</span>
                                </label>
                                <input
                                    type="number"
                                    className="input input-bordered"
                                    value={formData.updateIntervalMinutes}
                                    onChange={(e) => setFormData({...formData, updateIntervalMinutes: parseInt(e.target.value)})}
                                    min="1"
                                />
                            </div>

                            <div className="form-control">
                                <label className="label cursor-pointer">
                                    <span className="label-text">Активне</span>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="card-actions justify-between mt-6">
                            <button
                                className="btn btn-outline gap-2"
                                onClick={handleTestApi}
                                disabled={isTestingApi}
                            >
                                <TestTube2 className="w-4 h-4" />
                                {isTestingApi ? "Тестування..." : "Тестувати API"}
                            </button>

                            <div className="space-x-2">
                                <button className="btn btn-ghost gap-2" onClick={cancelEdit}>
                                    <X className="w-4 h-4" />
                                    Скасувати
                                </button>
                                <button
                                    className="btn btn-primary gap-2"
                                    onClick={handleCreate}
                                    disabled={isTestingApi}
                                >
                                    <Save className="w-4 h-4" />
                                    Створити
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sources Table */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Назва</th>
                                <th>URL</th>
                                <th>Формат</th>
                                <th>Інтервал (хв)</th>
                                <th>Статус</th>
                                <th>Останнє оновлення</th>
                                <th>Дії</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sources.map((source) => (
                                <tr key={source.id}>
                                    <td>{source.id}</td>
                                    <td>
                                        {editingId === source.id ? (
                                            <input
                                                type="text"
                                                className="input input-bordered input-sm w-full"
                                                value={formData.name}
                                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            />
                                        ) : (
                                            <span className="font-semibold">{source.name}</span>
                                        )}
                                    </td>
                                    <td>
                                        {editingId === source.id ? (
                                            <input
                                                type="url"
                                                className="input input-bordered input-sm w-full"
                                                value={formData.url}
                                                onChange={(e) => setFormData({...formData, url: e.target.value})}
                                            />
                                        ) : (
                                            <div className="text-sm font-mono truncate max-w-xs" title={source.url}>
                                                {source.url}
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="badge badge-outline">{source.format}</div>
                                    </td>
                                    <td>{source.updateIntervalMinutes}</td>
                                    <td>
                                        <button
                                            className={`btn btn-sm gap-2 ${source.isActive ?
                                                'btn-success' : 'btn-error'}`}
                                            onClick={() => toggleSourceStatus(source.id, source.isActive)}
                                        >
                                            {source.isActive ? (
                                                <>
                                                    <Power className="w-4 h-4" />
                                                    Активне
                                                </>
                                            ) : (
                                                <>
                                                    <PowerOff className="w-4 h-4" />
                                                    Неактивне
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td>
                                        {source.lastUpdateAt ? (
                                            <span className="text-sm">
                                                {new Date(source.lastUpdateAt).toLocaleString()}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500">Ніколи</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="join">
                                            {editingId === source.id ? (
                                                <>
                                                    <button
                                                        className="btn btn-sm btn-success join-item"
                                                        onClick={() => handleUpdate(source.id)}
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-ghost join-item"
                                                        onClick={cancelEdit}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        className="btn btn-sm btn-primary join-item"
                                                        onClick={() => startEdit(source)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-error join-item"
                                                        onClick={() => handleDelete(source.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApiSourcesManagement;