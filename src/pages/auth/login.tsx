
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full p-6 flex flex-col gap-y-5 border border-gray-200 rounded hover:shadow transition-all duration-200 bg-white dark:bg-gray-800">
        <h2 className="text-2xl font-bold text-center ">{t('church_management_system')}</h2>
        <InputText
          label={t('email')}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <InputText
          label={t('password')}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button
          onClick={handleSubmit}
          type="submit"
          className={`w-full py-2 bg-blue-600 text-white font-semibold rounded transition disabled:opacity-60`}
          disabled={loading || !email || !password}
        >
          {loading ? (t('logging_in')) : t('login')}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
