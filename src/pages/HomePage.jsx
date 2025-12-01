import { useEffect } from "react";
import { useExchangeRateStore } from "../store/useExchangeRateStore";
import ExchangeRateFilters from "../components/ExchangeRateFilters";
import ExchangeRateTable from "../components/ExchangeRateTable";
import Pagination from "../components/Pagination";
import { RefreshCw } from "lucide-react";

const HomePage = () => {
    const { fetchRates, refreshRates, isLoading } = useExchangeRateStore();

    useEffect(() => {
        fetchRates();

        // Автооновлення кожні 60 секунд
        const interval = setInterval(() => {
            fetchRates();
        }, 60000);

        return () => clearInterval(interval);
    }, [fetchRates]);

    const handleManualRefresh = async () => {
        await refreshRates();
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-4xl font-bold">Курси валют</h1>
                    <p className="text-gray-600 mt-2">Актуальні курси від банків України</p>
                </div>
                <button 
                    className={`btn btn-primary gap-2 ${isLoading ? 'loading' : ''}`}
                    onClick={handleManualRefresh}
                    disabled={isLoading}
                >
                    {!isLoading && <RefreshCw className="w-5 h-5" />}
                    Оновити курси
                </button>
            </div>

            {/* Filters */}
            <ExchangeRateFilters />

            {/* Table */}
            <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                    <ExchangeRateTable />
                    <Pagination />
                </div>
            </div>
        </div>
    );
};

export default HomePage;
