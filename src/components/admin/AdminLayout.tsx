
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import AdminHeader from './AdminHeader';
import { ToastProvider } from '../../contexts/ToastContext';
import { ToastContainer } from './Toast';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#f8fafc] font-sans">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        <div className="lg:pl-[260px] flex flex-col min-h-screen transition-all duration-300">
          <AdminHeader onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          <main className="flex-grow p-4 lg:p-8 overflow-x-hidden">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
        
        <ToastContainer />
      </div>
    </ToastProvider>
  );
};

export default AdminLayout;
