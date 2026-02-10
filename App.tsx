
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './src/components/shared/Layout';
import Home from './src/pages/public/Home';
import Menu from './src/pages/public/Menu';
import Reservation from './src/pages/public/Reservation';
import Order from './src/pages/public/Order';
import Gallery from './src/pages/public/Gallery';
import Blog from './src/pages/public/Blog';
import BlogPost from './src/pages/public/BlogPost';
import About from './src/pages/public/About';

// Admin Imports
import Login from './src/pages/admin/Login';
import Dashboard from './src/pages/admin/Dashboard';
import AdminLayout from './src/components/admin/AdminLayout';
import ProtectedRoute from './src/components/admin/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<Login />} />
        
        <Route path="/admin/*" element={
          <ProtectedRoute>
            <AdminLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="reservations" element={<div className="p-4">Gestion Réservations (À venir)</div>} />
                <Route path="orders" element={<div className="p-4">Gestion Commandes (À venir)</div>} />
                <Route path="menu" element={<div className="p-4">Gestion Menu (À venir)</div>} />
                <Route path="gallery" element={<div className="p-4">Gestion Galerie (À venir)</div>} />
                <Route path="blog" element={<div className="p-4">Gestion Blog (À venir)</div>} />
                <Route path="reviews" element={<div className="p-4">Gestion Avis (À venir)</div>} />
                <Route path="settings" element={<div className="p-4">Paramètres (À venir)</div>} />
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
    </Router>
  );
}

export default App;
