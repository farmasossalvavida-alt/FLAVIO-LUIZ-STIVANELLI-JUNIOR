import React from 'react';
import { Database, Shield, Bot, HardDrive, DollarSign, Users, Clock, FileText } from 'lucide-react';

interface MoreViewProps {
  onNavigate: (view: string) => void;
}

export const MoreView: React.FC<MoreViewProps> = ({ onNavigate }) => {
  const sections = [
    {
      id: 'finance',
      title: 'Financeiro & Pagamentos',
      desc: 'Extratos, pagamentos previstos e recebíveis da operação',
      icon: DollarSign,
      color: 'text-emerald-400',
    },
    {
      id: 'shifts',
      title: 'Plantões & Coberturas',
      desc: 'Histórico de plantões realizados e substituições',
      icon: Clock,
      color: 'text-pastel-pink',
    },
    {
      id: 'audit',
      title: 'Auditoria & Logs',
      desc: 'Rastreamento detalhado de alterações do sistema',
      icon: Shield,
      color: 'text-pastel-blue',
    },
    {
      id: 'monitoring',
      title: 'Acompanhamento Mensal',
      desc: 'Horas trabalhadas e ocorrências contratuais',
      icon: FileText,
      color: 'text-indigo-400',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-tech">MAIS OPÇÕES</h1>
        <p className="text-slate-400 text-sm">
          Módulos operacionais e arquitetura técnica preparada para expansão.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.id}
              onClick={() => onNavigate(s.id)}
              className="neon-card p-5 rounded-2xl border border-slate-800 cursor-pointer hover:border-pastel-pink/50 group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-slate-900 border border-slate-800 ${s.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-semibold group-hover:text-pastel-pink transition-colors">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* STATUS DA ARQUITETURA TÉCNICA */}
      <div className="neon-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Database className="w-4 h-4 text-pastel-blue" />
          Status da Fundação Técnica & Supabase
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block mb-1">10 Tabelas PostgreSQL</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              ✓ Migração SQL Pronta
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block mb-1">Row Level Security</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              ✓ RLS & Triggers Ativos
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block mb-1">Camada de IA & Voz</span>
            <span className="text-pastel-pink font-semibold flex items-center gap-1">
              ✓ Intenções Estruturadas
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
