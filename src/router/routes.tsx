import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
const Login = lazy(() => import('../pages/auth/login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Jemaat = lazy(() => import('../pages/Jemaat/List'));
const JemaatCreate = lazy(() => import('../pages/Jemaat/Create'));

const ErrorElement = () => (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
        <h1 className="text-3xl font-bold mb-2">404 Not Found</h1>
        <p className="text-gray-500">Halaman tidak ditemukan.</p>
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
