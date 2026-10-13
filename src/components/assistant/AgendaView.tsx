import React from 'react';
import { Calendar as CalendarIcon, Clock, User, CheckCircle, AlertCircle } from 'lucide-react';

export const AgendaView: React.FC = () => {
  const events = [
    {
      time: '08:00 - 20:00',
      patient: 'Maria Silva',
      professional: 'Enf. Carla Diaz',
      type: 'Plantão 12h (Dia)',
      status: 'Em Andamento',
    },
    {
      time: '14:00 - 15:00',
      patient: 'Maria Silva',
      professional: 'Flavio (Admin)',
      type: 'Alinhamento com Responsável Financeiro',
      status: 'Agendado',
    },
    {
      time: '20:00 - 08:00',
      patient: 'Antonio Santos',
      professional: 'Téc. Bruno Souza',
      type: 'Plantão 12h (Noite)',
      status: 'Confirmado',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-tech">AGENDA & ESCALAS</h1>
        <p className="text-slate-400 text-sm">
          Visão consolidada de compromissos, visitas e plantões agendados.
        </p>
      </div>

      <div className="neon-card p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-pastel-blue font-semibold">
            <CalendarIcon className="w-5 h-5" />
            <span>Hoje, {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </div>
          <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full">
            3 compromissos ativos
          </span>
        </div>

        <div className="space-y-3">
          {events.map((evt, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pastel-pink/10 border border-pastel-pink/30 flex items-center justify-center text-pastel-pink font-semibold text-xs">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{evt.patient}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <User className="w-3 h-3 text-slate-500" />
                    {evt.professional} • <span className="text-pastel-blue">{evt.type}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 text-xs">
                <span className="text-slate-300 font-mono">{evt.time}</span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {evt.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
