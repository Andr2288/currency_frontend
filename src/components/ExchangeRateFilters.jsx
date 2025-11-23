import { useExchangeRateStore } from "../store/useExchangeRateStore";
import { useEffect } from "react";

const ExchangeRateFilters = () => {
    const { 
        banks, 
        currencies, 
        selectedBank, 
        selectedFromCurrency, 
        selectedToCurrency,
        setFilters,
        clearFilters,
        fetchBanks,
        fetchCurrencies
    } = useExchangeRateStore();

    useEffect(() => {
        fetchBanks();
        fetchCurrencies();
    }, [fetchBanks, fetchCurrencies]);

    const handleFilterChange = (filterType, value) => {
        const newFilters = {
            bank: selectedBank,
            from: selectedFromCurrency,
            to: selectedToCurrency
        };
        newFilters[filterType] = value;
        setFilters(newFilters);
    };

    const handleClear = () => {
        clearFilters();
    };

    return (
        <div className="card bg-base-200 shadow-md mb-6">
            <div className="card-body">
                <h3 className="card-title text-lg mb-4">Фільтри</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Bank Filter */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Банк</span>
                        </label>
                        <select 
                            className="select select-bordered w-full"
                            value={selectedBank}
                            onChange={(e) => handleFilterChange("bank", e.target.value)}
                        >
                            <option value="">Всі банки</option>
                            {banks.map((bank) => (
                                <option key={bank.id} value={bank.name}>
                                    {bank.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* From Currency Filter */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">З валюти</span>
                        </label>
                        <select 
                            className="select select-bordered w-full"
                            value={selectedFromCurrency}
                            onChange={(e) => handleFilterChange("from", e.target.value)}
                        >
                            <option value="">Всі валюти</option>
                            {currencies.map((currency) => (
                                <option key={currency.id} value={currency.code}>
                                    {currency.code} - {currency.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* To Currency Filter */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">В валюту</span>
                        </label>
                        <select 
                            className="select select-bordered w-full"
                            value={selectedToCurrency}
                            onChange={(e) => handleFilterChange("to", e.target.value)}
                        >
                            <option value="">Всі валюти</option>
                            {currencies.map((currency) => (
                                <option key={currency.id} value={currency.code}>
                                    {currency.code} - {currency.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Clear Button */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text opacity-0">Action</span>
                        </label>
                        <button 
                            className="btn btn-outline btn-error w-full"
                            onClick={handleClear}
                        >
                            Очистити
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExchangeRateFilters;
