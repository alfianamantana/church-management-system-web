import React, { useState, useRef, useEffect } from 'react';
import { DayPicker } from "react-day-picker";
import Dropdown from './Dropdowns';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

type DisabledDates =
  | boolean
  | Date
  | Date[]
  | { from: Date; to: Date }
  | { dayOfWeek: number[] }
  | { before: Date }
  | { after: Date }
  | { before: Date; after: Date };

interface DatePickerProps {
  label: string;
  selectedDate?: Date;
  onSelect: (date: Date | undefined) => void;
  id?: string;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  disabled?: DisabledDates;
}

/**
 * DatePicker component with month/year dropdown and date selection.
 *
 * @example
 * // Disable all dates
 * <DatePicker disabled />
 *
 * // Disable a specific date
 * <DatePicker disabled={new Date(2023, 9, 1)} />
 *
 * // Disable an array of dates
 * <DatePicker disabled={[new Date(2023, 9, 1), new Date(2023, 9, 2)]} />
 *
 * // Disable a range of dates
 * <DatePicker disabled={{ from: new Date(2023, 9, 1), to: new Date(2023, 9, 5) }} />
 *
 * // Disable specific days of the week
 * <DatePicker disabled={{ dayOfWeek: [0, 6] }} /> // disable weekends
 *
 * // Disable dates before a specific date
 * <DatePicker disabled={{ before: new Date(2023, 9, 1) }} />
 *
 * // Disable dates after a specific date
 * <DatePicker disabled={{ after: new Date(2023, 9, 5) }} />
 *
 * // Disable dates between two dates
 * <DatePicker disabled={{ before: new Date(2023, 9, 1), after: new Date(2023, 9, 5) }} />
 */

const DatePicker: React.FC<DatePickerProps> = ({
  label,
  selectedDate,
  onSelect,
  id = 'date-picker',
  position = 'bottom-left',
  disabled
}) => {
  const { t } = useTranslation();

  // Month/Year picker state
  const [selectedMonth, setSelectedMonth] = useState(selectedDate ? selectedDate.getMonth() : new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(selectedDate ? selectedDate.getFullYear() : new Date().getFullYear());
  const monthDropdownRef = useRef<{ close: () => void }>(null);
  const yearDropdownRef = useRef<{ close: () => void }>(null);

  // Dropdown open states for chevron icons
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      setSelectedYear(selectedDate.getFullYear());
      setSelectedMonth(selectedDate.getMonth());
    }
  }, [selectedDate]);

  // Handle click outside for nested month/year dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Close nested dropdowns if click is outside the main dropdown container
      if (!target.closest('#asset-acquisition-dropdown')) {
        setIsMonthDropdownOpen(false);
        setIsYearDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper function to determine if a date is disabled
  const isDateDisabled = (date: Date): boolean => {
    if (!disabled) return false;
    if (typeof disabled === 'boolean') return disabled;
    if (disabled instanceof Date) return date.toDateString() === disabled.toDateString();
    if (Array.isArray(disabled)) return disabled.some(d => date.toDateString() === d.toDateString());
    if ('from' in disabled && 'to' in disabled) return date >= (disabled as { from: Date; to: Date }).from && date <= (disabled as { from: Date; to: Date }).to;
    if ('before' in disabled && 'after' in disabled) return date < (disabled as { before: Date; after: Date }).before || date > (disabled as { before: Date; after: Date }).after;
    if ('dayOfWeek' in disabled) return (disabled as { dayOfWeek: number[] }).dayOfWeek.includes(date.getDay());
    if ('before' in disabled) return date < (disabled as { before: Date }).before;
    if ('after' in disabled) return date > (disabled as { after: Date }).after;
    return false;
  };

  return (
    <div id={`${id}-container`}>
      <label id={`${id}-label`} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>
      <Dropdown
        id={`${id}-dropdown`}
        trigger={
          <div
            id={`${id}-trigger`}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors flex items-center justify-between"
          >
            <span>{selectedDate ? dayjs(selectedDate).format('D MMM, YYYY') : t('select_date')}</span>
            {isDateDropdownOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
          </div>
        }
        onOpenChange={setIsDateDropdownOpen}
        position={position}
      >
        <div id={`${id}-picker-container`} className="p-4 w-full">
          <div id={`${id}-dropdowns`} className='flex flex-row gap-2 mb-4'>
            <Dropdown
              id={`${id}-month-dropdown`}
              fullWidth={true}
              ref={monthDropdownRef}
              onOpenChange={setIsMonthDropdownOpen}
              isNested={true}
              trigger={
                <button
                  id={`${id}-month-trigger`}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left flex items-center justify-between"
                >
                  <span>{new Date(0, selectedMonth).toLocaleString('default', { month: 'long' })}</span>
                  {isMonthDropdownOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              }
            >
              <div id={`${id}-month-options`} className="max-h-40 overflow-y-auto w-full" onMouseDown={(e) => e.stopPropagation()}>
                {Array.from({ length: 12 }, (_, i) => i).map((month) => (
                  <div
                    key={month}
                    id={`${id}-month-option-${month}`}
                    className="px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMonth(month);
                      monthDropdownRef.current?.close();
                    }}
                  >
                    {new Date(0, month).toLocaleString('default', { month: 'long' })}
                  </div>
                ))}
              </div>
            </Dropdown>
            <Dropdown
              id={`${id}-year-dropdown`}
              fullWidth={true}
              ref={yearDropdownRef}
              onOpenChange={setIsYearDropdownOpen}
              isNested={true}
              trigger={
                <button
                  id={`${id}-year-trigger`}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 border-gray-300 focus:ring-blue-400 bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 dark:focus:ring-blue-500 text-left flex items-center justify-between"
                >
                  <span>{selectedYear}</span>
                  {isYearDropdownOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                </button>
              }
            >
              <div id={`${id}-year-options`} className="max-h-40 overflow-y-auto w-full" onMouseDown={(e) => e.stopPropagation()}>
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <div
                    key={year}
                    id={`${id}-year-option-${year}`}
                    className="px-4 py-2 w-full hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedYear(year);
                      yearDropdownRef.current?.close();
                    }}
                  >
                    {year}
                  </div>
                ))}
              </div>
            </Dropdown>
          </div>
          <DayPicker
            id={`${id}-daypicker`}
            mode="single"
            selected={selectedDate}
            onSelect={onSelect}
            month={new Date(selectedYear, selectedMonth)}
            className="border-0"
            disabled={isDateDisabled}
          />
        </div>
      </Dropdown>
    </div>
  );
};

export default DatePicker;
