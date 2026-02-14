import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../../components/Card';
import ThemeLanguageSwitcher from '../../components/ThemeLanguageSwitcher';
import { decryptData, encryptData } from '@/services/crypto';
import { IChurch, IUser } from '../../constant';
import { useTranslation } from 'react-i18next';
import CountryFlagSvg from 'country-list-with-dial-code-and-flag/dist/flag-svg';
import ThemeColorSwitcher from '../../components/ThemeColorSwitcher';
import UserDropdownProfile from '../../components/UserDropdownProfile';

const SelectChurchPage: React.FC = () => {
  const navigate = useNavigate();
  const [churches, setChurches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const [user, setUser] = useState<IUser | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const fetchChurches = async () => {
      try {
        const userEncrypted = localStorage.getItem('user');
        if (!userEncrypted) {
          navigate('/login');
          return;
        }
        const userString = await decryptData(userEncrypted);
        const user: IUser = JSON.parse(userString);
        setUser(user);
        if (!user.churches || user.churches.length === 0) {
          navigate('/create-church');
          return;
        }
        setChurches(user.churches);
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchChurches();
  }, [navigate]);

  const handleSelect = (church: IChurch) => {
    const encryptedChurch = async () => {
      const churchString = JSON.stringify(church);
      const churchEncrypted = await encryptData(churchString);
      return churchEncrypted;
    }

    encryptedChurch().then((encryptedChurch) => {
      localStorage.setItem('selected_church', encryptedChurch);
      navigate('/dashboard');
    });
  };

  const handleEdit = (church: IChurch, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the select handler
    const encryptedChurch = async () => {
      const churchString = JSON.stringify(church);
      const churchEncrypted = await encryptData(churchString);
      return churchEncrypted;
    }

    encryptedChurch().then((encryptedChurch) => {
      localStorage.setItem('selected_church', encryptedChurch);
      navigate('/edit-church');
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-accent px-4 relative">
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <ThemeLanguageSwitcher />
        <ThemeColorSwitcher />
        <UserDropdownProfile user={user} showLogoutModal={showLogoutModal} setShowLogoutModal={setShowLogoutModal} />
      </div>
      <Card id='select-church-card' className="max-w-md w-full p-8 flex flex-col gap-y-6 rounded-xl hover:shadow-md transition-all duration-300 backdrop-blur-sm">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold mb-2">{t('select_church_title')}</h2>
          <p className="text-muted-foreground">{t('select_church_subtitle')}</p>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-8" id="select-church-loading">
            <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="flex flex-col gap-4" id="select-church-list">
            {churches.map((church) => (
              <div
                key={church.id}
                className="relative w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors shadow-md hover:shadow-lg cursor-pointer"
                onClick={() => handleSelect(church)}
              >
                <div className="flex flex-col items-start pr-12">
                  <span className="font-semibold text-lg">{church.name}</span>
                  <div className="flex items-center text-sm">
                    <span dangerouslySetInnerHTML={{ __html: CountryFlagSvg[church.country] }} style={{ width: 16, height: 12, marginRight: 4, display: 'inline-block' }} />
                    <span>{church.city}, {church.country}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => handleEdit(church, e)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 hover:bg-primary-foreground/10 rounded-md transition-colors"
                  title={t('edit_church') || 'Edit Church'}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SelectChurchPage;
