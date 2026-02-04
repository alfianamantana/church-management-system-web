import React, { useMemo } from 'react';
import Card from '../components/Card';
import ManSvg from '@/assets/svg/man.svg';
import WomanSvg from '@/assets/svg/woman.svg';

const Dashboard: React.FC = () => {
  // Mock data
  const members = [
    { id: 1, name: 'John Doe', gender: 'M', age: 34, dob: '1991-02-10' },
    { id: 2, name: 'Jane Smith', gender: 'F', age: 28, dob: '1998-02-20' },
    { id: 3, name: 'Bob Johnson', gender: 'M', age: 45, dob: '1979-02-05' },
    { id: 4, name: 'Alice Tan', gender: 'F', age: 52, dob: '1972-11-12' },
    { id: 5, name: 'Maria Lee', gender: 'F', age: 22, dob: '2002-02-25' },
  ];

  const families = [
    { id: 1, name: 'Family A' },
    { id: 2, name: 'Family B' },
    { id: 3, name: 'Family C' },
  ];

  const finances = {
    incomeThisMonth: 12500000, // in IDR
    expenseThisMonth: 7250000,
  };

  const events = [
    { id: 1, title: 'Sunday Service', date: '2026-02-08' },
    { id: 2, title: 'Youth Meeting', date: '2026-02-15' },
  ];

  const thisMonth = new Date().getMonth() + 1; // 1-12

  const birthdaysThisMonth = members.filter(m => {
    const month = new Date(m.dob).getMonth() + 1;
    return month === thisMonth;
  });

  const totals = useMemo(() => {
    const totalMembers = members.length;
    const male = members.filter(m => m.gender === 'M').length;
    const female = members.filter(m => m.gender === 'F').length;
    const familyCount = families.length;
    const eventsThisMonth = events.filter(e => new Date(e.date).getMonth() + 1 === thisMonth).length;
    const avgAge = Math.round(members.reduce((s, m) => s + m.age, 0) / (members.length || 1));
    return { totalMembers, male, female, familyCount, eventsThisMonth, avgAge };
  }, [members, families, events, thisMonth]);

  const formatCurrency = (v: number) => v.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });

  return (
    <div className="">
      <section className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-4 gap-6">
        <Card>
          <div className="text-sm text-gray-500">Total Jemaat</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">{totals.totalMembers}</div>
        </Card>



        <Card>
          <div className="text-sm text-gray-500">Rata-rata Umur</div>
          <div className="mt-2 text-3xl font-bold text-indigo-600">{totals.avgAge} th</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Total Keluarga</div>
          <div className="mt-2 text-2xl font-bold text-gray-800">{totals.familyCount}</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={ManSvg} alt="Man Icon" className="w-6 h-6 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Laki-laki</div>
                <div className="text-2xl font-semibold text-blue-500">{totals.male}</div>
              </div>
            </div>
            <div className="flex items-center">
              <img src={WomanSvg} alt="Woman Icon" className="w-6 h-6 mr-2" />
              <div>
                <div className="text-sm text-gray-500">Perempuan</div>
                <div className="text-2xl font-semibold text-pink-500">{totals.female}</div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
        <Card>
          <div className="text-sm text-gray-500">Pemasukan (Bulan ini)</div>
          <div className="mt-2 text-2xl font-semibold text-green-600">{formatCurrency(finances.incomeThisMonth)}</div>
          <div className="text-xs text-gray-500 mt-1">Pendapatan acara & donasi</div>
        </Card>

        <Card>
          <div className="text-sm text-gray-500">Pengeluaran (Bulan ini)</div>
          <div className="mt-2 text-2xl font-semibold text-red-600">{formatCurrency(finances.expenseThisMonth)}</div>
          <div className="text-xs text-gray-500 mt-1">Biaya operasional & kegiatan</div>
        </Card>

        <Card>
          <div className="text-sm text-gray-500">Event (Bulan ini)</div>
          <div className="mt-2 text-2xl font-bold text-gray-800">{totals.eventsThisMonth}</div>
          <ul className="mt-2 text-sm text-gray-700">
            {events.filter(e => new Date(e.date).getMonth() + 1 === thisMonth).map(ev => (
              <li key={ev.id} className="py-1">{ev.title} — {new Date(ev.date).toLocaleDateString()}</li>
            ))}
          </ul>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-gray-700">Ulang Tahun Bulan Ini</h3>
          <div className="mt-2">
            {birthdaysThisMonth.length ? (
              <ul className="divide-y divide-gray-200">
                {birthdaysThisMonth.map(b => (
                  <li key={b.id} className="py-2 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800">{b.name}</div>
                      <div className="text-xs text-gray-500">{new Date(b.dob).toLocaleDateString()}</div>
                    </div>
                    <div className="text-sm text-gray-500">{b.age} th</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500">Tidak ada ulang tahun bulan ini.</div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;
