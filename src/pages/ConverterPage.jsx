import { useState, useEffect } from "react";
import { ArrowLeftRight, RefreshCw, Building2 } from "lucide-react";
import { axiosInstance } from "../lib/axios";

const ConverterPage = () => {
    const [fromCurrency, setFromCurrency] = useState("USD");
    const [toCurrency, setToCurrency] = useState("UAH");
    const [amount, setAmount] = useState("100");
    const [selectedBank, setSelectedBank] = useState("");
    const [banks, setBanks] = useState([]);
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const currencies = [
        { code: "UAH", name: "Українська гривня", symbol: "₴" },
        { code: "USD", name: "Долар США", symbol: "$" },
        { code: "EUR", name: "Євро", symbol: "€" },
        { code: "PLN", name: "Польський злотий", symbol: "zł" }
    ];

    // Завантаження списку банків при ініціалізації
    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        try {
            const response = await axiosInstance.get("/ApiSources/active");
            setBanks(response.data);
        } catch (error) {
            console.error("Error fetching banks:", error);
        }
    };

    const handleConvert = async (e) => {
        e.preventDefault();

        if (!amount || parseFloat(amount) <= 0) {
            setError("Введіть коректну суму");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Параметри запиту
            const params = {
                from: fromCurrency,
                to: toCurrency,
                amount: parseFloat(amount)
            };

            // Додаємо банк, якщо обрано
            if (selectedBank) {
                params.source = selectedBank;
            }

            const response = await axiosInstance.get("/Conversion", { params });

            setResult(response.data);
        } catch (err) {
            console.error("Conversion error:", err);
            setError("Помилка конвертації. Спробуйте пізніше.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSwap = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
        setResult(null);
    };

    const getCurrencyInfo = (code) => {
        return currencies.find(c => c.code === code) || { name: code, symbol: code };
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold">Конвертер валют</h1>
                <p className="text-gray-600 mt-2">Швидка конвертація валют за актуальними курсами</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Converter Form */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Конвертувати</h2>

                        <form onSubmit={handleConvert}>
                            {/* From Currency */}
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text font-semibold">З валюти</span>
                                </label>
                                <select
                                    className="select select-bordered w-full select-lg"
                                    value={fromCurrency}
                                    onChange={(e) => {
                                        setFromCurrency(e.target.value);
                                        setResult(null);
                                    }}
                                >
                                    {currencies.map((currency) => (
                                        <option key={currency.code} value={currency.code}>
                                            {currency.symbol} {currency.code} - {currency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount */}
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text font-semibold">Сума</span>
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    className="input input-bordered w-full input-lg"
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                        setResult(null);
                                    }}
                                    placeholder="Введіть суму"
                                />
                            </div>

                            {/* Swap Button */}
                            <div className="flex justify-center mb-4">
                                <button
                                    type="button"
                                    className="btn btn-circle btn-outline"
                                    onClick={handleSwap}
                                >
                                    <ArrowLeftRight className="w-5 h-5" />
                                </button>
                            </div>

                            {/* To Currency */}
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text font-semibold">В валюту</span>
                                </label>
                                <select
                                    className="select select-bordered w-full select-lg"
                                    value={toCurrency}
                                    onChange={(e) => {
                                        setToCurrency(e.target.value);
                                        setResult(null);
                                    }}
                                >
                                    {currencies.map((currency) => (
                                        <option key={currency.code} value={currency.code}>
                                            {currency.symbol} {currency.code} - {currency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* NEW: Bank Selection */}
                            <div className="form-control mb-6">
                                <label className="label">
                                    <span className="label-text font-semibold flex items-center gap-2">
                                        <Building2 className="w-4 h-4" />
                                        Банк (необов'язково)
                                    </span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={selectedBank}
                                    onChange={(e) => {
                                        setSelectedBank(e.target.value);
                                        setResult(null);
                                    }}
                                >
                                    <option value="">Найкращий курс (автоматично)</option>
                                    {banks.map((bank) => (
                                        <option key={bank.id} value={bank.name}>
                                            {bank.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="label">
                                    <span className="label-text-alt text-gray-500">
                                        {selectedBank ? `Курс від ${selectedBank}` : "Система обере найвигідніший курс"}
                                    </span>
                                </div>
                            </div>

                            {/* Convert Button */}
                            <button
                                type="submit"
                                className={`btn btn-primary w-full btn-lg gap-2 ${isLoading ? 'loading' : ''}`}
                                disabled={isLoading}
                            >
                                {!isLoading && <RefreshCw className="w-5 h-5" />}
                                {isLoading ? "Конвертація..." : "Конвертувати"}
                            </button>

                            {/* Error */}
                            {error && (
                                <div className="alert alert-error mt-4">
                                    <span>{error}</span>
                                </div>
                            )}
                        </form>
                    </div>
                </div>

                {/* Result */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Результат</h2>

                        {result ? (
                            <div className="space-y-6">
                                {/* Main Result */}
                                <div className="bg-primary text-primary-content rounded-lg p-6">
                                    <div className="text-sm opacity-80 mb-2">
                                        {amount} {getCurrencyInfo(result.fromCurrencyCode).symbol} {result.fromCurrencyCode}
                                    </div>
                                    <div className="text-4xl font-bold">
                                        {result.convertedAmount.toFixed(2)} {getCurrencyInfo(result.toCurrencyCode).symbol}
                                    </div>
                                    <div className="text-sm opacity-80 mt-2">
                                        {result.toCurrencyCode}
                                    </div>
                                </div>

                                {/* Exchange Rate Info */}
                                <div className="divider"></div>

                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Курс:</span>
                                        <span className="font-semibold">
                                            1 {result.fromCurrencyCode} = {result.exchangeRate.toFixed(4)} {result.toCurrencyCode}
                                        </span>
                                    </div>

                                    {/* Enhanced Source Display */}
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Джерело:</span>
                                        <span className="font-semibold flex items-center gap-2">
                                            <Building2 className="w-4 h-4" />
                                            {result.sourceName}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Оновлено:</span>
                                        <span className="font-semibold">
                                            {new Date(result.rateDate).toLocaleString('uk-UA', {
                                                year: 'numeric',
                                                month: '2-digit',
                                                day: '2-digit',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>

                                    {/* NEW: Bank Selection Info */}
                                    {selectedBank && (
                                        <div className="alert alert-info">
                                            <Building2 className="w-5 h-5" />
                                            <span>Курс від {selectedBank}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Quick Conversion Tips */}
                                <div className="divider"></div>

                                <div className="bg-base-200 rounded-lg p-4">
                                    <div className="text-sm space-y-1">
                                        <div>• Курс оновлюється автоматично кожні 10 хвилин</div>
                                        <div>• НБУ - офіційний курс (оновлюється раз на день)</div>
                                        <div>• ПриватБанк - комерційний курс (може змінюватися частіше)</div>
                                        <div>• Без вибору банку система знайде найвигідніший курс</div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <ArrowLeftRight className="w-16 h-16 mb-4 opacity-50" />
                                <p className="text-lg mb-2">Виберіть валюти та натисніть "Конвертувати"</p>
                                <p className="text-sm">Оберіть конкретний банк або залиште автоматичний вибір</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Additional Info Section */}
            <div className="mt-8">
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body">
                        <h3 className="text-xl font-bold mb-4">🏦 Доступні банки</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {banks.map((bank) => (
                                <div key={bank.id} className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
                                    <Building2 className="w-5 h-5 text-primary" />
                                    <span className="font-medium">{bank.name}</span>
                                    {selectedBank === bank.name && (
                                        <div className="badge badge-primary badge-sm">Обрано</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {banks.length === 0 && (
                            <div className="text-center text-gray-500">
                                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>Завантаження списку банків...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConverterPage;