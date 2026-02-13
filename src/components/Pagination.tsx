import React from 'react';
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  pageSize?: number;
  totalItems?: number;
  id: string;
}

const Pagination: React.FC<PaginationProps> = ({ id, currentPage, totalPages, onPageChange, pageSize = 10, totalItems = 0 }) => {
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
    <div id={id} className={`border-border`}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground min-w-[140px]">
          {`Showing ${from} to ${to} of ${totalItems}`}
        </div>
        <nav className="flex gap-2" aria-label="Pagination">
          <button
            className="w-8 h-8 flex items-center justify-center rounded bg-muted text-muted-foreground hover:bg-muted disabled:opacity-50"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            aria-label="First"
          >
            &lt;&lt;
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded bg-muted text-muted-foreground hover:bg-muted disabled:opacity-50"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous"
          >
            &lt;
          </button>
          {pages.map(page => (
            <button
              key={page}
              className={`w-8 h-8 flex items-center justify-center border border-border bg-card text-muted-foreground hover:bg-primary/10 ${page === currentPage ? 'font-bold bg-primary/10 border-primary' : ''}`}
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
          <button
            className="w-8 h-8 flex items-center justify-center rounded bg-muted text-muted-foreground hover:bg-muted disabled:opacity-50"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next"
          >
            &gt;
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center rounded bg-muted text-muted-foreground hover:bg-muted disabled:opacity-50"
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
