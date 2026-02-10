
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Menu, 
  Search, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings 
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { cn } from '../../utils/cn';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const currentSection = pathSegments[1] || 'Dashboard';
  const { signOut, user } = useAuthStore();
  
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Mock Notifications
  const notifications = [
    { id: 1, title: 'Nouvelle réservation', time: 'Il y a 5 min', isRead: false },
    { id: 2, title: 'Commande #1234 payée', time: 'Il y a 15 min', isRead: false },
    { id: 3, title: 'Stock faible : Foie Gras', time: 'Il y a 1h', isRead: true },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
      
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="hidden md:flex items-center text-sm text-slate-500">
          <span className="hover:text-slate-800 transition-colors cursor-pointer">Admin</span>
          <span className="mx-2 text-slate-300">/</span>
          <span className="font-medium text-slate-800 capitalize">{currentSection.replace('-', ' ')}</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        
        {/* Search Bar (Hidden mobile) */}
        <div className="hidden md:flex items-center relative">
           <Search size={16} className="absolute left-3 text-slate-400" />
           <input 
             type="text" 
             placeholder="Rechercher..." 
             className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-64 transition-all"
           />
        </div>

        <div className="h-8 w-px bg-slate-200 mx-2 hidden md:block"></div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            onBlur={() => setTimeout(() => setIsNotifOpen(false), 200)}
            className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-full transition-colors group"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white transform scale-100 group-hover:scale-110 transition-transform"></span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-2 border-b border-slate-50 flex justify-between items-center">
                <span className="font-bold text-sm text-slate-700">Notifications</span>
                <span className="text-xs text-primary cursor-pointer hover:underline">Tout marquer comme lu</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map(notif => (
                  <div key={notif.id} className={cn("px-4 py-3 hover:bg-slate-50 cursor-pointer flex items-start gap-3", !notif.isRead && "bg-blue-50/30")}>
                    <div className={cn("w-2 h-2 rounded-full mt-1.5 shrink-0", notif.isRead ? "bg-slate-200" : "bg-primary")}></div>
                    <div>
                      <p className={cn("text-sm text-slate-700", !notif.isRead && "font-semibold")}>{notif.title}</p>
                      <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-50 text-center">
                <span className="text-xs font-bold text-slate-500 cursor-pointer hover:text-primary">Voir toutes les notifications</span>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative">
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            onBlur={() => setTimeout(() => setIsUserMenuOpen(false), 200)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
          >
             <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase">
                {user?.email?.[0] || 'A'}
             </div>
             <ChevronDown size={14} className="text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 animate-in fade-in zoom-in-95 duration-200">
              <div className="px-4 py-3 border-b border-slate-50">
                <p className="text-sm font-bold text-slate-800 truncate">Admin</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary flex items-center gap-2">
                <User size={16} /> Mon Profil
              </button>
              <button 
                onClick={() => navigate('/admin/settings')}
                className="w-full text-left px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-primary flex items-center gap-2"
              >
                <Settings size={16} /> Paramètres
              </button>
              <div className="h-px bg-slate-50 my-1"></div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut size={16} /> Déconnexion
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default AdminHeader;
