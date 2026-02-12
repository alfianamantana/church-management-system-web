import path from 'path';
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
const Login = lazy(() => import('../pages/auth/Login'));
const Register = lazy(() => import('../pages/auth/Register'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Jemaat = lazy(() => import('../pages/Jemaat/List'));
const JemaatCreate = lazy(() => import('../pages/Jemaat/Create'));
const Calendar = lazy(() => import('../pages/Calendar/Calendar'));
const MemberList = lazy(() => import('../pages/Member/list'));
const RoleList = lazy(() => import('../pages/Role/List'));
const ScheduleList = lazy(() => import('../pages/Schedule/List'));
const ScheduleCreate = lazy(() => import('../pages/Schedule/Create'));
const KeuanganList = lazy(() => import('../pages/Keuangan/List'));
const FamilyList = lazy(() => import('../pages/Family/List'));
const JemaatEdit = lazy(() => import('../pages/Jemaat/Edit'));
const ScheduleEdit = lazy(() => import('../pages/Schedule/Edit'));
const Assets = lazy(() => import('../pages/assets/List'));
const ProfileDetail = lazy(() => import('../pages/Profile/Detail'));
const Admin = lazy(() => import('../pages/admin/List'));
const OTP = lazy(() => import('../pages/auth/OTP'));
const CreateChurch = lazy(() => import('../pages/auth/CreateChurch'));
const SelectChurch = lazy(() => import('../pages/auth/SelectChurch'));

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
                    {
                        path: 'edit/:id',
                        element: <JemaatEdit />,
                        name: 'Edit Jemaat',
                        breadcrumb: 'Edit',
                        description: 'Edit data jemaat',
                    }
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
                    {
                        path: 'create',
                        element: <ScheduleCreate />,
                        name: 'Create Schedule',
                        breadcrumb: 'Create',
                        description: 'Tambah data schedule',
                    },
                    {
                        path: 'edit/:id',
                        element: <ScheduleEdit />,
                        name: 'Edit Schedule',
                        breadcrumb: 'Edit',
                        description: 'Edit data schedule',
                    }
                ],
            },
            {
                path: 'keuangan',
                name: 'Keuangan',
                breadcrumb: 'Keuangan',
                description: 'Halaman manajemen data keuangan',
                children: [
                    {
                        index: true,
                        element: <KeuanganList />,
                        name: 'Keuangan List',
                        breadcrumb: 'Keuangan',
                        description: 'Daftar transaksi keuangan',
                    },
                ],
            },
            {
                path: 'family',
                name: 'Family',
                breadcrumb: 'Family',
                description: 'Halaman manajemen data family',
                children: [
                    {
                        index: true,
                        element: <FamilyList />,
                        name: 'Family List',
                        breadcrumb: 'Family',
                        description: 'Daftar family',
                    },
                ],
            },
            {
                path: 'admin',
                element: <Admin />,
                name: 'Admin',
                breadcrumb: 'Admin',
                description: 'Halaman manajemen data admin',
            },
            {
                path: 'calendar',
                element: <Calendar />,
                name: 'Calendar',
                breadcrumb: 'Calendar',
                description: 'Halaman kalender acara',
            },
            {
                path: 'assets',
                element: <Assets />,
                name: 'Assets',
                breadcrumb: 'Assets',
                description: 'Halaman manajemen data aset',
            },
            {
                path: 'profile',
                element: <ProfileDetail />,
                name: 'Profile',
                breadcrumb: 'Profile',
                description: 'Halaman detail profil user',
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
    {
        path: '/register',
        element: <Register />,
        layout: 'blank',
        name: 'Register',
        breadcrumb: 'Register',
        description: 'Halaman registrasi user baru',
        errorElement: <ErrorElement />,
    },
    {
        path: '/otp',
        element: <OTP />,
        layout: 'blank',
        name: 'OTP',
        breadcrumb: 'OTP',
        description: 'Halaman verifikasi OTP',
        errorElement: <ErrorElement />,
    },
    {
        path: '/create-church',
        element: <CreateChurch />,
        layout: 'blank-default',
        name: 'Create Church',
        breadcrumb: 'Create Church',
        description: 'Halaman pembuatan gereja',
        errorElement: <ErrorElement />,
    },
    {
        path: '/select-church',
        element: <SelectChurch />,
        layout: 'blank-default',
        name: 'Select Church',
        breadcrumb: 'Select Church',
        description: 'Halaman pemilihan gereja',
        errorElement: <ErrorElement />,
    }
];

export { routes };
