import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";

export const useExchangeRateStore = create((set, get) => ({
    rates: [],
    currencies: [],
    banks: [],
    isLoading: false,
    error: null,
    
    // Pagination
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 0,
    
    // Filters
    selectedBank: "",
    selectedFromCurrency: "",
    selectedToCurrency: "",

    fetchRates: async () => {
        set({ isLoading: true, error: null });
        try {
            const { currentPage, pageSize, selectedBank, selectedFromCurrency, selectedToCurrency } = get();
            
            let url = `/ExchangeRates/latest?page=${currentPage}&pageSize=${pageSize}`;
            
            // Якщо є фільтри - використовуємо filter endpoint
            if (selectedBank || selectedFromCurrency || selectedToCurrency) {
                url = `/ExchangeRates/filter?page=${currentPage}&pageSize=${pageSize}`;
                if (selectedBank) url += `&bank=${selectedBank}`;
                if (selectedFromCurrency) url += `&from=${selectedFromCurrency}`;
                if (selectedToCurrency) url += `&to=${selectedToCurrency}`;
            }
            
            const res = await axiosInstance.get(url);
            
            set({
                rates: res.data.data,
                currentPage: res.data.page,
                pageSize: res.data.pageSize,
                totalCount: res.data.totalCount,
                totalPages: res.data.totalPages,
                isLoading: false
            });
        } catch (error) {
            console.error("Error fetching rates:", error);
            set({ error: error.message, isLoading: false });
        }
    },

    fetchCurrencies: async () => {
        try {
            const res = await axiosInstance.get("/Currencies");
            set({ currencies: res.data });
        } catch (error) {
            console.error("Error fetching currencies:", error);
        }
    },

    fetchBanks: async () => {
        try {
            const res = await axiosInstance.get("/ApiSources/active");
            set({ banks: res.data });
        } catch (error) {
            console.error("Error fetching banks:", error);
        }
    },

    setPage: (page) => {
        set({ currentPage: page });
        get().fetchRates();
    },

    setFilters: (filters) => {
        set({
            selectedBank: filters.bank || "",
            selectedFromCurrency: filters.from || "",
            selectedToCurrency: filters.to || "",
            currentPage: 1 // Reset to first page when filtering
        });
        get().fetchRates();
    },

    clearFilters: () => {
        set({
            selectedBank: "",
            selectedFromCurrency: "",
            selectedToCurrency: "",
            currentPage: 1
        });
        get().fetchRates();
    },

    refreshRates: async () => {
        try {
            await axiosInstance.post("/ExchangeRates/fetch");
            await get().fetchRates();
        } catch (error) {
            console.error("Error refreshing rates:", error);
        }
    }
}));
