import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Power, PowerOff, Save, X } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const ApiSourcesManagement = () => {
    const [sources, setSources] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);

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

    const handleCreate = async () => {
        try {
            await axiosInstance.post("/ApiSources", formData);
            toast.success("Джерело створено");
            setIsCreating(false);
            resetForm();
            fetchSources();
        } catch (error) {
            console.error("Error creating source:", error);
            toast.error("Помилка створення джерела");
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
            toast.error("Помилка оновлення джерела");
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

    const handleToggleActive = async (id) => {
        try {
            await axiosInstance.patch(`/ApiSources/${id}/toggle`);
            toast.success("Статус змінено");
            fetchSources();
        } catch (error) {
            console.error("Error toggling source:", error);
            toast.error("Помилка зміни статусу");
        }
    };

    const startEdit = (source) => {
        setEditingId(source.id);
        setFormData({
            name: source.name,
            url: source.url,
            format: source.format,
            updateIntervalMinutes: source.updateIntervalMinutes,
            isActive: source.isActive
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setIsCreating(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            name: "",
            url: "",
            format: "JSON",
            updateIntervalMinutes: 60,
            isActive: true
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Ніколи";
        return new Date(dateString).toLocaleString('uk-UA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with Create Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Управління джерелами API</h2>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Назва</span>
                                </label>
                                <input
                                    type="text"
                                    className="input input-bordered"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="PrivatBank, NBU, Monobank..."
                                />
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
                                    <option value="XML">XML</option>
                                    <option value="HTML">HTML</option>
                                </select>
                            </div>

                            <div className="form-control md:col-span-2">
                                <label className="label">
                                    <span className="label-text">URL API</span>
                                </label>
                                <input
                                    type="url"
                                    className="input input-bordered"
                                    value={formData.url}
                                    onChange={(e) => setFormData({...formData, url: e.target.value})}
                                    placeholder="https://api.example.com/rates"
                                />
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

                        <div className="card-actions justify-end mt-4">
                            <button className="btn btn-ghost" onClick={cancelEdit}>
                                <X className="w-4 h-4" />
                                Скасувати
                            </button>
                            <button className="btn btn-primary" onClick={handleCreate}>
                                <Save className="w-4 h-4" />
                                Створити
                            </button>
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
                                        {editingId === source.id ? (
                                            <select
                                                className="select select-bordered select-sm"
                                                value={formData.format}
                                                onChange={(e) => setFormData({...formData, format: e.target.value})}
                                            >
                                                <option value="JSON">JSON</option>
                                                <option value="XML">XML</option>
                                                <option value="HTML">HTML</option>
                                            </select>
                                        ) : (
                                            <div className="badge badge-outline">{formData.format}</div>
                                        )}
                                    </td>
                                    <td>
                                        {editingId === source.id ? (
                                            <input
                                                type="number"
                                                className="input input-bordered input-sm w-20"
                                                value={formData.updateIntervalMinutes}
                                                onChange={(e) => setFormData({...formData, updateIntervalMinutes: parseInt(e.target.value)})}
                                            />
                                        ) : (
                                            source.updateIntervalMinutes
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className={`btn btn-sm gap-2 ${source.isActive ? 'btn-success' : 'btn-error'}`}
                                            onClick={() => handleToggleActive(source.id)}
                                        >
                                            {source.isActive ? (
                                                <>
                                                    <Power className="w-3 h-3" />
                                                    Активний
                                                </>
                                            ) : (
                                                <>
                                                    <PowerOff className="w-3 h-3" />
                                                    Неактивний
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="text-sm">
                                        {formatDate(source.lastUpdateAt)}
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            {editingId === source.id ? (
                                                <>
                                                    <button
                                                        className="btn btn-sm btn-success"
                                                        onClick={() => handleUpdate(source.id)}
                                                    >
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-ghost"
                                                        onClick={cancelEdit}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        className="btn btn-sm btn-ghost"
                                                        onClick={() => startEdit(source)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-ghost text-error"
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