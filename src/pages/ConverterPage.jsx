import { useState, useEffect } from "react";
import { ArrowLeftRight, RefreshCw, Building2 } from "lucide-react";
import { axiosInstance } from "../lib/axios";

const ConverterPage = () => {
    const [fromCurrency, setFromCurrency] = useState("USD");
    const [toCurrency, setToCurrency] = useState("UAH");
    const [amount, setAmount] = useState("100");
    const [selectedBank, setSelectedBank] = useState("");
    const [conversionType, setConversionType] = useState("sell"); // buy, sell, average
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
            const params = {
                from: fromCurrency,
                to: toCurrency,
                amount: parseFloat(amount),
                type: conversionType
            };

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
                                    className="select select-bordered w-full"
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

                            {/* Swap Button */}
                            <div className="flex justify-center mb-4">
                                <button
                                    type="button"
                                    className="btn btn-circle btn-outline"
                                    onClick={handleSwap}
                                    title="Поміняти місцями"
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
                                    className="select select-bordered w-full"
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

                            {/* Amount */}
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text font-semibold">Сума</span>
                                </label>
                                <input
                                    type="number"
                                    className="input input-bordered w-full"
                                    value={amount}
                                    onChange={(e) => {
                                        setAmount(e.target.value);
                                        setResult(null);
                                    }}
                                    placeholder="Введіть суму"
                                    step="0.01"
                                    min="0"
                                />
                            </div>

                            {/* Type Selection - Minimal */}
                            <div className="form-control mb-4">
                                <label className="label">
                                    <span className="label-text font-semibold">Тип курсу</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={conversionType}
                                    onChange={(e) => {
                                        setConversionType(e.target.value);
                                        setResult(null);
                                    }}
                                >
                                    <option value="buy">Купівля (банк купує у вас)</option>
                                    <option value="sell">Продаж (ви купуєте у банку)</option>
                                    <option value="average">Середній курс</option>
                                </select>
                            </div>

                            {/* Bank Selection */}
                            <div className="form-control mb-6">
                                <label className="label">
                                    <span className="label-text font-semibold">Банк (опціонально)</span>
                                </label>
                                <select
                                    className="select select-bordered w-full"
                                    value={selectedBank}
                                    onChange={(e) => {
                                        setSelectedBank(e.target.value);
                                        setResult(null);
                                    }}
                                >
                                    <option value="">Автоматичний вибір</option>
                                    {banks.map((bank) => (
                                        <option key={bank.id} value={bank.name}>
                                            {bank.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="alert alert-error mb-4">
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Convert Button */}
                            <button
                                type="submit"
                                className={`btn btn-primary w-full gap-2 ${isLoading ? 'loading' : ''}`}
                                disabled={isLoading || !amount || !fromCurrency || !toCurrency}
                            >
                                {!isLoading && <RefreshCw className="w-5 h-5" />}
                                Конвертувати
                            </button>
                        </form>
                    </div>
                </div>

                {/* Result */}
                <div>
                    {result ? (
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h3 className="text-2xl font-bold mb-4">Результат</h3>

                                {/* Main Result */}
                                <div className="text-center bg-primary text-primary-content rounded-lg p-6 mb-4">
                                    <div className="text-lg mb-2">
                                        {parseFloat(amount).toLocaleString('uk-UA')} {getCurrencyInfo(fromCurrency).symbol}
                                    </div>
                                    <div className="text-3xl font-bold">
                                        {result.convertedAmount.toLocaleString('uk-UA', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 4
                                        })} {getCurrencyInfo(toCurrency).symbol}
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Курс:</span>
                                        <span className="font-semibold">
                                            {result.exchangeRate.toLocaleString('uk-UA', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 6
                                            })}
                                        </span>
                                    </div>

                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Тип:</span>
                                        <span className="font-semibold">
                                            {conversionType === 'buy' ? 'Купівля' :
                                                conversionType === 'sell' ? 'Продаж' : 'Середній'}
                                        </span>
                                    </div>

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
                                </div>

                                {/* Additional Info */}
                                {selectedBank && (
                                    <div className="alert alert-info mt-4">
                                        <span>Курс від {selectedBank}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <div className="text-center py-12 text-gray-500">
                                    <ArrowLeftRight className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg mb-2">Виберіть валюти та натисніть "Конвертувати"</p>
                                    <p className="text-sm">
                                        Оберіть тип курсу та конкретний банк або залиште автоматичний вибір
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
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