import React, { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card';
import ManSvg from '@/assets/svg/man.svg';
import WomanSvg from '@/assets/svg/woman.svg';
import { useTranslation } from 'react-i18next';
import api from '@/services/api';
import { toast } from 'react-toastify';
import { IBasicResponse, getMessage } from '@/constant';
import { useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import { setPageTitle } from '@/store/themeConfigSlice';
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
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setPageTitle('Dashboard'));
  });
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<LumenDashboardData | null>(null);

  const fetchDashboardData = async () => {
    try {
      const { data } = await api.get('/dashboard');
      const response: LumenDashboardResponse = data;

      if (response.code === 200) {
        setDashboardData(response.data);
      } else {
        toast.error(getMessage(response.message));
      }
    } catch (error) {
      toast.error(t('something_went_wrong') as string);

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
    <div id="dashboard-page">
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="stats-section">
        <Card id="total-jemaat-card">
          <div className="text-sm text-muted-foreground" id="total-jemaat-label">{t('total_jemaat')}</div>
          <div className="mt-2 text-3xl font-bold text-primary" id="total-jemaat-value">{totals.totalMembers} {t('jemaat')}</div>
        </Card>
        <Card id="gender-stats-card">
          <div className="flex items-center justify-between" id="gender-stats-content">
            <div className="flex items-center" id="male-stats">
              <img src={ManSvg} alt="Man Icon" className="w-6 h-6 mr-2" id="male-icon" />
              <div>
                <div className="text-sm text-muted-foreground" id="male-label">{t('male')}</div>
                <div className="text-2xl font-semibold text-primary" id="male-count">{totals.male}</div>
              </div>
            </div>
            <div className="flex items-center" id="female-stats">
              <img src={WomanSvg} alt="Woman Icon" className="w-6 h-6 mr-2" id="female-icon" />
              <div>
                <div className="text-sm text-muted-foreground" id="female-label">{t('female')}</div>
                <div className="text-2xl font-semibold text-primary" id="female-count">{totals.female}</div>
              </div>
            </div>
          </div>
        </Card>
        <Card id="total-families-card">
          <div className="text-sm text-muted-foreground" id="total-families-label">{t('total_families')}</div>
          <div className="mt-2 text-2xl font-bold text-primary" id="total-families-value">{totals.familyCount}</div>
        </Card>

      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6" id="details-section">
        <Card id="income-card">
          <div className="text-sm text-muted-foreground" id="income-label">{t('income_this_month')}</div>
          <div className="mt-2 text-2xl font-semibold text-success" id="income-value">{formatCurrency(finances.incomeThisMonth)}</div>
          <div className="text-xs text-muted-foreground mt-1" id="income-description">{t('income_description')}</div>
        </Card>

        <Card id="expense-card">
          <div className="text-sm text-muted-foreground" id="expense-label">{t('expense_this_month')}</div>
          <div className="mt-2 text-2xl font-semibold text-destructive" id="expense-value">{formatCurrency(finances.expenseThisMonth)}</div>
          <div className="text-xs text-muted-foreground mt-1" id="expense-description">{t('expense_description')}</div>
        </Card>

        <Card id="events-card">
          <div className="text-sm text-muted-foreground" id="events-label">{t('events_this_month')}</div>
          <div className="mt-2 text-2xl font-bold text-primary" id="events-count">{totals.eventsThisMonth}</div>
          <ul className="mt-2 text-sm text-muted-foreground max-h-32 overflow-y-auto" id="events-list">
            {eventsThisMonth.map(ev => (
              <li key={ev.id} className="py-1" id={`event-${ev.id}`}>{ev.title} — {dayjs(ev.start).format('DD-MM-YYYY')}</li>
            ))}
          </ul>
        </Card>

        <Card id="birthdays-card">
          <h3 className="text-sm font-medium text-muted-foreground" id="birthdays-title">{t('birthdays_this_month')}</h3>
          <div className="mt-2 max-h-32 overflow-y-auto" id="birthdays-content">
            {birthdaysThisMonth.length ? (
              <ul className="divide-y divide-border" id="birthdays-list">
                {birthdaysThisMonth.map(b => (
                  <li key={b.id} className="py-2 flex items-center justify-between" id={`birthday-${b.id}`}>
                    <div id={`birthday-info-${b.id}`}>
                      <div className="font-medium text-foreground" id={`birthday-name-${b.id}`}>{b.name}</div>
                      <div className="text-xs text-muted-foreground" id={`birthday-date-${b.id}`}>{dayjs(b.birth_date).format('DD-MM-YYYY')}</div>
                    </div>
                    <div className="text-sm text-muted-foreground" id={`birthday-age-${b.id}`}>{b.age} {t('years_old')}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-muted-foreground" id="no-birthdays">{t('no_birthdays_this_month')}</div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;
