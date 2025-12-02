import React from 'react';
import { 
  LayoutDashboard, Users, Briefcase, DollarSign, Activity, LogOut, Calendar, MapPin, Zap
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

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  return (
    <aside className="w-20 md:w-64 h-screen fixed left-0 top-0 z-[9999] flex flex-col bg-slate-900/80 backdrop-blur-xl border-r border-white/5 shadow-2xl transition-all duration-300">
      
      {/* Header Logo */}
      <div className="h-24 flex items-center justify-center md:justify-start md:px-6 border-b border-white/5">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pastel-pink to-purple-600 flex items-center justify-center shadow-lg shadow-pastel-pink/20">
             <Zap className="text-white fill-current" size={20} />
        </div>
        <div className="ml-3 hidden md:block">
            <h1 className="font-tech font-bold text-xl text-white tracking-wider">PRIVILEGE</h1>
            <span className="text-[10px] font-bold text-pastel-blue tracking-[0.3em] uppercase glow-text">NEON SYSTEM</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-3 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onChangeView(item.id)}
            className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${
              currentView === item.id 
                ? 'bg-white/5 text-white shadow-[0_0_15px_rgba(249,168,212,0.3)] border border-pastel-pink/30' 
                : 'text-pastel-gray hover:text-white hover:bg-white/5'
            }`}
          >
            {currentView === item.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-pastel-pink shadow-[0_0_10px_#f9a8d4]"></div>
            )}
            
            <item.icon 
                size={20} 
                className={`transition-all duration-300 ${
                    currentView === item.id ? 'text-pastel-pink drop-shadow-[0_0_5px_rgba(249,168,212,0.8)]' : 'group-hover:text-pastel-blue'
                }`} 
            />
            <span className="ml-3 text-sm font-medium hidden md:block tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-pastel-blue/30 transition-colors cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 group-hover:border-pastel-blue/50">
                <img src="https://ui-avatars.com/api/?name=Admin&background=0f172a&color=a5f3fc" className="rounded-full opacity-80" alt="Admin" />
            </div>
            <div className="hidden md:block overflow-hidden">
                <p className="text-sm font-bold text-white group-hover:text-pastel-blue transition-colors">Administrador</p>
                <p className="text-xs text-slate-500">Online</p>
            </div>
            <button className="ml-auto text-slate-500 hover:text-rose-400 transition-colors">
                <LogOut size={18} />
            </button>
        </div>
      </div>
    </aside>
  );
};