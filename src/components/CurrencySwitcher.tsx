import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from './Dropdown';
import { IRootState } from '../store';
import { CURRENCIES, ICurrency } from '../constant';

interface CurrencySwitcherProps {
  onCurrencyChange?: (currency: ICurrency) => void;
}

const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({ onCurrencyChange }) => {
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
  const [selectedCurrency, setSelectedCurrency] = React.useState<ICurrency>(CURRENCIES[0]);

  const handleCurrencyChange = (currency: ICurrency) => {
    setSelectedCurrency(currency);
    // Store in localStorage for persistence
    localStorage.setItem('selected_currency', currency.code);
    if (onCurrencyChange) {
      onCurrencyChange(currency);
    }
  };

  React.useEffect(() => {
    // Load saved currency from localStorage
    const savedCurrency = localStorage.getItem('selected_currency');
    if (savedCurrency) {
      const currency = CURRENCIES.find(c => c.code === savedCurrency);
      if (currency) {
        setSelectedCurrency(currency);
      }
    }
  }, []);

  return (
    <div id="currency-dropdown-container" className="dropdown shrink-0">
      <Dropdown
        offset={[0, 8]}
        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
        btnClassName="block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
        button={
          <div id="currency-indicator" className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            {selectedCurrency.symbol}
          </div>
        }
      >
        <ul id="currency-list" className="!px-2 text-foreground dark:text-white-dark font-semibold dark:text-white-light/90 w-[200px]">
          {CURRENCIES.map((currency) => (
            <li key={currency.code} id={`currency-${currency.code}`}>
              <button
                id={`currency-btn-${currency.code}`}
                type="button"
                className={`flex w-full items-center hover:text-primary rounded-lg p-2 ${selectedCurrency.code === currency.code ? 'bg-primary/10 text-primary' : ''}`}
                onClick={() => handleCurrencyChange(currency)}
              >
                <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-sm mr-3 font-semibold">
                  {currency.symbol}
                </span>
                <span className='text-xs'>{currency.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </Dropdown>
    </div>
  );
};

export default CurrencySwitcher;