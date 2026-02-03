import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  label?: string;
  position?: 'bottom' | 'top' | 'left' | 'right';
  required?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  children,
  className = '',
  label,
  position = 'bottom',
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
          <div className={`absolute z-10 ${getPositionClasses()} bg-white border border-gray-300 rounded shadow-lg dark:bg-gray-900 dark:border-gray-700`}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dropdown;
