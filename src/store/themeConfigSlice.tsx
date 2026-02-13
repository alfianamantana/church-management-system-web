import { createSlice } from '@reduxjs/toolkit';
import i18next from 'i18next';
import themeConfig from '../theme.config';

const defaultState = {
    isDarkMode: false,
    mainLayout: 'app',
    theme: 'light',
    menu: 'vertical',
    layout: 'full',
    rtlClass: 'ltr',
    animation: '',
    navbar: 'navbar-sticky',
    locale: 'en',
    sidebar: false,
    pageTitle: '',
    colorTheme: 'amber',
    languageList: [
        { code: 'en', name: 'English' },
        { code: 'id', name: 'Indonesian' },
    ],
    semidark: false,
};

const initialState = {
    theme: localStorage.getItem('theme') || themeConfig.theme,
    menu: localStorage.getItem('menu') || themeConfig.menu,
    layout: localStorage.getItem('layout') || themeConfig.layout,
    rtlClass: localStorage.getItem('rtlClass') || themeConfig.rtlClass,
    animation: localStorage.getItem('animation') || themeConfig.animation,
    navbar: localStorage.getItem('navbar') || themeConfig.navbar,
    locale: localStorage.getItem('i18nextLng') || themeConfig.locale,
    isDarkMode: false,
    sidebar: localStorage.getItem('sidebar') || defaultState.sidebar,
    colorTheme: localStorage.getItem('colorTheme') || themeConfig.colorTheme,
    semidark: localStorage.getItem('semidark') || themeConfig.semidark,
    languageList: [
        { code: 'en', name: 'English' },
        { code: 'id', name: 'Indonesian' },
    ],
};

const themeConfigSlice = createSlice({
    name: 'auth',
    initialState: initialState,
    reducers: {
        toggleTheme(state, { payload }) {
            payload = payload || state.theme; // light | dark | system
            localStorage.setItem('theme', payload);
            state.theme = payload;
            if (payload === 'light') {
                state.isDarkMode = false;
            } else if (payload === 'dark') {
                state.isDarkMode = true;
            } else if (payload === 'system') {
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    state.isDarkMode = true;
                } else {
                    state.isDarkMode = false;
                }
            }

            // Apply theme classes
            const body = document.querySelector('body');
            if (body) {
                body.classList.remove('dark', 'theme-amber', 'theme-amber-glow', 'theme-warm-reverie', 'theme-crimson', 'theme-caramel', 'theme-mustard', 'theme-sepia', 'theme-brick-red', 'theme-terracotta', 'theme-whispering-silk', 'theme-serene-heritage', 'theme-linen-breeze', 'theme-golden-solstice', 'theme-dusk-harmony', 'theme-velvet-sunset', 'theme-eternal-ember', 'theme-sandalwood-minimal', 'theme-ivory-root', 'theme-cozy-opulence', 'theme-gentle-manor');
                if (state.isDarkMode) {
                    body.classList.add('dark');
                }
                if (state.colorTheme !== 'amber') {
                    body.classList.add(`theme-${state.colorTheme}`);
                }
            }
        },
        toggleMenu(state, { payload }) {
            payload = payload || state.menu; // vertical, collapsible-vertical, horizontal
            state.sidebar = false; // reset sidebar state
            localStorage.setItem('menu', payload);
            state.menu = payload;
        },
        toggleLayout(state, { payload }) {
            payload = payload || state.layout; // full, boxed-layout
            localStorage.setItem('layout', payload);
            state.layout = payload;
        },
        toggleRTL(state, { payload }) {
            payload = payload || state.rtlClass; // rtl, ltr
            localStorage.setItem('rtlClass', payload);
            state.rtlClass = payload;
            document.querySelector('html')?.setAttribute('dir', state.rtlClass || 'ltr');
        },
        toggleAnimation(state, { payload }) {
            payload = payload || state.animation; // animate__fadeIn, animate__fadeInDown, animate__fadeInUp, animate__fadeInLeft, animate__fadeInRight, animate__slideInDown, animate__slideInLeft, animate__slideInRight, animate__zoomIn
            payload = payload?.trim();
            localStorage.setItem('animation', payload);
            state.animation = payload;
        },
        toggleNavbar(state, { payload }) {
            payload = payload || state.navbar; // navbar-sticky, navbar-floating, navbar-static
            localStorage.setItem('navbar', payload);
            state.navbar = payload;
        },
        toggleSemidark(state, { payload }) {
            payload = payload === true || payload === 'true' ? true : false;
            localStorage.setItem('semidark', payload);
            state.semidark = payload;
        },
        toggleLocale(state, { payload }) {
            payload = payload || state.locale;
            i18next.changeLanguage(payload);
            state.locale = payload;
        },
        toggleColorTheme(state, { payload }) {
            payload = payload || state.colorTheme; // amber | amber-glow | warm-reverie | crimson | caramel | mustard | sepia | brick-red | terracotta | whispering-silk | serene-heritage | linen-breeze | golden-solstice | dusk-harmony | velvet-sunset | eternal-ember | sandalwood-minimal | ivory-root | cozy-opulence | gentle-manor
            localStorage.setItem('colorTheme', payload);
            state.colorTheme = payload;

            // Apply theme classes
            const body = document.querySelector('body');
            if (body) {
                body.classList.remove('theme-amber', 'theme-amber-glow', 'theme-warm-reverie', 'theme-crimson', 'theme-caramel', 'theme-mustard', 'theme-sepia', 'theme-brick-red', 'theme-terracotta', 'theme-whispering-silk', 'theme-serene-heritage', 'theme-linen-breeze', 'theme-golden-solstice', 'theme-dusk-harmony', 'theme-velvet-sunset', 'theme-eternal-ember', 'theme-sandalwood-minimal', 'theme-ivory-root', 'theme-cozy-opulence', 'theme-gentle-manor');
                if (payload !== 'amber') {
                    body.classList.add(`theme-${payload}`);
                }
            }
        },
        toggleSidebar(state) {
            state.sidebar = !state.sidebar;
        },

        setPageTitle(state, { payload }) {
            document.title = `${payload} | Church Management System`;
        },
    },
});

export const { toggleTheme, toggleMenu, toggleLayout, toggleRTL, toggleAnimation, toggleNavbar, toggleSemidark, toggleLocale, toggleSidebar, toggleColorTheme, setPageTitle } = themeConfigSlice.actions;

export default themeConfigSlice.reducer;
