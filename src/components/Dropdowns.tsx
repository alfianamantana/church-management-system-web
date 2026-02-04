import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

interface DropdownRef {
  close: () => void;
}

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  label?: string;
  position?: 'bottom' | 'top' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  required?: boolean;
  fullWidth?: boolean;
}

const Dropdown = forwardRef<DropdownRef, DropdownProps>(({
  trigger,
  children,
  className = '',
  label,
  position = 'bottom',
  required = false,
  fullWidth = false,
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    close: () => setIsOpen(false),
  }));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'bottom-full mb-1';
      case 'left':
        return 'right-full mr-1';
      case 'right':
        return 'left-full ml-1';
      case 'top-left':
        return 'bottom-full left-0 mb-1';
      case 'top-right':
        return 'bottom-full right-0 mb-1';
      case 'bottom-left':
        return 'top-full left-0 mt-1';
      case 'bottom-right':
        return 'top-full right-0 mt-1';
      case 'bottom':
      default:
        return 'top-full mt-1';
    }
  };

  return (
    <div className={`w-full flex flex-col gap-1 ${className}`}>
      {label && <label className="block font-semibold text-gray-700 dark:text-gray-200">{label}{required && <span className="text-red-500">*</span>}</label>}
      <div className="relative" ref={dropdownRef}>
        <div onClick={handleTriggerClick} className="cursor-pointer">
          {trigger}
        </div>
        {isOpen && (
          <div className={`absolute mt-2 z-10 ${fullWidth ? 'w-full' : ''} ${getPositionClasses()} bg-white border border-gray-300 rounded shadow-lg dark:bg-gray-900 dark:border-gray-700`}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
});

export default Dropdown;
