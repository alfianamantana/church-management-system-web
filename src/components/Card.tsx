import React, { PropsWithChildren, ReactNode } from 'react';

interface CardProps extends PropsWithChildren {
  title?: ReactNode;
  className?: string;
}
// rounded-md bg-white p-5 shadow dark:bg-black
const Card: React.FC<CardProps> = ({ title, className = '', children }) => {
  return (
    <div className={`bg-white border dark:border-gray-700 dark:bg-black rounded-lg hover:shadow transition-all duration-200 dark:hover:shadow-lg p-6 flex flex-col gap-y-4`}>
      {title && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
