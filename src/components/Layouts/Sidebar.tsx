import PerfectScrollbar from 'react-perfect-scrollbar';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toggleSidebar } from '../../store/themeConfigSlice';
import AnimateHeight from 'react-animate-height';
import { IRootState } from '../../store';
import { useState, useEffect } from 'react';

const Sidebar = () => {
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [errorSubMenu, setErrorSubMenu] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const location = useLocation();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed min-h-screen h-full top-0 bottom-0 w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] z-50 transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="bg-white dark:bg-black h-full">
                    <div className="flex justify-between items-center px-4 py-3">
                        <NavLink to="/" className="main-logo flex items-center shrink-0">
                            <img className="w-8 ml-[5px] flex-none" src="/assets/images/logo.svg" alt="logo" />
                            <span className="text-2xl ltr:ml-1.5 rtl:mr-1.5 font-semibold align-middle lg:inline dark:text-white-light">Lumen</span>
                        </NavLink>

                        <button
                            type="button"
                            className="collapse-icon w-8 h-8 rounded-full flex items-center hover:bg-gray-500/10 dark:hover:bg-dark-light/10 dark:text-white-light transition duration-300 rtl:rotate-180"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 m-auto">
                                <path d="M13 19L7 12L13 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path opacity="0.5" d="M16.9998 19L10.9998 12L16.9998 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                    <PerfectScrollbar className="h-[calc(100vh-80px)] relative">
                        <ul className="relative font-semibold space-y-0.5 p-4 py-0">
                            <li className="menu nav-item">
                                <NavLink to="/dashboard" className={({ isActive }) => `${isActive ? 'active' : ''} nav-link group w-full`}>
                                    <div className="flex items-center">
                                        <svg className="group-hover:!text-primary shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                opacity="0.5"
                                                d="M2 12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274C22 8.77128 22 9.91549 22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                d="M9 17.25C8.58579 17.25 8.25 17.5858 8.25 18C8.25 18.4142 8.58579 18.75 9 18.75H15C15.4142 18.75 15.75 18.4142 15.75 18C15.75 17.5858 15.4142 17.25 15 17.25H9Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">Dashboard</span>
                                    </div>
                                </NavLink>
                            </li>
                            <li className="menu nav-item">
                                <NavLink to="/jemaat" className={({ isActive }) => `${isActive ? 'active' : ''} nav-link group w-full`}>
                                    <div className="flex items-center">
                                        <svg className="group-hover:!text-primary shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" fill="currentColor" />
                                            <path opacity="0.5" d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                        </svg>
                                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">Jemaat</span>
                                    </div>
                                </NavLink>
                            </li>
                            <li className="menu nav-item">
                                <NavLink to="/family" className={({ isActive }) => `${isActive ? 'active' : ''} nav-link group w-full`}>
                                    <div className="flex items-center">
                                        <svg className="group-hover:!text-primary shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor" opacity="0.5" />
                                            <path d="M12 2l10 9h-3v9H5v-9H2l10-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">Family</span>
                                    </div>
                                </NavLink>
                            </li>

                            <li className="menu nav-item">
                                <NavLink to="/calendar" className={({ isActive }) => `${isActive ? 'active' : ''} nav-link group w-full`}>
                                    <div className="flex items-center">
                                        <svg className="group-hover:!text-primary shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M21 11.5C21 16.1944 16.9706 20 12 20C7.02944 20 3 16.1944 3 11.5C3 6.80558 7.02944 3 12 3C16.9706 3 21 6.80558 21 11.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">Calendar</span>
                                    </div>
                                </NavLink>
                            </li>

                            <li className="menu nav-item">
                                <NavLink to="/assets" className={({ isActive }) => `${isActive ? 'active' : ''} nav-link group w-full`}>
                                    <div className="flex items-center">
                                        <svg className="group-hover:!text-primary shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M16 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M8 2V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                            <path d="M2 10H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">Assets</span>
                                    </div>
                                </NavLink>
                            </li>


                            <li className="menu nav-item">
                                <NavLink to="/keuangan" className={({ isActive }) => `${isActive ? 'active' : ''} nav-link group w-full`}>
                                    <div className="flex items-center">
                                        <svg className="group-hover:!text-primary shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12 2V22M17 7H9.5C8.57174 7 7.6815 7.36875 7.02513 8.02513C6.36875 8.6815 6 9.57174 6 10.5C6 11.4283 6.36875 12.3185 7.02513 12.9749C7.6815 13.6313 8.57174 14 9.5 14H14.5C15.4283 14 16.3185 14.3687 16.9749 15.0251C17.6313 15.6815 18 16.5717 18 17.5C18 18.4283 17.6313 19.3185 16.9749 19.9749C16.3185 20.6313 15.4283 21 14.5 21H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">Keuangan</span>
                                    </div>
                                </NavLink>
                            </li>

                            <li className="menu nav-item">
                                <button type="button" className={`${currentMenu === 'dashboard' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('dashboard')}>
                                    <div className="flex items-center">
                                        <svg className="group-hover:!text-primary shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M12 22C10.8954 22 10 21.1046 10 20V18C10 16.8954 10.8954 16 12 16C13.1046 16 14 16.8954 14 18V20C14 21.1046 13.1046 22 12 22Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                opacity="0.5"
                                                d="M19 11H17C15.8954 11 15 10.1046 15 9V7C15 5.89543 15.8954 5 17 5H19C20.1046 5 21 5.89543 21 7V9C21 10.1046 20.1046 11 19 11Z"
                                                fill
                                                ="currentColor"
                                            />
                                            <path
                                                opacity="0.5"
                                                d="M7 11H5C3.89543 11 3 10.1046 3 9V7C3 5.89543 3.89543 5 5 5H7C8.10457 5 9 5.89543 9 7V9C9 10.1046 8.10457 11 7 11Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                opacity="0.5"
                                                d="M19 22H17C15.8954 22 15 21.1046 15 20V18C15 16.8954 15.8954 16 17 16H19C20.1046 16 21 16.8954 21 18V20C21 21.1046 20.1046 22 19 22Z"
                                                fill="currentColor"
                                            />
                                            <path
                                                opacity="0.5"
                                                d="M7 22H5C3.89543 22 3 21.1046 3 20V18C3 16.8954 3.89543 16 5 16H7C8.10457 16 9 16.8954 9 18V20C9 21.1046 8.10457 22 7 22Z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">Worship Service</span>
                                    </div>

                                    <div className={currentMenu !== 'dashboard' ? 'rtl:rotate-90 -rotate-90' : ''}>
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 m-auto">
                                            <path d="M8.12 9.29L12 13.17L15.88 9.29C16.27 8.9 16.9 8.9 17.29 9.29C17.68 9.68 17.68 10.31 17.29 10.7L12.7 15.29C12.31 15.68 11.68 15.68 11.29 15.29L6.7 10.7C6.31 10.31 6.31 9.68 6.7 9.29C7.09 8.9 7.72 8.9 8.12 9.29Z" fill="currentColor" />
                                        </svg>
                                    </div>
                                </button>

                                <AnimateHeight duration={300} height={currentMenu === 'dashboard' ? 'auto' : 0}>
                                    <ul className="sub-menu text-gray-500">
                                        <li>
                                            <NavLink to="/member">Member</NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="/role">Role</NavLink>
                                        </li>
                                        <li>
                                            <NavLink to="/schedule">Schedule</NavLink>
                                        </li>
                                    </ul>
                                </AnimateHeight>
                            </li>

                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
