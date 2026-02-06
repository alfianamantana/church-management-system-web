import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { IBasicResponse, getMessage } from '../../constant';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import JemaatForm from '../../components/Form/Jemaat';

const CreateJemaat: React.FC = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  useEffect(() => {
    dispatch(setPageTitle(t('add_jemaat')));
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        mom_id: data.mom_id ? Number(data.mom_id) : undefined,
        dad_id: data.dad_id ? Number(data.dad_id) : undefined,
        baptism_date: data.baptism_date || undefined,
      };
      const { data: response } = await api.post('/jemaat', payload);
      const res: IBasicResponse = response;

      if (res.code === 201) {
        navigate('/jemaat');
        toast.success(t('jemaat_added') as string);
      } else {
        toast.error(getMessage(res.message));
      }
    } catch (err) {
      toast.error(t('something_went_wrong') as string);
    } finally {
      setLoading(false);
    }
  };

  return <JemaatForm title={t('add_jemaat')} onSubmit={handleSubmit} loading={loading} />;
};

export default CreateJemaat;
