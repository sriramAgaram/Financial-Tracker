import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ProgressSpinner } from 'primereact/progressspinner'
import Layout from './layout'
import AuthLayout from './features/auth/auth.layout';

// Loading Component
const Loading = () => (
    <div className="flex items-center justify-center h-screen w-full bg-slate-50/50">
        <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="4" animationDuration=".5s"/>
    </div>
);

// Lazy Imports
const HomePage = lazy(() => import('./features/home/home.page'));
const SignUpPage = lazy(() => import('./features/auth/signup.page'));
const LoginPage = lazy(() => import('./features/auth/login.page'));
const SettingsPage = lazy(() => import('./features/settings/settings.page'));
const ListPage = lazy(() => import('./features/list/list.page'));
const DashboardPage = lazy(()=> import('./features/Dashboard/dashboard.page'))

// Loadable Helper
const Loadable = (Component: React.ComponentType) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
);

const Routes = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout pageTitle="Home" />,
      children: [
        {
          index: true,
          element: Loadable(HomePage)
        }
      ]
    },
    {
      path: 'login',
      element: <AuthLayout />,
      children: [
        {
          index: true,
          element: Loadable(LoginPage)
        }
      ]
    },
    {
      path: 'signup',
      element: <AuthLayout />,
      children:[
        {
          index:true,
          element: Loadable(SignUpPage)
        }
      ]
    },
    {
      path: 'settings',
      element:<Layout pageTitle='Settings' />,
      children:[
        {
          index: true,
          element: Loadable(SettingsPage)
        }
      ]
    },
    {
      path: 'lists',
      element:<Layout pageTitle='Lists' />,
      children:[
        {
          index: true,
          element: Loadable(ListPage)
        }
      ]
    },
    {
      path: 'dashboard',
      element:<Layout pageTitle='Dashboard' />,
      children:[
        {
          index: true,
          element: Loadable(DashboardPage)
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />
}

export default Routes
