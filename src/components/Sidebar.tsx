import React from 'react';
import { 
  Bot,
  Calendar,
  Users,
  MoreHorizontal,
  LayoutDashboard,
  CheckSquare,
  Shield,
  UserCheck,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  currentView: string;
  onChangeView: (view: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

// Navegação Principal solicitada: Início (Assistente), Agenda, Pessoas, Mais
const mainNavItems = [
  { id: 'assistant', icon: Bot, label: 'Início (Assistente)' },
  { id: 'agenda', icon: Calendar, label: 'Agenda' },
  { id: 'people', icon: Users, label: 'Pessoas' },
  { id: 'tasks', icon: CheckSquare, label: 'Tarefas' },
  { id: 'more', icon: MoreHorizontal, label: 'Mais' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const { user, loginAs } = useAuth();

  return (
    <aside className="w-20 md:w-64 h-screen fixed left-0 top-0 z-[9999] flex flex-col bg-slate-900/90 backdrop-blur-xl border-r border-white/5 shadow-2xl transition-all duration-300">
      
      {/* Header Logo */}
      <div className="h-20 flex items-center justify-center md:justify-start md:px-6 border-b border-white/5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pastel-pink to-pink-600 flex items-center justify-center shadow-lg shadow-pastel-pink/20">
          <Zap className="text-white fill-current" size={20} />
        </div>
        <div className="ml-3 hidden md:block">
          <h1 className="font-tech font-bold text-lg text-white tracking-wider leading-none">
            ASSISTENTE
          </h1>
          <span className="text-[10px] font-bold text-pastel-pink tracking-[0.25em] uppercase glow-text">
            PRIVILEGE CARE
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        <div className="hidden md:block px-3 pb-2 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
          Navegação Principal
        </div>
        {mainNavItems.map((item) => {
          const isActive =
            currentView === item.id ||
            (item.id === 'people' && (currentView === 'patients' || currentView === 'employees'));
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(249,168,212,0.25)] border border-pastel-pink/40' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-pastel-pink shadow-[0_0_10px_#f9a8d4]"></div>
              )}
              
              <item.icon 
                size={20} 
                className={`transition-all duration-200 ${
                  isActive ? 'text-pastel-pink drop-shadow-[0_0_5px_rgba(249,168,212,0.8)]' : 'group-hover:text-pastel-blue'
                }`} 
              />
              <span className="ml-3 text-sm font-medium hidden md:block tracking-wide">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Seletor Rápido de Usuário Autenticado (Dois Sócios) */}
      <div className="p-3 border-t border-white/5">
        <div className="p-3 rounded-xl bg-slate-950/60 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider hidden md:block">
              Usuário Autenticado
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
              RLS ON
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-pastel-pink/40 flex items-center justify-center text-xs font-bold text-pastel-pink">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="hidden md:block overflow-hidden flex-1">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Alternância entre os dois sócios para testes/uso */}
          <div className="mt-2.5 hidden md:flex gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => loginAs('admin')}
              className={`flex-1 py-1 rounded transition-colors ${
                user?.role === 'admin'
                  ? 'bg-pastel-pink text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Flavio
            </button>
            <button
              type="button"
              onClick={() => loginAs('partner')}
              className={`flex-1 py-1 rounded transition-colors ${
                user?.role === 'partner'
                  ? 'bg-pastel-pink text-slate-950 font-bold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Sócia
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
