import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '@/store/themeConfigSlice';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import api from '@/services/api';
import { IBasicResponse, IRole, ISchedule, getMessage } from '@/constant';
import ScheduleForm from '../../components/Form/ScheduleForm';

interface IScheduleFormData {
  id?: number;
  service_name: string;
  scheduled_at: string;
  instrument_assignments: Record<string, number[]>;
  instruments: string[];
  musician_ids?: number[];
}

interface IResponseFetchSchedule extends IBasicResponse {
  data: ISchedule[];
}

const ScheduleEdit: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();

  const [initialSchedules, setInitialSchedules] = useState<IScheduleFormData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    dispatch(setPageTitle(t('edit_schedule')));
    if (id) {
      fetchSchedule(id);
    }
  }, [id]);

  const fetchSchedule = async (scheduleId: string) => {
    try {
      const { data } = await api({
        url: `/music/schedules`,
        method: 'GET',
        params: {
          id: scheduleId,
          musician: true
        }
      });

      const response: IResponseFetchSchedule = data;
      if (response.code === 200) {
        if (response.data.length) {
          // Transform the fetched data to match IScheduleFormData
          const schedule = response.data[0];
          const instrument_assignments: Record<string, number[]> = {};
          const instruments: string[] = [];

          if (schedule.serviceAssignments) {
            schedule.serviceAssignments.forEach((assignment: any) => {
              const roleName = assignment.role.role_name;
              const memberId = assignment.member.id;

              if (!instruments.includes(roleName)) {
                instruments.push(roleName);
              }

              if (!instrument_assignments[roleName]) {
                instrument_assignments[roleName] = [];
              }

              if (!instrument_assignments[roleName].includes(memberId)) {
                instrument_assignments[roleName].push(memberId);
              }
            });
          }

          const transformedSchedule: IScheduleFormData = {
            id: schedule.id,
            service_name: schedule.service_name,
            scheduled_at: schedule.scheduled_at,
            instrument_assignments,
            instruments,
          };

          setInitialSchedules([transformedSchedule]);
        } else {
          toast.error(t('schedule_not_found') as string);
          navigate('/schedule');
        }
      } else {
        toast.error(getMessage(response.message));
        navigate('/schedule');
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
      navigate('/schedule');
    } finally {
      setLoading(false);
    }
  };

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
          id: s.id,
          service_name: s.service_name,
          scheduled_at: s.scheduled_at,
          instrument_assignments,
          musician_ids: s.musician_ids || undefined,
          role_assignments: (s as any).role_assignments || undefined
        };
      });

      const { data } = await api({
        url: `/music/schedules`,
        method: 'PUT',
        params: { id },
        data: { schedules: payloadSchedules },
      });

      const response: IBasicResponse = data;
      if (data.code === 200) {
        toast.success(t('schedule_updated_successfully') as string);
        navigate('/schedule');
      } else {
        toast.error(getMessage(response.message));
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);
      throw error; // Re-throw to let ScheduleForm handle
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return <ScheduleForm mode="edit" initialSchedules={initialSchedules} onSubmit={handleSubmit} />;
};

export default ScheduleEdit;
