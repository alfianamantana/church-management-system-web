import React, { useEffect, useRef, useState } from 'react';

interface Option {
  id: string | number;
  label: string;
}

interface DropdownSearchProps {
  placeholder?: string;
  onSearch: (query: string) => Promise<Option[]>;
  onSelect: (option: Option | Option[] | null) => void;
  selectedValue?: Option | Option[] | null;
  multiSelect?: boolean;
  debounceMs?: number;
}

const DropdownSearch: React.FC<DropdownSearchProps> = ({
  placeholder = 'Search...',
  onSearch,
  onSelect,
  selectedValue,
  multiSelect = false,
  debounceMs = 300,
}) => {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<Option[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [selected, setSelected] = useState<Option[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        try {
          const results = await onSearch(query);
          setOptions(results);
          if (isFocused) setIsOpen(true);
        } catch (err) {
          console.error('Search error:', err);
          setOptions([]);
        } finally {
          setLoading(false);
        }
      } else {
        setOptions([]);
        setIsOpen(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, onSearch, isFocused]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (Array.isArray(selectedValue)) {
      setSelected(selectedValue);
      setQuery('');
    } else if (selectedValue) {
      setSelected([selectedValue]);
      setQuery(selectedValue.label || '');
    } else {
      setSelected([]);
      setQuery('');
    }
  }, [selectedValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (!multiSelect && selected.length > 0) {
      setSelected([]);
      onSelect(null);
    }
  };

  const handleSelect = (option: Option) => {
    if (multiSelect) {
      const exists = selected.find((s) => s.id === option.id);
      const newSelected = exists ? selected.filter((s) => s.id !== option.id) : [...selected, option];
      setSelected(newSelected);
      onSelect(newSelected.length ? newSelected : null);
      setQuery('');
      if (isFocused) setIsOpen(true);
    } else {
      setSelected([option]);
      setQuery(option.label);
      onSelect(option);
      setIsOpen(false);
    }
  };

  const handleRemove = (option: Option) => {
    if (!multiSelect) return;
    const newSelected = selected.filter((s) => s.id !== option.id);
    setSelected(newSelected);
    onSelect(newSelected.length ? newSelected : null);
  };

  const handleClear = () => {
    setQuery('');
    setSelected([]);
    onSelect(null);
    setOptions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <div className="flex items-center gap-2 w-full">
          {/* Single-select: show full-width card with X to clear */}
          {!multiSelect && selected.length > 0 ? (
            <div className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100">
              <div className="truncate">{selected[0].label}</div>
            </div>
          ) : (
            // Multi-select or no selection: show chips (if any) and input
            <div className="flex flex-1 flex-wrap items-center gap-2 border border-gray-300 rounded-md bg-white dark:bg-gray-900 p-2 dark:border-gray-700">
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selected.map((s) => (
                    <span key={s.id} className="inline-flex items-center px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                      <span className="mr-2">{s.label}</span>
                      {multiSelect && (
                        <button
                          type="button"
                          onClick={() => handleRemove(s)}
                          className="ml-1 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                          aria-label={`remove ${s.label}`}
                        >
                          &times;
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => {
                  setIsFocused(true);
                  if (query.trim() && options.length > 0) setIsOpen(true);
                }}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                className="flex-1 min-w-[120px] px-3 py-2 pr-10 focus:outline-none text-gray-900 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
          )}

          {(query || selected.length > 0) && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {loading && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>
      </div>

      {isOpen && options.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg dark:bg-gray-800 dark:border-gray-700 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.id}
              onClick={() => handleSelect(option)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropdownSearch;
