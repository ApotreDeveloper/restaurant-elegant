
import React, { Suspense } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './components/shared/Layout';
import LoadingSpinner from './components/shared/LoadingSpinner';

// Lazy Load Public Pages
const Home = React.lazy(() => import('./pages/public/Home'));
const Menu = React.lazy(() => import('./pages/public/Menu'));
const Reservation = React.lazy(() => import('./pages/public/Reservation'));
const Order = React.lazy(() => import('./pages/public/Order'));
const Gallery = React.lazy(() => import('./pages/public/Gallery'));
const Blog = React.lazy(() => import('./pages/public/Blog'));
const BlogPost = React.lazy(() => import('./pages/public/BlogPost'));
const About = React.lazy(() => import('./pages/public/About'));

// Lazy Load Admin Pages
const Login = React.lazy(() => import('./pages/admin/Login'));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard'));
const Reservations = React.lazy(() => import('./pages/admin/Reservations'));
const Orders = React.lazy(() => import('./pages/admin/Orders'));
const MenuManagement = React.lazy(() => import('./pages/admin/MenuManagement'));
const GalleryManagement = React.lazy(() => import('./pages/admin/GalleryManagement'));
const BlogManagement = React.lazy(() => import('./pages/admin/BlogManagement'));
const ReviewsManagement = React.lazy(() => import('./pages/admin/ReviewsManagement'));
const Settings = React.lazy(() => import('./pages/admin/Settings'));

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Suspense fallback={<div className="h-screen flex items-center justify-center bg-accent"><LoadingSpinner size="lg" /></div>}>
          <Routes>
            {/* Admin Routes */}
            <Route path="/admin/login" element={<Login />} />
            
            <Route path="/admin/*" element={
              <ProtectedRoute>
                <AdminLayout>
                  <Routes>
                    <Route index element={<Navigate to="dashboard" replace />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="reservations" element={<Reservations />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="menu" element={<MenuManagement />} />
                    <Route path="gallery" element={<GalleryManagement />} />
                    <Route path="blog" element={<BlogManagement />} />
                    <Route path="reviews" element={<ReviewsManagement />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            } />

            {/* Public Routes */}
            <Route path="*" element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/reservation" element={<Reservation />} />
                  <Route path="/commande" element={<Order />} />
                  <Route path="/galerie" element={<Gallery />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/a-propos" element={<About />} />
                </Routes>
              </Layout>
            } />
          </Routes>
        </Suspense>
      </Router>
    </HelmetProvider>
  );
}

export default App;
