
import React, { useState } from 'react';
import api from '../../services/api';
import { IBasicResponse, IUser, getMessage } from '../../constant';
import { toast } from 'react-toastify';
import InputText from '../../components/InputText';
import { useTranslation } from 'react-i18next';
import { encryptData } from '@/services/crypto';
import { useNavigate } from "react-router";
import Card from '../../components/Card';
import ThemeLanguageSwitcher from '../../components/ThemeLanguageSwitcher';


interface ILoginResponse extends IBasicResponse {
  token: string;
  data?: IUser;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast.error(t('please_fill_all_fields') as string);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.post('/user/login', { email, password });
      const response: ILoginResponse = data;
      if (response.code === 200) {
        const string = JSON.stringify(response.data);
        const tokenEncrypted = await encryptData(response.token);
        await localStorage.setItem('token', tokenEncrypted);
        const userEncrypted = await encryptData(string);
        await localStorage.setItem('user', userEncrypted);
        toast.success(getMessage(response.message) as string);
        navigate('/dashboard');
      } else if (response.code === 403 && (getMessage(response.message) === 'Subscription expired' || getMessage(response.message) === 'Langganan kedaluwarsa')) {
        toast.error(t('subscription_expired') as string);
      } else {
        toast.error(getMessage(response.message) as string);
      }
    } catch (err) {
      toast.error(t('something_went_wrong') as string);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-accent px-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeLanguageSwitcher />
      </div>
      <Card
        id="login-card"
        className="max-w-md w-full p-8 flex flex-col gap-y-6 rounded-xl hover:shadow-md transition-all duration-300 backdrop-blur-sm"
      >
        <div id="login-header" className="text-center">
          <h2 id="login-title" className="text-3xl font-bold text-card-foreground mb-2">Lumen</h2>
          <p id="login-subtitle" className="text-muted-foreground">{t('church_management_system')}</p>
        </div>
        <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
          <InputText
            id="login-email"
            label={t('email')}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full"
          />
          <InputText
            id="login-password"
            label={t('password')}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full"
          />
          <button
            id="login-submit"
            type="submit"
            className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            disabled={loading || !email || !password}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('logging_in')}
              </div>
            ) : (
              t('login')
            )}
          </button>
        </form>
        <p id="login-no-account">
          {t('no_account')}{' '}
          <button
            id="login-register-button"
            onClick={() => navigate('/register')}
            className="text-primary hover:underline"
          >
            {t('register')}
          </button>
        </p>
      </Card>

    </div>
  );
};

export default LoginPage;
