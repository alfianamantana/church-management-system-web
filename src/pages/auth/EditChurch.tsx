import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/Card';
import { getMessage, IBasicResponse, IUser, IChurch } from '../../constant';
import api from '../../services/api';
import ThemeLanguageSwitcher from '../../components/ThemeLanguageSwitcher';
import { toast } from 'react-toastify';
import { encryptData } from '@/services/crypto';
import ChurchForm, { ChurchFormData, ChurchFormRef } from '../../components/Form/Church';
import CountryList from 'country-list-with-dial-code-and-flag';

interface ResponseUpdateChurch extends IBasicResponse {
  data?: IUser;
}
interface ResponseGetProfile extends IBasicResponse {
  data?: IUser[];
}

interface ResponseGetChurch extends IBasicResponse {
  data?: IChurch[];
}

const EditChurchPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [churchData, setChurchData] = useState<IChurch | null>(null);
  const formRef = useRef<ChurchFormRef>(null);

  useEffect(() => {
    fetchChurchData();
  }, []);

  const fetchChurchData = async () => {
    try {
      const { data } = await api.get('/churches');
      const response: ResponseGetChurch = data;
      if (response.code === 200) {
        if (response.data && response.data.length > 0) {
          setChurchData(response.data[0]);
        } else {
          toast.error(t('something_went_wrong') as string);
          navigate('/select-church');
        }
      } else {
        toast.error(getMessage(response.message) as string);
        navigate('/select-church');
      }
    } catch (error: any) {
      toast.error(t('something_went_wrong') as string);
      navigate('/select-church');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (data: ChurchFormData) => {
    setIsLoading(true);
    try {
      const { data: responseData } = await api.put('/churches', data);
      const response: ResponseUpdateChurch = responseData;
      if (response.code === 200) {
        fetchProfile();
        toast.success(getMessage(response.message) as string);
      } else {
        toast.error(getMessage(response.message) as string);
      }
    } catch (error: any) {
      toast.error(t('something_went_wrong') as string);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await api({ url: '/user/profile', params: { church: true } });
      const response: ResponseGetProfile = data;
      if (response.code === 200 && response.data) {
        if (response.data.length > 0) {
          const string = JSON.stringify(response.data[0]);
          const userEncrypted = await encryptData(string);
          await localStorage.setItem('user', userEncrypted);
          navigate('/select-church');
        } else {
          toast.error(t('something_went_wrong') as string);
        }
      } else {
        toast.error(getMessage(response.message) as string);
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
    }
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeLanguageSwitcher />
        </div>
        <Card id="edit-church-loading-card" className="w-full max-w-md">
          <div className="p-6 md:p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">{t('loading') || 'Loading...'}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!churchData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="absolute top-4 right-4">
          <ThemeLanguageSwitcher />
        </div>
        <Card id="edit-church-not-found-card" className="w-full max-w-md">
          <div className="p-6 md:p-8 text-center">
            <p className="text-destructive">{t('church_not_found') || 'Church not found'}</p>
          </div>
        </Card>
      </div>
    );
  }

  // Prepare initial data for the form
  const selectedPhoneCountry = CountryList.findOneByCountryCode(churchData.country);
  const dialCode = selectedPhoneCountry ? selectedPhoneCountry.dial_code.replace('+', '') : '';

  const initialData: Partial<ChurchFormData> = {
    name: churchData.name,
    email: churchData.email,
    city: churchData.city,
    country: churchData.country,
    phone_number: churchData.phone_number.startsWith(dialCode)
      ? churchData.phone_number.substring(dialCode.length)
      : churchData.phone_number.replace(/^\+\d+/, ''), // Fallback to old method if dial code doesn't match
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeLanguageSwitcher />
      </div>

      <Card id="edit-church-card" className="w-full max-w-md">
        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {t('edit_church_title') || 'Edit Church'}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              {t('edit_church_subtitle') || 'Update your church information'}
            </p>
          </div>

          <ChurchForm
            ref={formRef}
            initialData={initialData}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            mode="edit"
          />
        </div>
      </Card>
    </div>
  );
};

export default EditChurchPage;
