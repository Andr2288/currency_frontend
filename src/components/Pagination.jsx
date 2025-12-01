import { useExchangeRateStore } from "../store/useExchangeRateStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = () => {
    const { currentPage, totalPages, totalCount, setPage } = useExchangeRateStore();

    if (totalPages <= 1) return null;

    const handlePrevious = () => {
        if (currentPage > 1) {
            setPage(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            setPage(currentPage + 1);
        }
    };

    const getPageNumbers = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="flex justify-center items-center gap-2 my-6">
            <button
                className="btn btn-sm btn-outline"
                onClick={handlePrevious}
                disabled={currentPage === 1}
            >
                <ChevronLeft className="w-4 h-4" />
                Попередня
            </button>

            <div className="flex gap-1">
                {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                        <span key={`dots-${index}`} className="px-3 py-1">...</span>
                    ) : (
                        <button
                            key={page}
                            className={`btn btn-sm ${currentPage === page ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => setPage(page)}
                        >
                            {page}
                        </button>
                    )
                ))}
            </div>

            <button
                className="btn btn-sm btn-outline"
                onClick={handleNext}
                disabled={currentPage === totalPages}
            >
                Наступна
                <ChevronRight className="w-4 h-4" />
            </button>

            <div className="text-sm opacity-70 ml-4">
                Всього: {totalCount}
            </div>
        </div>
    );
};

export default Pagination;
