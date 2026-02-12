import React, { useEffect, useRef, useState } from 'react';
import InputText from './InputText';

interface Option {
  id: string | number;
  label: string;
}

interface DropdownSearchProps {
  id?: string;
  placeholder?: string;
  onSearch: (query: string) => Promise<Option[]>;
  onSelect: (option: Option | Option[] | null) => void;
  selectedValue?: Option | Option[] | null;
  multiSelect?: boolean;
  debounceMs?: number;
}

const DropdownSearch: React.FC<DropdownSearchProps> = ({
  id,
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
    <div className="relative w-full" ref={dropdownRef} {...(id ? { id } : {})}>
      <div className="relative">
        <div className="flex items-center gap-2 w-full">
          {/* Single-select: show full-width card with X to clear */}
          {!multiSelect && selected.length > 0 ? (
            <div className="w-full flex items-center justify-between px-3 py-2 border border-border rounded bg-input text-foreground dark:bg-input dark:border-border" id={id ? `${id}-selected` : undefined}>
              <div className="truncate">{selected[0].label}</div>
            </div>
          ) : (
            // Multi-select or no selection: show chips (if any) and input
            <div className=" w-full flex-wrap items-center gap-2 rounded-xl bg-popover dark:bg-popover dark:border-border" id={id ? `${id}-input-wrapper` : undefined}>
              {selected.length > 0 && (
                <div className="flex flex-wrap gap-2" id={id ? `${id}-chips` : undefined}>
                  {selected.map((s) => (
                    <span key={s.id} className="inline-flex items-center px-2 py-1 bg-muted rounded-full text-sm text-foreground dark:bg-muted dark:text-foreground" id={id ? `${id}-chip-${s.id}` : undefined}>
                      <span className="mr-2">{s.label}</span>
                      {multiSelect && (
                        <button
                          type="button"
                          onClick={() => handleRemove(s)}
                          className="ml-1 text-muted-foreground transition-all duration-200 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
                          aria-label={`remove ${s.label}`}
                          id={id ? `${id}-remove-${s.id}` : undefined}
                        >
                          &times;
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}

              <InputText
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
                className="flex-1 min-w-[120px] bg-transparent"
                id={id ? `${id}-input` : undefined}
                autoComplete="off"
                rightIcon={
                  loading ? (
                    <svg className="animate-spin h-5 w-5 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (query || selected.length > 0) ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : undefined
                }
                onRightIconClick={
                  loading ? undefined : (query || selected.length > 0) ? handleClear : undefined
                }
              />
            </div>
          )}
        </div>
      </div>

      {isOpen && options.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-popover border border-border rounded-xl shadow-xl dark:bg-popover dark:border-border max-h-60 overflow-y-auto ring-1 ring-ring" id={id ? `${id}-dropdown` : undefined}>
          {options.map((option) => (
            <div
              key={option.id}
              onClick={() => handleSelect(option)}
              className="px-3 py-2 cursor-pointer hover:bg-muted dark:hover:bg-muted text-foreground dark:text-foreground"
              id={id ? `${id}-option-${option.id}` : undefined}
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
