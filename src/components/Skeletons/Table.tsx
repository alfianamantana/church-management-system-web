import React from "react";
const TableSkeleton: React.FC = () => {
  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 mr-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
            </div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 mr-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-28"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
            </div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 mr-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-36"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-28"></div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-12"></div>
            </div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default TableSkeleton;