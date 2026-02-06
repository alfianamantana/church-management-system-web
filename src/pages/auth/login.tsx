
import React, { useState } from 'react';
import api from '../../services/api';
import { IBasicResponse, IUser } from '../../constant';
import { toast } from 'react-toastify';
import InputText from '../../components/InputText';
import { useTranslation } from 'react-i18next';
import { encryptData } from '../../services/crypto';
import { useNavigate } from "react-router";


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
      toast.error('Please enter both email and password');
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.post('/user/login', { email, password });
      const response: ILoginResponse = data;
      if (response.code === 200) {
        const string = JSON.stringify(response.data);
        let userEncrypted = await encryptData(string);
        localStorage.setItem('user', userEncrypted);
        localStorage.setItem('token', response.token);
        navigate('/dashboard');
        toast.success('Login successful!');
      } else {
        toast.error(response.message[0]);
      }
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full p-8 flex flex-col gap-y-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Lumen</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('church_management_system')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <InputText
            label={t('email')}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full"
          />
          <InputText
            label={t('password')}
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full"
          />
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
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
        <p>
          {t('no_account')}{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-blue-600 hover:underline"
          >
            {t('register')}
          </button>
        </p>
      </div>

    </div>
  );
};

export default LoginPage;
