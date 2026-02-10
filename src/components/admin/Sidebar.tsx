
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  ShoppingBag, 
  UtensilsCrossed, 
  Image, 
  FileText, 
  Star, 
  Settings, 
  LogOut,
  X,
  Store
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuthStore } from '../../stores/useAuthStore';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { signOut, user } = useAuthStore();

  const handleLogout = async () => {
    await signOut();
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: Home },
    { name: 'Réservations', path: '/admin/reservations', icon: Calendar },
    { name: 'Commandes', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Menu', path: '/admin/menu', icon: UtensilsCrossed },
    { name: 'Galerie', path: '/admin/gallery', icon: Image },
    { name: 'Blog', path: '/admin/blog', icon: FileText },
    { name: 'Avis', path: '/admin/reviews', icon: Star },
    { name: 'Paramètres', path: '/admin/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "fixed top-0 left-0 z-50 h-screen w-[260px] bg-[#1e293b] text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 bg-[#0f172a]">
          <div className="flex items-center gap-3">
            <div className="bg-primary p-1.5 rounded-lg">
              <Store className="w-5 h-5 text-[#0f172a]" />
            </div>
            <div>
              <h1 className="font-bold text-white leading-none">Le Gourmet</h1>
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Admin</span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-grow py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => { if(window.innerWidth < 1024) onClose() }}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                isActive 
                  ? "bg-primary text-[#0f172a] shadow-lg shadow-primary/20" 
                  : "hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon size={20} className={cn("shrink-0", ({isActive}: any) => isActive ? "text-[#0f172a]" : "text-slate-400 group-hover:text-white")} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-700/50 bg-[#0f172a]">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm">
                {user?.email?.[0].toUpperCase() || 'A'}
             </div>
             <div className="overflow-hidden">
                <p className="text-sm font-bold text-white truncate">Admin</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
             </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-300 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors border border-slate-700 hover:border-red-500/30"
          >
            <LogOut size={14} /> Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
