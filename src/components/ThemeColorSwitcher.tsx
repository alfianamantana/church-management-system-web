import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Dropdown from './Dropdown';
import { toggleColorTheme } from '../store/themeConfigSlice';
import { IRootState } from '../store';

const ThemeColorSwitcher: React.FC = () => {
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const dispatch = useDispatch();
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

  return (
    <div id="theme-color-dropdown-container" className="dropdown shrink-0">
      <Dropdown
        offset={[0, 8]}
        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
        btnClassName="block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
        button={
          <div id="theme-color-indicator" className="w-7 h-7 rounded-full bg-primary border-2 border-white dark:border-dark"></div>
        }
      >
        <ul id="theme-color-list" className="!px-2 text-foreground dark:text-white-dark font-semibold dark:text-white-light/90 w-[200px] md:w-[600px] md:grid md:grid-cols-3">
          {[
            { name: 'Amber', value: 'amber', color: '#f59e0b' },
            { name: 'Amber Glow', value: 'amber-glow', color: '#ffb300' },
            { name: 'Warm Reverie', value: 'warm-reverie', color: '#ff7043' },
            { name: 'Crimson', value: 'crimson', color: '#dc2626' },
            { name: 'Caramel', value: 'caramel', color: '#a0785a' },
            { name: 'Mustard', value: 'mustard', color: '#f4c430' },
            { name: 'Sepia', value: 'sepia', color: '#9c7c5a' },
            { name: 'Brick Red', value: 'brick-red', color: '#c53030' },
            { name: 'Terracotta', value: 'terracotta', color: '#ea580c' },
            { name: 'Whispering Silk', value: 'whispering-silk', color: '#f5f5dc' },
            { name: 'Serene Heritage', value: 'serene-heritage', color: '#4a90e2' },
            { name: 'Linen Breeze', value: 'linen-breeze', color: '#b0e0e6' },
            { name: 'Golden Solstice', value: 'golden-solstice', color: '#ffd700' },
            { name: 'Dusk Harmony', value: 'dusk-harmony', color: '#6a0dad' },
            { name: 'Velvet Sunset', value: 'velvet-sunset', color: '#8b0000' },
            { name: 'Eternal Ember', value: 'eternal-ember', color: '#ff4500' },
            { name: 'Sandalwood Minimal', value: 'sandalwood-minimal', color: '#a0522d' },
            { name: 'Ivory Root', value: 'ivory-root', color: '#fffff0' },
            { name: 'Cozy Opulence', value: 'cozy-opulence', color: '#daa520' },
            { name: 'Gentle Manor', value: 'gentle-manor', color: '#8fbc8f' },
          ].map((theme) => (
            <li key={theme.value} id={`theme-${theme.value}`}>
              <button
                id={`theme-btn-${theme.value}`}
                type="button"
                className={`flex w-full hover:text-primary rounded-lg p-2 ${themeConfig.colorTheme === theme.value ? 'bg-primary/10 text-primary' : ''}`}
                onClick={() => {
                  dispatch(toggleColorTheme(theme.value));
                }}
              >
                <div className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: theme.color }}></div>
                <span>{theme.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </Dropdown>
    </div>
  );
};

export default ThemeColorSwitcher;
