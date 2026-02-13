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
          <div className="flex justify-center items-center py-8">
            <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {churches.map((church) => (
              <button
                key={church.id}
                onClick={() => handleSelect(church)}
                className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors shadow-md hover:shadow-lg"
              >
                <div className="flex flex-col items-start">
                  <span className="font-semibold text-lg">{church.name}</span>
                  <div className="flex items-center text-sm ">
                    <span dangerouslySetInnerHTML={{ __html: CountryFlagSvg[church.country] }} style={{ width: 16, height: 12, marginRight: 4, display: 'inline-block' }} />
                    <span className=''>{church.city}, {church.country}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SelectChurchPage;
