import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import { getMessage, IBasicResponse, IUser } from '../../constant';
import api from '../../services/api';
import ThemeLanguageSwitcher from '../../components/ThemeLanguageSwitcher';
import { toast } from 'react-toastify';
import { decryptData, encryptData } from '@/services/crypto';
import ChurchForm, { ChurchFormData, ChurchFormRef } from '../../components/Form/Church';

interface ResponseSubmitChurch extends IBasicResponse {
  data?: IUser;
}

const CreateChurchPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef<ChurchFormRef>(null);

  const handleSubmit = async (data: ChurchFormData) => {
    setIsLoading(true);
    try {
      const { data: responseData } = await api.post('/churches', data);
      const response: ResponseSubmitChurch = responseData;
      if (response.code === 201) {
        const string = JSON.stringify(response.data);
        const userEncrypted = await encryptData(string);
        await localStorage.setItem('user', userEncrypted);
        toast.success(getMessage(response.message) as string);
        navigate('/select-church');
      } else {
        toast.error(getMessage(response.message) as string);
      }
    } catch (error: any) {
      toast.error(t('something_went_wrong') as string);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let user = localStorage.getItem('user');
    if (!user) {
      navigate('/login');
      return;
    }
    let decryptedUser: string = decryptData(user)
    if (!decryptedUser) {
      navigate('/login');
      return;
    }
    const userData: IUser = JSON.parse(decryptedUser);

    if (userData.churches && userData.churches.length && userData.subscribe_type === 'bibit') {
      navigate('/select-church');
      return;
    }

    // if (userData.is_main_account && userData.is_verified && userData.subscribe_type ===) {

    // }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeLanguageSwitcher />
      </div>

      <Card id="create-church-card" className="w-full max-w-md">
        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {t('create_church_title') || 'Create Your Church'}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {t('create_church_subtitle') || 'Set up your church information'}
            </p>
          </div>

          <ChurchForm
            ref={formRef}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            mode="create"
          />
        </div>
      </Card>
    </div>
  );
};

export default CreateChurchPage;