import React from 'react';

interface TableHead {
  label: string;
  key: string;
  thClass?: string;
}

interface TableProps {
  heads: TableHead[];
  data: Record<string, any>[];
  className?: string;
  currentPage?: number;
  pageSize?: number;
}

const Table: React.FC<TableProps> = ({ heads, data, currentPage = 1, pageSize = 10 }) => {
  const showIndex = currentPage > 0 && pageSize > 0;
  return (
    <div className={`overflow-x-auto`}>
      <table className="min-w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg">
        <thead>
          <tr>
            {showIndex && (
              <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-left bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold">
                No
              </th>
            )}
            {heads.map((head, idx) => (
              <th
                key={idx}
                className={
                  head.thClass + ' px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-left bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold'
                }
              >
                {head.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={heads.length + (showIndex ? 1 : 0)} className="px-4 py-3 text-center text-gray-400 dark:text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                {showIndex && (
                  <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                    {(currentPage - 1) * pageSize + i + 1}
                  </td>
                )}
                {heads.map((head, j) => (
                  <td key={j} className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                    {row[head.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
