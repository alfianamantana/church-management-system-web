import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Dropdown from './Dropdown';
import { useSelector } from 'react-redux';
import { IRootState } from '../store';
import { IUser } from '../constant';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';

interface UserDropdownProfileProps {
  user: IUser | null;
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;
}

const UserDropdownProfile: React.FC<UserDropdownProfileProps> = ({ user, showLogoutModal, setShowLogoutModal }) => {
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getInitials = (name: string) => {
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div id="user-dropdown-container" className="dropdown shrink-0 flex">
      <Dropdown
        offset={[0, 8]}
        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
        btnClassName="relative group block"
        button={
          user ? (
            <div id="user-initials-avatar" className="border-2 border-white dark:border-dark w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm group-hover:saturate-100">
              {getInitials(user.name)}
            </div>
          ) : (
            <img id="user-profile-img" className="w-9 h-9 rounded-full object-cover saturate-50 group-hover:saturate-100" src="/assets/images/user-profile.jpeg" alt="userProfile" />
          )
        }
      >
        <ul id="user-menu" className="text-foreground dark:text-white-dark !py-0 w-[230px] font-semibold dark:text-white-light/90">
          <li id="user-info">
            <div id="user-info-content" className="flex items-center px-4 py-4">
              {user ? (
                <div id="user-info-initials" className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
                  {getInitials(user.name)}
                </div>
              ) : (
                <img id="user-avatar" className="rounded-md w-10 h-10 object-cover" src="/assets/images/user-profile.jpeg" alt="userProfile" />
              )}
              <div id="user-details" className="ltr:pl-4 rtl:pr-4 truncate">
                <h4 id="user-name" className="text-base">
                  {user?.name || 'John Doe'}
                  <span id="user-subscribe-type" className="text-xs bg-success-light rounded text-success px-1 ltr:ml-2 rtl:ml-2 capitalized">{user?.subscribe_type}</span>
                </h4>
                <button id="user-email" type="button" className="text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-white">
                  {user?.email || 'johndoe@gmail.com'}
                </button>
              </div>
            </div>
          </li>
          <li id="profile-menu-item">
            <Link id="profile-link" to="/profile" className="dark:hover:text-white">
              <svg className="ltr:mr-2 rtl:ml-2 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="6" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path
                  opacity="0.5"
                  d="M20 17.5C20 19.9853 20 22 12 22C4 22 4 19.9853 4 17.5C4 15.0147 7.58172 13 12 13C16.4183 13 20 15.0147 20 17.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              Profile
            </Link>
          </li>
          <li id="sign-out-menu-item" className="border-t border-white-light dark:border-white-light/10">
            <button id="sign-out-btn" className="text-danger !py-3" onClick={() => setShowLogoutModal(true)}>
              <svg className="ltr:mr-2 rtl:ml-2 rotate-90 shrink-0" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  opacity="0.5"
                  d="M17 9.00195C19.175 9.01406 20.3529 9.11051 21.1213 9.8789C22 10.7576 22 12.1718 22 15.0002V16.0002C22 18.8286 22 20.2429 21.1213 21.1215C20.2426 22.0002 18.8284 22.0002 16 22.0002H8C5.17157 22.0002 3.75736 22.0002 2.87868 21.1215C2 20.2429 2 18.8286 2 16.0002L2 15.0002C2 12.1718 2 10.7576 2.87868 9.87889C3.64706 9.11051 4.82497 9.01406 7 9.00195"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path d="M12 15L12 2M12 2L15 5.5M12 2L9 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sign Out
            </button>
          </li>
        </ul>
      </Dropdown>
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} id="logout-modal">
        <div id="logout-modal-content" className="bg-card text-card-foreground p-5 text-center rounded-lg shadow-lg">
          <h3 id="logout-modal-title" className="text-lg font-semibold mb-4 text-card-foreground">{t('confirm_logout')}</h3>
          <p id="logout-modal-message" className="text-muted-foreground mb-6">{t('confirm_logout_message')}</p>
          <div id="logout-modal-actions" className="flex justify-center space-x-4">
            <button
              id="logout-confirm-btn"
              onClick={() => {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('selected_church');
                navigate('/login');
              }}
              className="bg-destructive text-destructive-foreground px-4 py-2 rounded hover:opacity-80 transition-opacity min-w-[60px]"
            >
              {t('yes')}
            </button>
            <button
              id="logout-cancel-btn"
              onClick={() => setShowLogoutModal(false)}
              className="bg-secondary text-secondary-foreground px-4 py-2 rounded hover:opacity-80 transition-opacity min-w-[60px]"
            >
              {t('no')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default UserDropdownProfile;
