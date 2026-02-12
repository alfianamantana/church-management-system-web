import { createBrowserRouter, Outlet, RouteObject } from 'react-router-dom';
import BlankLayout from '../components/Layouts/BlankLayout';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import BlankDefaultLayout from '../components/Layouts/BlankDefaultLayout';
import { routes } from './routes';

type Route = RouteObject & {
    layout?: string;
    name?: string;
    breadcrumb?: string;
    description?: string;
    redirect?: string;
};

function mapLayouts(route: Route): RouteObject {

    let element = route.element;

    if (route.layout) {
        const Layout = route.layout === 'blank' ? BlankLayout : route.layout === 'blank-default' ? BlankDefaultLayout : DefaultLayout;
        if (element) {
            element = <Layout>{element}</Layout>;
        } else {
            element = <Layout>{element}</Layout>;
        }
    }
    return {
        ...route,
        element,
        children: route.children ? route.children.map(mapLayouts) : undefined,
    } as RouteObject;
}

const mappedRoutes = routes.map(mapLayouts);

const router = createBrowserRouter(mappedRoutes);

export default router;
