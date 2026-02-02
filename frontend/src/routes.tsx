import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './layout'
import AuthLayout from './features/auth/auth.layout';
import HomePage from './features/home/home.page'
import SignUpPage from './features/auth/signup.page'
import LoginPage from './features/auth/login.page';
import SettingsPage from './features/settings/settings.page';
import ListPage from './features/list/list.page';

const Routes = () => {
  const router = createBrowserRouter([
    {
      path: '/',
      element: <Layout pageTitle="Dashboard" />,
      children: [
        {
          index: true,
          element: <HomePage />
        }
      ]
    },
    {
      path: 'login',
      element: <AuthLayout />,
      children: [
        {
          index: true,
          element: <LoginPage />
        }
      ]
    },
    {
      path: 'signup',
      element: <AuthLayout />,
      children:[
        {
          index:true,
          element:<SignUpPage />
        }
      ]
    },
    {
      path: 'settings',
      element:<Layout pageTitle='Settings' />,
      children:[
        {
          index: true,
          element:<SettingsPage />
        }
      ]
    },
    {
      path: 'lists',
      element:<Layout pageTitle='Lists' />,
      children:[
        {
          index: true,
          element:<ListPage />
        }
      ]
    }
  ]);

  return <RouterProvider router={router} />
}

export default Routes
