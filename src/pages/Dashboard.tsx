import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import ManSvg from '@/assets/svg/man.svg';
import WomanSvg from '@/assets/svg/woman.svg';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import { toast } from 'react-toastify';
import { IBasicResponse } from '@/constant';
import dayjs from 'dayjs';
interface BirthdayMember {
  id: number;
  name: string;
  birth_date: string;
  age: number;
}
interface ChurchEvent {
  id: number;
  title: string;
  start: string;
  end: string;
  description: string;
}
interface LumenDashboardData {
  totalMembers: number;
  totalFamilies: number;
  totalMale: number;
  totalFemale: number;
  incomeThisMonth: number;
  expenseThisMonth: number;
  eventsThisMonth: ChurchEvent[];
  birthdaysThisMonth: BirthdayMember[];
}

interface LumenDashboardResponse extends IBasicResponse {
  data: LumenDashboardData;
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<LumenDashboardData | null>(null);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/dashboard');
      const response: LumenDashboardResponse = data;
      if (response.code === 200) {
        setDashboardData(response.data);
      } else {
        toast.error(response.message[0]);
      }
    } catch (error) {
      toast.error(t('error_fetching_data') as string);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);
  // Remove mock data and use fetched data

  const totals = useMemo(() => {
    if (!dashboardData) return { totalMembers: 0, male: 0, female: 0, familyCount: 0, eventsThisMonth: 0 };
    const totalMembers = dashboardData.totalMembers;
    const male = dashboardData.totalMale;
    const female = dashboardData.totalFemale;
    const familyCount = dashboardData.totalFamilies;
    const eventsThisMonth = dashboardData.eventsThisMonth.length;
    return { totalMembers, male, female, familyCount, eventsThisMonth };
  }, [dashboardData]);

  const finances = useMemo(() => {
    if (!dashboardData) return { incomeThisMonth: 0, expenseThisMonth: 0 };
    return {
      incomeThisMonth: dashboardData.incomeThisMonth,
      expenseThisMonth: dashboardData.expenseThisMonth,
    };
  }, [dashboardData]);

  const eventsThisMonth = dashboardData?.eventsThisMonth || [];
  const birthdaysThisMonth = dashboardData?.birthdaysThisMonth || [];

  const formatCurrency = (v: number) => v.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });

  return (
    <div className="">
      <section className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('total_jemaat')}</div>
          <div className="mt-2 text-3xl font-bold text-blue-600 dark:text-gray-200">{totals.totalMembers} {t('jemaat')}</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={ManSvg} alt="Man Icon" className="w-6 h-6 mr-2" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('male')}</div>
                <div className="text-2xl font-semibold text-blue-500">{totals.male}</div>
              </div>
            </div>
            <div className="flex items-center">
              <img src={WomanSvg} alt="Woman Icon" className="w-6 h-6 mr-2" />
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('female')}</div>
                <div className="text-2xl font-semibold text-pink-500">{totals.female}</div>
              </div>
            </div>
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('total_families')}</div>
          <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">{totals.familyCount}</div>
        </Card>

      </section>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <Card>
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('income_this_month')}</div>
          <div className="mt-2 text-2xl font-semibold text-green-600">{formatCurrency(finances.incomeThisMonth)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('income_description')}</div>
        </Card>

        <Card>
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('expense_this_month')}</div>
          <div className="mt-2 text-2xl font-semibold text-red-600">{formatCurrency(finances.expenseThisMonth)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('expense_description')}</div>
        </Card>

        <Card>
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('events_this_month')}</div>
          <div className="mt-2 text-2xl font-bold text-gray-800 dark:text-white">{totals.eventsThisMonth}</div>
          <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto">
            {eventsThisMonth.map(ev => (
              <li key={ev.id} className="py-1">{ev.title} — {dayjs(ev.start).format('DD-MM-YYYY')}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('birthdays_this_month')}</h3>
          <div className="mt-2 max-h-32 overflow-y-auto">
            {birthdaysThisMonth.length ? (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {birthdaysThisMonth.map(b => (
                  <li key={b.id} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-white">{b.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{dayjs(b.birth_date).format('DD-MM-YYYY')}</div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{b.age} {t('years_old')}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('no_birthdays_this_month')}</div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;
