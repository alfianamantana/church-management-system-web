import React from 'react';

const SkeletonCalendar: React.FC = () => {
  return (
    <div className="calendar-wrapper">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-4">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-32 animate-pulse"></div>
        <div className="flex space-x-2">
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Days of Week Skeleton */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-6 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        ))}
      </div>

      {/* Calendar Grid Skeleton */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 dark:bg-gray-800 rounded p-1 animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-1"></div>
            <div className="space-y-1">
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonCalendar;
