import { useExchangeRateStore } from "../store/useExchangeRateStore";
import { ArrowUp, ArrowDown } from "lucide-react";

const ExchangeRateTable = () => {
    const { rates, isLoading } = useExchangeRateStore();

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('uk-UA', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg"></span>
            </div>
        );
    }

    if (!rates || rates.length === 0) {
        return (
            <div className="alert alert-info">
                <span>Немає даних для відображення. Спробуйте змінити фільтри або оновити курси.</span>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
                <thead>
                    <tr>
                        <th>Банк</th>
                        <th>З валюти</th>
                        <th>В валюту</th>
                        <th>Курс купівлі</th>
                        <th>Курс продажу</th>
                        <th>Оновлено</th>
                    </tr>
                </thead>
                <tbody>
                    {rates.map((rate) => (
                        <tr key={rate.id} className="hover">
                            <td>
                                <div className="font-semibold">{rate.sourceName}</div>
                            </td>
                            <td>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{rate.fromCurrencySymbol}</span>
                                    <div>
                                        <div className="font-bold">{rate.fromCurrencyCode}</div>
                                        <div className="text-sm opacity-70">{rate.fromCurrencyName}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">{rate.toCurrencySymbol}</span>
                                    <div>
                                        <div className="font-bold">{rate.toCurrencyCode}</div>
                                        <div className="text-sm opacity-70">{rate.toCurrencyName}</div>
                                    </div>
                                </div>
                            </td>
                            <td>
                                <div className="badge badge-success badge-lg font-semibold">
                                    {rate.buyRate.toFixed(4)}
                                </div>
                            </td>
                            <td>
                                <div className="badge badge-error badge-lg font-semibold">
                                    {rate.sellRate.toFixed(4)}
                                </div>
                            </td>
                            <td>
                                <div className="text-sm">
                                    {formatDate(rate.fetchedAt)}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ExchangeRateTable;
