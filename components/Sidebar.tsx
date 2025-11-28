
import React from 'react';
import { 
  LayoutDashboard, Users, Briefcase, DollarSign, Activity, LogOut, Moon, Sun, Calendar, MapPin
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const menuItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'patients', icon: Users, label: 'Pacientes' },
  { id: 'employees', icon: Briefcase, label: 'Colaboradores' },
  { id: 'shifts', icon: Calendar, label: 'Escalas' },
  { id: 'timecard', icon: MapPin, label: 'Cartão Ponto' },
  { id: 'finance', icon: DollarSign, label: 'Financeiro' },
  { id: 'monitoring', icon: Activity, label: 'Acompanhamento' },
];

const NeonHeartLogo = () => (
  <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    {/* Blue Outer/Left Line */}
    <path 
      d="M50 85 C20 60 5 45 5 25 C5 10 20 5 35 15 L50 25" 
      stroke="#22d3ee" 
      strokeWidth="4" 
      strokeLinecap="round"
      filter="url(#glow)"
      opacity="0.9"
    />
    <path 
      d="M50 85 C80 60 95 45 95 25 C95 10 80 5 65 15 L50 25" 
      stroke="#f472b6" 
      strokeWidth="4" 
      strokeLinecap="round"
      filter="url(#glow)"
      opacity="0.9"
    />
     {/* Inner Details to mimic double line */}
    <path 
      d="M50 85 C25 64 12 50 12 25 C12 15 22 12 32 18 L45 27" 
      stroke="#bae6fd" 
      strokeWidth="1" 
      strokeLinecap="round"
      opacity="0.6"
    />
     <path 
      d="M50 85 C75 64 88 50 88 25 C88 15 78 12 68 18 L55 27" 
      stroke="#fbcfe8" 
      strokeWidth="1" 
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView, isDarkMode, onToggleTheme }) => {
  return (
    <aside className="w-20 md:w-64 h-screen fixed left-0 top-0 z-[9999] flex flex-col border-r border-white/5 bg-slate-900/90 backdrop-blur-xl transition-all duration-300 shadow-2xl shadow-black/50">
      <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-white/5 bg-slate-900/50">
        <div className="flex-shrink-0 hover:scale-105 transition-transform duration-500">
           <NeonHeartLogo />
        </div>
        <div className="ml-3 font-tech font-bold text-white tracking-wider hidden md:block leading-tight">
            <span className="block text-lg">PRIVILEGE</span>
            <span className="text-cyan-400 text-xl">CARE</span>
        </div>
      </div>

      <nav className="flex-1 py-8 space-y-2 px-2 md:px-4 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center p-3 rounded-xl transition-all duration-300 group relative overflow-hidden cursor-pointer ${
              currentView === item.id 
                ? 'bg-cyan-500/10 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)] border border-cyan-500/20' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            style={{ zIndex: 10000 }} /* Ensure individual buttons are clickable */
          >
            {currentView === item.id && (
                <div className="absolute left-0 top-0 w-1 h-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]"></div>
            )}
            <item.icon 
                size={22} 
                className={`transition-transform duration-300 relative z-10 ${currentView === item.id ? 'scale-110 drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]' : 'group-hover:scale-105'}`} 
            />
            <span className="ml-3 font-medium hidden md:block tracking-wide relative z-10">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-2 bg-slate-900/50">
        <button 
            onClick={onToggleTheme}
            className="w-full flex items-center p-3 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
            {isDarkMode ? <Sun size={20} className="text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.5)]" /> : <Moon size={20} />}
            <span className="ml-3 font-medium hidden md:block">Modo Luz</span>
        </button>

        <button className="w-full flex items-center p-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer">
          <LogOut size={20} />
          <span className="ml-3 font-medium hidden md:block">Sair</span>
        </button>
      </div>
    </aside>
  );
};