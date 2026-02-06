import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full p-8 flex flex-col gap-y-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-all duration-300 bg-white dark:bg-gray-800 backdrop-blur-sm">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Lumen</h2>
          <p className="text-gray-600 dark:text-gray-400">{t('church_management_system')}</p>
        </div>
        <button
          onClick={() => navigate('/login')}
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          {t('back')}
        </button>
      </div>
    </div>
  );
};

export default RegisterPage;