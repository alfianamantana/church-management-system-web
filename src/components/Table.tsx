import React from 'react';

interface TableHead {
  label: string;
  key: string;
  thClass?: string;
  render?: (value: any, row: Record<string, any>, index: number) => React.ReactNode;
}

interface TableProps {
  heads: TableHead[];
  data: Record<string, any>[];
  className?: string;
  currentPage?: number;
  pageSize?: number;
  showIndex?: boolean;
  canEdit?: boolean;
  callbackEdit?: (row: Record<string, any>) => void;
  edit?: boolean;
  action?: boolean;
}

const Table: React.FC<TableProps> = ({ heads, data, currentPage = 1, pageSize = 10, showIndex = true, canEdit = false, callbackEdit, action = false }) => {
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
            {
              action && canEdit && (
                <th className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-left bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold">
                  Action
                </th>
              )
            }
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
                    {head.render ? head.render(row[head.key], row, i) : (row[head.key] ? row[head.key] : 'No data')}
                  </td>
                ))}
                {
                  canEdit && callbackEdit && (
                    <td className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
                      <button
                        onClick={() => callbackEdit(row)}
                        className="px-3 py-2 text-blue-500 rounded-md flex items-center gap-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-4 h-4">
                          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                      </button>
                    </td>
                  )
                }
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
