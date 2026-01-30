import React from 'react';
import Card from '../components/Card';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen  flex flex-col gap-y-2">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex flex-col items-center">
          <span className="text-3xl font-bold text-blue-600">120</span>
          <span className="text-gray-600 dark:text-gray-300">Total Jemaat</span>
        </Card>
        <Card className="flex flex-col items-center">
          <span className="text-3xl font-bold text-green-600">5</span>
          <span className="text-gray-600 dark:text-gray-300">Active Users</span>
        </Card>
        <Card className="flex flex-col items-center">
          <span className="text-3xl font-bold text-yellow-600">2</span>
          <span className="text-gray-600 dark:text-gray-300">Pending Requests</span>
        </Card>
      </section>
    </div>
  );
};

export default Dashboard;
