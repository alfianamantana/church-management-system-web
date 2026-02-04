import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { IBasicResponse, IJemaat } from '../../constant';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../store/themeConfigSlice';
import JemaatForm from '../../components/Form/Jemaat';
import dayjs from 'dayjs';
interface IJemaatResponse extends IBasicResponse {
  data: IJemaat[];
}
const EditJemaat: React.FC = () => {
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState<any>();

  useEffect(() => {
    dispatch(setPageTitle(t('edit_jemaat')));
  });

  useEffect(() => {
    const fetchJemaat = async () => {
      try {
        const { data } = await api({ url: `/jemaat`, method: 'get', params: { id, dad: true, mom: true } });
        const response: IJemaatResponse = data;
        if (response.code === 200) {
          if (response.data.length) {
            const jemaat = response.data[0];
            setInitialData({
              name: jemaat.name || '',
              birth_date: jemaat.birth_date ? dayjs(jemaat.birth_date).format('YYYY-MM-DD') : '',
              born_place: jemaat.born_place || '',
              phone_number: jemaat.phone_number || '',
              baptism_date: jemaat.baptism_date ? dayjs(jemaat.baptism_date).format('YYYY-MM-DD') : '',
              is_married: jemaat.is_married || false,
              mom_id: jemaat.mom_id ? jemaat.mom_id.toString() : '',
              dad_id: jemaat.dad_id ? jemaat.dad_id.toString() : '',
              gender: jemaat.gender || 'male',
              dad: jemaat.dad || null,
              mom: jemaat.mom || null,
            });
          } else {
            toast.error(t('jemaat_not_found') as string);
          }
        } else {
          toast.error(t(response.message[0]) as string);
          navigate('/jemaat');
          return;
        }

      } catch (err) {
        toast.error(t('something_went_wrong') as string);
      }
    };
    if (id) {
      fetchJemaat();
    }
  }, [id, t]);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        mom_id: data.mom_id ? Number(data.mom_id) : undefined,
        dad_id: data.dad_id ? Number(data.dad_id) : undefined,
        baptism_date: data.baptism_date || undefined,
      };
      const { data: response } = await api({ url: `/jemaat`, method: 'put', params: { id }, data: payload });
      const res: IBasicResponse = response;

      if (res.code === 200) {
        navigate('/jemaat');
        toast.success(t('jemaat_updated') as string);
      } else {
        toast.error(res.message[0]);
      }
    } catch (err) {
      toast.error(t('something_went_wrong') as string);
    } finally {
      setLoading(false);
    }
  };

  if (!initialData) {
    return <div>Loading...</div>;
  }

  return <JemaatForm title={t('edit_jemaat')} initialData={initialData} onSubmit={handleSubmit} loading={loading} />;
};

export default EditJemaat;
