import React, { PropsWithChildren, ReactNode } from 'react';

interface CardProps extends PropsWithChildren {
  title?: ReactNode;
  id: string;
  className?: string;
}
// rounded-md bg-white p-5 shadow dark:bg-black
const Card: React.FC<CardProps> = ({ title, id, className = '', children }) => {
  return (
    <div id={id} className={`relative overflow-visible bg-card border border-border rounded-lg hover:shadow transition-all duration-200 p-6 flex flex-col gap-y-4 ${className}`}>
      {title && (
        <div>
          <h3 className="text-lg font-semibold text-card-foreground truncate">{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
