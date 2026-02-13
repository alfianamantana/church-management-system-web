import React from 'react';

interface TableHead {
  label: string;
  key: string;
  thClass?: string;
  tdClass?: string;
  render?: (value: any, row: Record<string, any>, index: number) => React.ReactNode;
}

interface TableProps {
  heads: TableHead[];
  data: Record<string, any>[];
  className?: string;
  currentPage?: number;
  pageSize?: number;
  showIndex?: boolean;
  canDelete?: boolean;
  callbackDelete?: (row: any) => void;
  canEdit?: boolean;
  callbackEdit?: (row: any) => void;
  edit?: boolean;
  action?: boolean;
  canView?: boolean;
  callbackView?: (row: any) => void;
  id: string;
}

const Table: React.FC<TableProps> = ({ id, heads, data, currentPage = 1, pageSize = 10, showIndex = true, canDelete = false, callbackDelete, canEdit = false, callbackEdit, canView = false, callbackView, action = false }) => {
  return (
    <div id={id} className={`overflow-x-auto`}>
      <table className="min-w-full border border-border bg-card rounded-lg">
        <thead>
          <tr>
            {showIndex && (
              <th className="px-4 py-2 border-b border-border text-left bg-muted text-muted-foreground font-semibold">
                No
              </th>
            )}
            {heads.map((head, idx) => (
              <th
                key={idx}
                className={
                  head.thClass + ' px-4 py-2 border-b border-border text-left bg-muted text-muted-foreground font-semibold'
                }
              >
                {head.label}
              </th>
            ))}
            {
              action && (canEdit || canDelete || canView) && (
                <th className="px-4 py-2 border-b border-border text-left bg-muted text-muted-foreground font-semibold">
                  Action
                </th>
              )
            }
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={heads.length + (showIndex ? 1 : 0) + ((canEdit || canDelete || canView) ? 1 : 0)} className="px-4 py-3 text-center text-muted-foreground">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} className="hover:bg-muted transition-all duration-200">
                {showIndex && (
                  <td className="px-4 py-2 border-b border-border text-foreground">
                    {(currentPage - 1) * pageSize + i + 1}
                  </td>
                )}
                {heads.map((head, j) => (
                  <td key={j} className="px-4 py-2 border-b border-border text-foreground">
                    {head.render ? head.render(row[head.key], row, i) : (row[head.key] ? row[head.key] : 'No data')}
                  </td>
                ))}
                {
                  (canEdit || canDelete || canView) && (
                    <td className="px-4 py-2 border-b border-border text-foreground">
                      <div className="flex gap-1">
                        {canEdit && callbackEdit && (
                          <button
                            onClick={() => callbackEdit(row)}
                            className="px-3 py-2 text-primary rounded-md flex items-center gap-1 hover:bg-primary/10"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap='round' strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                            </svg>
                          </button>
                        )}
                        {canDelete && callbackDelete && (
                          <button
                            onClick={() => callbackDelete(row)}
                            className="px-3 py-2 text-destructive rounded-md flex items-center gap-1 hover:bg-destructive/10"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap='round' strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                          </button>
                        )}
                        {canView && callbackView && (
                          <button
                            onClick={() => callbackView(row)}
                            className="px-3 py-2 text-success rounded-md flex items-center gap-1 hover:bg-success/10"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                              <path strokeLinecap='round' strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963
  7.178a1.012 1.012 0 0 1 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                              <path strokeLinecap='round' strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
                            </svg>
                          </button>
                        )}
                      </div>
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
