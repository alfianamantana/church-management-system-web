import React from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '@/services/api';
import { IBasicResponse, IRole } from '@/constant';
import ScheduleForm from '../../components/Form/ScheduleForm';

interface IScheduleFormData {
  service_name: string;
  scheduled_at: string;
  instrument_assignments: Record<string, number[]>;
  instruments: string[];
  musician_ids?: number[];
}

const ScheduleCreate: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  React.useEffect(() => {
    dispatch(setPageTitle(t('create_schedule')));
  }, []);

  const handleSubmit = async (schedules: IScheduleFormData[], roles: IRole[]) => {
    try {
      // Transform schedules before sending: replace instrument names with ids when available
      const payloadSchedules = schedules.map(s => {
        // instruments array -> provide objects with id (if found) and name
        const instrumentsInfo = s.instruments.map(name => {
          const role = roles.find(r => r.role_name === name);
          return { id: role ? role.id : null, name };
        });

        // instrument_assignments: use id as key when available, else fallback to name
        const instrument_assignments: Record<string, number[]> = {};
        for (const name of s.instruments) {
          const assigned = s.instrument_assignments[name] || [];
          const role = roles.find(r => r.role_name === name);
          if (role) {
            instrument_assignments[String(role.id)] = assigned;
          } else {
            // fallback to name key if no id available
            instrument_assignments[name] = assigned;
          }
        }

        return {
          service_name: s.service_name,
          scheduled_at: s.scheduled_at,
          instrument_assignments,
          musician_ids: s.musician_ids || undefined,
          role_assignments: (s as any).role_assignments || undefined
        };
      });

      const { data } = await api({
        url: '/music/schedules',
        method: 'POST',
        data: { schedules: payloadSchedules },
      });

      const response: IBasicResponse = data;
      if (data.code === 201) {
        toast.success(t('schedules_created_successfully') as string);
        navigate('/schedule');
      } else {
        toast.error(response.message?.[0]);
      }
    } catch (error) {
      toast.error(t('failed_create_schedules') as string);
      throw error; // Re-throw to let ScheduleForm handle
    }
  };

  return <ScheduleForm mode="create" onSubmit={handleSubmit} />;
};

export default ScheduleCreate;
