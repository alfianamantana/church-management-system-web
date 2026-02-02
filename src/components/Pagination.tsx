import React from 'react';
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  pageSize?: number;
  totalItems?: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, pageSize = 10, totalItems = 0 }) => {
  if (totalPages <= 1) return null;

  const startPage = Math.max(1, currentPage - 1);
  const endPage = Math.min(totalPages, currentPage + 1);
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={`border-gray-200 dark:border-gray-700`}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400 min-w-[140px]">
          {`Showing ${from} to ${to} of ${totalItems}`}
        </div>
        <nav className="flex gap-2" aria-label="Pagination">
          <button
            className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="First"
          >
            &lt;&lt;
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous"
          >
            &lt;
          </button>
          {pages.map(page => (
            <button
              key={page}
              className={`w-8 h-8 flex items-center justify-center border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900 ${page === currentPage ? 'font-bold bg-blue-100 dark:bg-blue-900 border-blue-400 dark:border-blue-600' : ''}`}
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
          <button
            className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next"
          >
            &gt;
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            aria-label="Last"
          >
            &gt;&gt;
          </button>
        </nav>
      </div>
    </div>
  );
};

export default Pagination;
