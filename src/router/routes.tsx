import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
const Login = lazy(() => import('../pages/auth/login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Jemaat = lazy(() => import('../pages/Jemaat/List'));
const JemaatCreate = lazy(() => import('../pages/Jemaat/Create'));
const Calendar = lazy(() => import('../pages/Calendar'));
const MemberList = lazy(() => import('../pages/Member/list'));
const RoleList = lazy(() => import('../pages/Role/List'));
const ScheduleList = lazy(() => import('../pages/Schedulle/List'));
const ErrorElement = () => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">404 Not Found</h1>
        <p className="text-gray-500 dark:text-white">Halaman tidak ditemukan.</p>
    </div>
);

const routes = [
    {
        path: '/',
        layout: 'default',
        name: 'Home',
        breadcrumb: 'Home',
        errorElement: <ErrorElement />,
        children: [
            {
                index: true,
                element: <Navigate to="/dashboard" replace />,
            },
            {
                path: 'dashboard',
                element: <Dashboard />,
                name: 'Dashboard',
                breadcrumb: 'Home',
                description: 'Dashboard utama untuk superadmin/user',
            },
            {
                path: 'jemaat',
                name: 'Jemaat',
                breadcrumb: 'Jemaat',
                description: 'Halaman manajemen data jemaat',
                children: [
                    {
                        index: true,
                        element: <Jemaat />,
                        name: 'Jemaat List',
                        breadcrumb: 'Jemaat',
                        description: 'Daftar jemaat',
                    },
                    {
                        path: 'create',
                        element: <JemaatCreate />,
                        name: 'Create Jemaat',
                        breadcrumb: 'Create',
                        description: 'Tambah data jemaat',
                    },
                ],
            },
            {
                path: 'member',
                name: 'Member',
                breadcrumb: 'Member',
                description: 'Halaman manajemen data member',
                children: [
                    {
                        index: true,
                        element: <MemberList />,
                        name: 'Member List',
                        breadcrumb: 'Member',
                        description: 'Daftar member',
                    },
                ],
            },
            {
                path: 'role',
                name: 'Role',
                breadcrumb: 'Role',
                description: 'Halaman manajemen data role',
                children: [
                    {
                        index: true,
                        element: <RoleList />,
                        name: 'Role List',
                        breadcrumb: 'Role',
                        description: 'Daftar role',
                    },
                ],
            },
            {
                path: 'schedule',
                name: 'Schedule',
                breadcrumb: 'Schedule',
                description: 'Halaman manajemen data schedule',
                children: [
                    {
                        index: true,
                        element: <ScheduleList />,
                        name: 'Schedule List',
                        breadcrumb: 'Schedule',
                        description: 'Daftar schedule',
                    },
                ],
            },
            {
                path: 'calendar',
                element: <Calendar />,
                name: 'Calendar',
                breadcrumb: 'Calendar',
                description: 'Halaman kalender acara',
            }
        ],
    },
    {
        path: '/login',
        element: <Login />,
        layout: 'blank',
        name: 'Login',
        breadcrumb: 'Login',
        description: 'Halaman login user/admin',
        errorElement: <ErrorElement />,
    },
];

export { routes };
