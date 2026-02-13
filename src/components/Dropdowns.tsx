import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import ReactDOM from 'react-dom';
export interface DropdownRef {
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
  id?: string;
  onOpenChange?: (isOpen: boolean) => void;
}

const Dropdown = forwardRef<DropdownRef, DropdownProps>(({
  id,
  trigger,
  children,
  className = '',
  label,
  position = 'bottom',
  required = false,
  onOpenChange,
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownContentRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    close: () => closeDropdown(),
  }));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the click is inside any open dropdown (including nested), do not close
      // Find the closest element with class 'fixed' and 'z-50' (dropdown portal)
      let target = event.target as Node | null;
      let isInDropdown = false;
      while (target) {
        if (target instanceof HTMLElement && target.classList.contains('z-50') && target.classList.contains('fixed')) {
          isInDropdown = true;
          break;
        }
        target = target.parentNode;
      }
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        dropdownContentRef.current && !dropdownContentRef.current.contains(event.target as Node) &&
        !isInDropdown
      ) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // Update dropdown position when scrolling or resizing
  useEffect(() => {
    const handlePositionUpdate = () => {
      if (isOpen && dropdownRef.current) {
        const newPosition = getDropdownPosition();
        setDropdownPosition(newPosition);
      }
    };

    if (isOpen) {
      // Set initial position
      const initialPosition = getDropdownPosition();
      setDropdownPosition(initialPosition);

      // Add scroll and resize listeners
      window.addEventListener('scroll', handlePositionUpdate, true);
      window.addEventListener('resize', handlePositionUpdate);
      return () => {
        window.removeEventListener('scroll', handlePositionUpdate, true);
        window.removeEventListener('resize', handlePositionUpdate);
      };
    }
  }, [isOpen, position]);

  const closeDropdown = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsAnimatingOut(false);
    }, 200); // duration of animation
  };

  const getDropdownPosition = () => {
    if (!dropdownRef.current) return { top: 0, left: 0 };
    const rect = dropdownRef.current.getBoundingClientRect();
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;
    let top = rect.bottom + scrollY + 5; // gap 5px for bottom
    let left = rect.left + scrollX;
    switch (position) {
      case 'top':
        top = rect.top + scrollY - 5 - 200; // approximate height - gap
        left = rect.left + scrollX;
        break;
      case 'left':
        left = rect.left + scrollX - 5 - 200; // approximate width - gap
        top = rect.top + scrollY;
        break;
      case 'right':
        left = rect.right + scrollX + 5; // gap
        top = rect.top + scrollY;
        break;
      case 'top-left':
        top = rect.top + scrollY - 5 - 200;
        left = rect.left + scrollX;
        break;
      case 'top-right':
        top = rect.top + scrollY - 5 - 200;
        left = rect.right + scrollX - 200; // approximate width
        break;
      case 'bottom-left':
        top = rect.bottom + scrollY + 5;
        left = rect.left + scrollX - 50; // slightly left of trigger
        break;
      case 'bottom-right':
        top = rect.bottom + scrollY + 5;
        left = rect.right + scrollX - 200;
        break;
      case 'bottom':
        // top = rect.bottom + scrollY + 5;
        // left = rect.left + scrollX - 100; // center below trigger (approximate width / 2)
        break;
      default:
        break;
    }
    return { top, left };
  };

  const getTransformOrigin = () => {
    switch (position) {
      case 'top':
        return 'origin-bottom';
      case 'left':
        return 'origin-right';
      case 'right':
        return 'origin-left';
      case 'top-left':
        return 'origin-bottom-left';
      case 'top-right':
        return 'origin-bottom-right';
      case 'bottom-left':
        return 'origin-top-left';
      case 'bottom-right':
        return 'origin-top-right';
      case 'bottom':
      default:
        return 'origin-top';
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes dropdown-enter {
            from {
              opacity: 0;
              transform: scale(0.95) translateY(-8px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          @keyframes dropdown-exit {
            from {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
            to {
              opacity: 0;
              transform: scale(0.95) translateY(-8px);
            }
          }
          .dropdown-enter {
            animation: dropdown-enter 0.2s ease-out forwards;
          }
          .dropdown-exit {
            animation: dropdown-exit 0.2s ease-out forwards;
          }
        `}
      </style>
      <div id={id} className={`relative w-full flex flex-col gap-1 ${className} ${isOpen ? 'z-50' : ''}`}>
        {label && (
          <label className="block font-semibold text-gray-700 dark:text-gray-200 text-sm">
            {label}{required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative" ref={dropdownRef}>
          <div ref={triggerRef} onClick={() => isOpen ? closeDropdown() : setIsOpen(true)} className="cursor-pointer">
            {trigger}
          </div>
        </div>

        {(isOpen || isAnimatingOut) && ReactDOM.createPortal(
          <div
            ref={dropdownContentRef}
            className={`
              fixed z-50
              ${getTransformOrigin()}
              ${isAnimatingOut ? 'dropdown-exit' : 'dropdown-enter'}
              bg-popover 
              border border-border 
              rounded-xl shadow-xl ring-1 ring-ring
              overflow-hidden
            `}
            style={dropdownPosition}
          >
            <div className="py-1">
              {children}
            </div>
          </div>,
          document.body
        )}
      </div>
    </>
  );
});

export default Dropdown;