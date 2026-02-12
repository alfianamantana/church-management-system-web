import React, { useState, useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  id: string;
}

const Modal: React.FC<ModalProps> = ({
  id,
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimatingOut(false);
      setIsVisible(true);
    } else if (isVisible) {
      setIsAnimatingOut(true);
      const t = setTimeout(() => {
        setIsAnimatingOut(false);
        setIsVisible(false);
      }, 200); // duration matches Tailwind transition
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isVisible && !isAnimatingOut) return null;

  return (
    <div
      id={id}
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-200 bg-black/50 ${isAnimatingOut ? 'opacity-0' : 'opacity-100'
        }`}
      onClick={onClose}
    >
      <div
        className={`relative w-full ${sizeClasses[size]} mx-4 bg-card rounded-lg shadow-lg transform transition-all duration-200 ${isAnimatingOut
          ? 'opacity-0 scale-95 -translate-y-2'
          : 'opacity-100 scale-100 translate-y-0'
          } ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-all duration-200"
            >
              &times;
            </button>
          </div>
        )}
        <div className="p-4 text-card-foreground">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;