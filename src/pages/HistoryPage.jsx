import { useState, useEffect } from "react";
import { Calendar, TrendingUp, TrendingDown, Minus, Building2, RefreshCw, Filter, BarChart3 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { axiosInstance } from "../lib/axios";

const HistoryPage = () => {
    const [historyData, setHistoryData] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState("week");
    const [selectedCurrency, setSelectedCurrency] = useState({ from: "USD", to: "UAH" });
    const [selectedBank, setSelectedBank] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [banks, setBanks] = useState([]);
    const [error, setError] = useState(null);

    const currencies = [
        { code: "USD", name: "Долар США", symbol: "$" },
        { code: "EUR", name: "Євро", symbol: "€" },
        { code: "PLN", name: "Польський злотий", symbol: "zł" },
        { code: "UAH", name: "Українська гривня", symbol: "₴" }
    ];

    const periods = [
        { value: "today", label: "Сьогодні", days: 0 },
        { value: "week", label: "Тиждень", days: 7 },
        { value: "month", label: "Місяць", days: 30 }
    ];

    useEffect(() => {
        fetchBanks();
        fetchHistoryData();
    }, [selectedPeriod, selectedCurrency, selectedBank]);

    const fetchBanks = async () => {
        try {
            const response = await axiosInstance.get("/ApiSources/active");
            setBanks(response.data);
        } catch (error) {
            console.error("Error fetching banks:", error);
        }
    };

    const fetchHistoryData = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams();
            if (selectedCurrency.from) params.append('from', selectedCurrency.from);
            if (selectedCurrency.to) params.append('to', selectedCurrency.to);
            if (selectedBank) params.append('source', selectedBank);

            const response = await axiosInstance.get(`/History/${selectedPeriod}?${params.toString()}`);
            setHistoryData(response.data);
        } catch (err) {
            console.error("Error fetching history:", err);
            setError("Помилка завантаження історичних даних");
        } finally {
            setIsLoading(false);
        }
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'up':
                return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'down':
                return <TrendingDown className="w-4 h-4 text-red-500" />;
            default:
                return <Minus className="w-4 h-4 text-gray-400" />;
        }
    };

    const getTrendColor = (trend) => {
        switch (trend) {
            case 'up': return 'text-green-600';
            case 'down': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const formatChange = (change) => {
        if (!change) return '—';
        const sign = change > 0 ? '+' : '';
        return `${sign}${change.toFixed(4)}`;
    };

    // Підготовка даних для графіка
    const prepareChartData = (data) => {
        if (!data || data.length === 0) return [];

        return data.map(item => ({
            date: formatDateShort(item.date),
            fullDate: formatDate(item.date),
            buy: parseFloat(item.buy),
            sell: parseFloat(item.sell),
            source: item.source
        }));
    };

    // Кастомний Tooltip для графіка
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-base-100 border border-base-300 rounded-lg shadow-lg p-3">
                    <p className="font-semibold mb-2">{payload[0].payload.fullDate}</p>
                    <p className="text-sm text-gray-600 mb-1">{payload[0].payload.source}</p>
                    <div className="flex gap-4">
                        <div>
                            <p className="text-xs text-gray-500">Купівля</p>
                            <p className="font-semibold text-green-600">
                                {payload[0].value.toFixed(4)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Продаж</p>
                            <p className="font-semibold text-red-600">
                                {payload[1]?.value.toFixed(4)}
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Рендер графіка з Recharts
    const renderChart = (data) => {
        if (!data || data.length === 0) return null;

        const chartData = prepareChartData(data);
        const rates = chartData.map(item => item.buy);
        const minRate = Math.min(...rates);
        const maxRate = Math.max(...rates);
        const isStable = maxRate - minRate < 0.01;

        if (isStable) {
            return (
                <div className="bg-base-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">📈 Графік зміни курсу</h3>
                        <div className="text-sm text-gray-500">
                            Стабільний курс: {rates[0].toFixed(4)}
                        </div>
                    </div>
                    <div className="h-64 bg-base-300 rounded flex items-center justify-center">
                        <div className="text-center text-gray-500">
                            <Minus className="w-12 h-12 mx-auto mb-3" />
                            <p className="text-lg font-medium">Курс стабільний</p>
                            <p className="text-sm">Зміни менше 0.01</p>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-base-200 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                        <BarChart3 className="w-5 h-5" />
                        Графік зміни курсу
                    </h3>
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Купівля</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span>Продаж</span>
                        </div>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBuy" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorSell" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            domain={['auto', 'auto']}
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                            tickFormatter={(value) => value.toFixed(2)}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="buy"
                            stroke="#10b981"
                            strokeWidth={2}
                            fill="url(#colorBuy)"
                            name="Купівля"
                        />
                        <Area
                            type="monotone"
                            dataKey="sell"
                            stroke="#ef4444"
                            strokeWidth={2}
                            fill="url(#colorSell)"
                            name="Продаж"
                        />
                    </AreaChart>
                </ResponsiveContainer>

                <div className="flex justify-between mt-4 text-sm text-gray-500">
                    <span>Мін: {minRate.toFixed(4)}</span>
                    <span>Макс: {maxRate.toFixed(4)}</span>
                    <span>Різниця: {(maxRate - minRate).toFixed(4)}</span>
                </div>
            </div>
        );
    };

    const formatDateShort = (dateString) => {
        if (!dateString) return '';

        let formattedDate = dateString;
        if (!/:\d{2}:\d{2}/.test(dateString) && /:\d{2}$/.test(dateString)) {
            formattedDate = dateString + ':00';
        }

        const date = new Date(formattedDate);
        if (isNaN(date.getTime())) return dateString;

        return date.toLocaleString('uk-UA', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Invalid Date';

        let formattedDate = dateString;
        if (!/:\d{2}:\d{2}/.test(dateString) && /:\d{2}$/.test(dateString)) {
            formattedDate = dateString + ':00';
        }

        const date = new Date(formattedDate);
        if (isNaN(date.getTime())) return dateString;

        return date.toLocaleString('uk-UA', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold flex items-center gap-3">
                    📊 Історія курсів
                </h1>
                <p className="text-gray-600 mt-2">Динаміка зміни валютних курсів за різні періоди</p>
            </div>

            {/* Filters */}
            <div className="card bg-base-100 shadow-xl mb-6">
                <div className="card-body">
                    <h2 className="card-title flex items-center gap-2 mb-4">
                        <Filter className="w-5 h-5" />
                        Фільтри
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Period Selection */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Період</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                            >
                                {periods.map(period => (
                                    <option key={period.value} value={period.value}>
                                        {period.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Currency From */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">З валюти</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
                                value={selectedCurrency.from}
                                onChange={(e) => setSelectedCurrency({
                                    ...selectedCurrency,
                                    from: e.target.value
                                })}
                            >
                                {currencies.map(currency => (
                                    <option key={currency.code} value={currency.code}>
                                        {currency.symbol} {currency.code}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Currency To */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">В валюту</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
                                value={selectedCurrency.to}
                                onChange={(e) => setSelectedCurrency({
                                    ...selectedCurrency,
                                    to: e.target.value
                                })}
                            >
                                {currencies.map(currency => (
                                    <option key={currency.code} value={currency.code}>
                                        {currency.symbol} {currency.code}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Bank Selection */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold">Банк</span>
                            </label>
                            <select
                                className="select select-bordered w-full"
                                value={selectedBank}
                                onChange={(e) => setSelectedBank(e.target.value)}
                            >
                                <option value="">Всі банки</option>
                                {banks.map(bank => (
                                    <option key={bank.id} value={bank.name}>
                                        {bank.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end mt-4">
                        <button
                            className={`btn btn-primary gap-2 ${isLoading ? 'loading' : ''}`}
                            onClick={fetchHistoryData}
                            disabled={isLoading}
                        >
                            {!isLoading && <RefreshCw className="w-4 h-4" />}
                            Оновити дані
                        </button>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <div className="flex items-center justify-center py-12">
                            <span className="loading loading-spinner loading-lg"></span>
                            <span className="ml-4 text-lg">Завантаження історії курсів...</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="alert alert-error mb-6">
                    <span>{error}</span>
                </div>
            )}

            {/* Results */}
            {!isLoading && !error && (
                <>
                    {historyData.data && historyData.data.length > 0 ? (
                        <>
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="stat bg-base-100 shadow-xl rounded-lg">
                                    <div className="stat-figure text-primary">
                                        <Calendar className="w-8 h-8" />
                                    </div>
                                    <div className="stat-title">Період</div>
                                    <div className="stat-value text-lg">{historyData.period}</div>
                                    <div className="stat-desc">{historyData.count} записів</div>
                                </div>

                                <div className="stat bg-base-100 shadow-xl rounded-lg">
                                    <div className="stat-figure text-secondary">
                                        <Building2 className="w-8 h-8" />
                                    </div>
                                    <div className="stat-title">Валютна пара</div>
                                    <div className="stat-value text-lg">
                                        {selectedCurrency.from}/{selectedCurrency.to}
                                    </div>
                                    <div className="stat-desc">
                                        {selectedBank || "Всі банки"}
                                    </div>
                                </div>

                                <div className="stat bg-base-100 shadow-xl rounded-lg">
                                    <div className="stat-figure text-accent">
                                        <BarChart3 className="w-8 h-8" />
                                    </div>
                                    <div className="stat-title">Останній курс</div>
                                    <div className="stat-value text-lg">
                                        {historyData.data[historyData.data.length - 1]?.buy?.toFixed(4) || '—'}
                                    </div>
                                    <div className="stat-desc">
                                        {formatDate(historyData.data[historyData.data.length - 1]?.date)}
                                    </div>
                                </div>
                            </div>

                            {/* Chart */}
                            {renderChart(historyData.data)}

                            {/* History Table */}
                            <div className="card bg-base-100 shadow-xl">
                                <div className="card-body">
                                    <h2 className="card-title mb-4">Детальна історія</h2>

                                    <div className="overflow-x-auto">
                                        <table className="table table-zebra w-full">
                                            <thead>
                                            <tr>
                                                <th>Дата та час</th>
                                                <th>Джерело</th>
                                                <th>Купівля</th>
                                                <th>Продаж</th>
                                                <th>Зміна</th>
                                                <th>Тренд</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {historyData.data.map((item, index) => (
                                                <tr key={index} className="hover">
                                                    <td className="font-mono text-sm">
                                                        {formatDate(item.date)}
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <Building2 className="w-4 h-4" />
                                                            <span className="font-medium">{item.source}</span>
                                                        </div>
                                                    </td>
                                                    <td className="font-semibold text-green-600">
                                                        {parseFloat(item.buy).toFixed(4)}
                                                    </td>
                                                    <td className="font-semibold text-red-600">
                                                        {parseFloat(item.sell).toFixed(4)}
                                                    </td>
                                                    <td className={`font-medium ${getTrendColor(item.trend)}`}>
                                                        {formatChange(item.change)}
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-1">
                                                            {getTrendIcon(item.trend)}
                                                            <span className={`text-sm font-medium ${getTrendColor(item.trend)}`}>
                                                                {item.trend === 'up' ? 'Зростання' :
                                                                    item.trend === 'down' ? 'Спад' : 'Стабільно'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <div className="text-center py-12">
                                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-xl font-semibold mb-2">Дані відсутні</h3>
                                    <p className="text-gray-600 mb-4">
                                        Немає історичних даних для обраних параметрів
                                    </p>
                                    <div className="text-sm text-gray-500">
                                        💡 Спробуйте:
                                        <ul className="list-disc list-inside mt-2 text-left max-w-md mx-auto">
                                            <li>Обрати інший період (тиждень замість дня)</li>
                                            <li>Змінити валютну пару</li>
                                            <li>Переконатися, що система збирає дані</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default HistoryPage;