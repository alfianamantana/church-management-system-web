import React from "react";
const SkeletonPagination: React.FC = () => {
  return (
    <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-32"></div>
        <div className="flex space-x-2">
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="w-8 h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  )
}
export default SkeletonPagination;