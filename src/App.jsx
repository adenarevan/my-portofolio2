import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, Link, Outlet, RouterProvider, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import './blog.css';

const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const TrendingBotPage = lazy(() => import('./pages/TrendingBotPage'));

function Layout() {
  const location = useLocation();
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
      else window.scrollTo({ top: 0, behavior: 'instant' });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);
  return <Suspense fallback={<p className="route-loading" role="status">Loading…</p>}><Outlet /></Suspense>;
}

const router = createBrowserRouter([{
  element: <Layout />,
  errorElement: <div className="route-error frame"><h1>Halaman tidak tersedia</h1><Link className="text-link" to="/">Kembali ke portofolio</Link></div>,
  children: [
    { path: '/', element: <LandingPage /> },
    { path: '/blog', element: <BlogPage /> },
    { path: '/blog/:postId', element: <BlogPostPage /> },
    { path: '/login', element: <LoginPage /> },
    { path: '/admin', element: <AdminPage /> },
    { path: '/admin/bot', element: <TrendingBotPage /> },
  ],
}]);

function App() {
  return <RouterProvider router={router} />;
}

export default App
