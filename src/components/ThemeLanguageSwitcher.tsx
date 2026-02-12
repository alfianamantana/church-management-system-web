import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, toggleRTL } from '../store/themeConfigSlice';
import { IRootState } from '../store';
import i18next from 'i18next';
import { useState, useEffect } from 'react';
import Dropdown from './Dropdown';

interface ThemeLanguageSwitcherProps {
  className?: string;
}

const ThemeLanguageSwitcher = ({ className = '' }: ThemeLanguageSwitcherProps) => {
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const dispatch = useDispatch();
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
  const [flag, setFlag] = useState(i18next.language);

  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      setFlag(lng);
    };
    i18next.on('languageChanged', handleLanguageChange);
    return () => {
      i18next.off('languageChanged', handleLanguageChange);
    };
  }, []);

  const setLocale = (locale: string) => {
    if (locale.toLowerCase() === 'ae') {
      dispatch(toggleRTL('rtl'));
    } else {
      dispatch(toggleRTL('ltr'));
    }
  };

  return (
    <div className={`flex items-center space-x-1.5 lg:space-x-2 rtl:space-x-reverse text-muted-foreground ${className}`}>
      {/* Theme Toggle */}
      <div id="theme-toggle-container">
        {themeConfig.theme === 'light' ? (
          <button
            id="light-theme-btn"
            className="flex items-center p-2 rounded-full bg-muted/40 hover:text-primary hover:bg-muted/90 transition-all duration-200"
            onClick={() => {
              dispatch(toggleTheme('dark'));
            }}
            title="Switch to dark mode"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M12 20V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M4 12L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M22 12L20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path opacity="0.5" d="M19.7778 4.22266L17.5558 6.25424" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path opacity="0.5" d="M4.22217 4.22266L6.44418 6.25424" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path opacity="0.5" d="M6.44434 17.5557L4.22211 19.7779" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path opacity="0.5" d="M19.7778 19.7773L17.5558 17.5551" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        ) : (
          ''
        )}
        {themeConfig.theme === 'dark' && (
          <button
            id="dark-theme-btn"
            className="flex items-center p-2 rounded-full bg-muted/40 hover:text-primary hover:bg-muted/90 transition-all duration-200"
            onClick={() => {
              dispatch(toggleTheme('system'));
            }}
            title="Switch to system mode"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M21.0672 11.8568L20.4253 11.469L21.0672 11.8568ZM12.1432 2.93276L11.7553 2.29085V2.29085L12.1432 2.93276ZM21.25 12C21.25 17.1086 17.1086 21.25 12 21.25V22.75C17.9371 22.75 22.75 17.9371 22.75 12H21.25ZM12 21.25C6.89137 21.25 2.75 17.1086 2.75 12H1.25C1.25 17.9371 6.06294 22.75 12 22.75V21.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75V1.25C6.06294 1.25 1.25 6.06294 1.25 12H2.75ZM15.5 14.25C12.3244 14.25 9.75 11.6756 9.75 8.5H8.25C8.25 12.5041 11.4959 15.75 15.5 15.75V14.25ZM20.4253 11.469C19.4172 13.1373 17.5882 14.25 15.5 14.25V15.75C18.1349 15.75 20.4407 14.3439 21.7092 12.2447L20.4253 11.469ZM9.75 8.5C9.75 6.41182 10.8627 4.5828 12.531 3.57467L11.7553 2.29085C9.65609 3.5593 8.25 5.86509 8.25 8.5H9.75ZM12 2.75C11.9115 2.75 11.8077 2.71008 11.7324 2.63168C11.6686 2.56527 11.6538 2.50244 11.6503 2.47703C11.6461 2.44587 11.6482 2.35557 11.7553 2.29085L12.531 3.57467C13.0342 3.27065 13.196 2.71398 13.1368 2.27627C13.0754 1.82126 12.7166 1.25 12 1.25V2.75ZM21.7092 12.2447C21.6444 12.3518 21.5541 12.3539 21.523 12.3497C21.4976 12.3462 21.4347 12.3314 21.3683 12.2676C21.2899 12.1923 21.25 12.0885 21.25 12H22.75C22.75 11.2834 22.1787 10.9246 21.7237 10.8632C21.286 10.804 21.0293 10.9658 20.4253 11.469L21.7092 12.2447Z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
        {themeConfig.theme === 'system' && (
          <button
            id="system-theme-btn"
            className="flex items-center p-2 rounded-full bg-muted/40 hover:text-primary hover:bg-muted/90 transition-all duration-200"
            onClick={() => {
              dispatch(toggleTheme('light'));
            }}
            title="Switch to light mode"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M3 9C3 6.17157 3 4.75736 3.87868 3.87868C4.75736 3 6.17157 3 9 3H15C17.8284 3 19.2426 3 20.1213 3.87868C21 4.75736 21 6.17157 21 9V14C21 15.8856 21 16.8284 20.4142 17.4142C19.8284 18 18.8856 18 17 18H7C5.11438 18 4.17157 18 3.58579 17.4142C3 16.8284 3 15.8856 3 14V9Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path opacity="0.5" d="M22 21H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path opacity="0.5" d="M15 15H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Language Switcher */}
      <div id="language-dropdown-container" className="dropdown shrink-0">
        <Dropdown
          offset={[0, 8]}
          placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
          btnClassName="block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60 transition-all duration-200"
          button={<img id="language-flag" className="w-5 h-5 object-cover rounded-full" src={`/assets/images/flags/${flag.toUpperCase()}.svg`} alt="flag" />}
        >
          <ul id="language-list" className="!px-2 text-foreground dark:text-white-dark grid grid-cols-2 gap-2 font-semibold dark:text-white-light/90 w-[280px]">
            {themeConfig.languageList.map((item: any) => {
              return (
                <li key={item.code} id={`language-${item.code}`}>
                  <button
                    id={`language-btn-${item.code}`}
                    type="button"
                    className={`flex w-full hover:text-primary rounded-lg transition-all duration-200 ${i18next.language === item.code ? 'bg-primary/10 text-primary' : ''}`}
                    onClick={() => {
                      i18next.changeLanguage(item.code);
                      setLocale(item.code);
                    }}
                  >
                    <img src={`/assets/images/flags/${item.code.toUpperCase()}.svg`} alt="flag" className="w-5 h-5 object-cover rounded-full" />
                    <span className="ltr:ml-3 rtl:mr-3">{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Dropdown>
      </div>
    </div>
  );
};

export default ThemeLanguageSwitcher;
