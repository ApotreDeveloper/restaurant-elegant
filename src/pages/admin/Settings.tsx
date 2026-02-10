
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Layout, 
  Info, 
  Sliders, 
  MapPin 
} from 'lucide-react';
import GeneralSettings from '../../components/admin/settings/GeneralSettings';
import NavigationSettings from '../../components/admin/settings/NavigationSettings';
import AboutSettings from '../../components/admin/settings/AboutSettings';
import { useRestaurantStore } from '../../stores/useRestaurantStore';
import { cn } from '../../utils/cn';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'general' | 'navigation' | 'about' | 'preferences'>('general');
  const { restaurantInfo, aboutPage, fetchRestaurantInfo, fetchAboutPage, isLoading } = useRestaurantStore();

  useEffect(() => {
    fetchRestaurantInfo();
    fetchAboutPage();
  }, []);

  const tabs = [
    { id: 'general', label: 'Général', icon: Sliders, description: 'Infos restaurant, horaires et contacts' },
    { id: 'navigation', label: 'Navigation', icon: Layout, description: 'Menu du site et liens' },
    { id: 'about', label: 'Page À Propos', icon: Info, description: 'Histoire, mission et équipe' },
    { id: 'preferences', label: 'Préférences', icon: SettingsIcon, description: 'Langue, devise et système' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings initialData={restaurantInfo} onRefresh={fetchRestaurantInfo} />;
      case 'navigation':
        return <NavigationSettings />;
      case 'about':
        return <AboutSettings initialData={aboutPage} onRefresh={fetchAboutPage} />;
      case 'preferences':
        return (
           <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-center">
              <SettingsIcon size={48} className="mx-auto text-slate-200 mb-4" />
              <h3 className="text-xl font-bold text-slate-700">Préférences Système</h3>
              <p className="text-slate-500 mt-2">Bientôt disponible : Gestion multi-langues, devises et thèmes.</p>
           </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="pb-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Paramètres</h2>
        <p className="text-slate-500 text-sm">Configurez les informations générales de votre établissement.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-72 shrink-0 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full text-left p-4 rounded-xl transition-all duration-300 flex items-start gap-4 border",
                activeTab === tab.id 
                  ? "bg-white border-primary shadow-md transform scale-105" 
                  : "bg-transparent border-transparent hover:bg-white hover:shadow-sm hover:border-slate-100 text-slate-500"
              )}
            >
              <div className={cn(
                 "p-2 rounded-lg shrink-0 transition-colors",
                 activeTab === tab.id ? "bg-primary text-secondary" : "bg-slate-100 text-slate-400"
              )}>
                 <tab.icon size={20} />
              </div>
              <div>
                 <span className={cn("block font-bold text-sm", activeTab === tab.id ? "text-slate-800" : "text-slate-600")}>
                    {tab.label}
                 </span>
                 <span className="text-xs text-slate-400 leading-tight block mt-1">
                    {tab.description}
                 </span>
              </div>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-grow min-w-0">
           {renderContent()}
        </div>

      </div>
    </div>
  );
};

export default Settings;
