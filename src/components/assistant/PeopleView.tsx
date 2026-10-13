import React, { useState } from 'react';
import { Users, Briefcase, Plus, Phone, MapPin, DollarSign, Heart } from 'lucide-react';
import { Patient, Employee } from '../../types';

interface PeopleViewProps {
  patients: Patient[];
  employees: Employee[];
  onNavigateToPatients: () => void;
  onNavigateToEmployees: () => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  patients,
  employees,
  onNavigateToPatients,
  onNavigateToEmployees,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'patients' | 'professionals'>('all');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-tech">PESSOAS</h1>
          <p className="text-slate-400 text-sm">
            Gestão unificada de Pacientes (Home Care) e Profissionais de Saúde.
          </p>
        </div>

        {/* Alternador de abas */}
        <div className="inline-flex rounded-xl bg-slate-900 border border-slate-800 p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'all' ? 'bg-pastel-pink text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({patients.length + employees.length})
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'patients' ? 'bg-pastel-pink text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pacientes ({patients.length})
          </button>
          <button
            onClick={() => setActiveTab('professionals')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'professionals' ? 'bg-pastel-pink text-slate-950' : 'text-slate-400 hover:text-white'
            }`}
          >
            Profissionais ({employees.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bloco Pacientes */}
        {(activeTab === 'all' || activeTab === 'patients') && (
          <div className="neon-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-pastel-pink uppercase tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Pacientes Ativos
              </h3>
              <button
                onClick={onNavigateToPatients}
                className="text-xs text-pastel-blue hover:underline"
              >
                Gerenciamento Completo →
              </button>
            </div>

            <div className="space-y-2.5">
              {patients.map((p) => (
                <div
                  key={p.id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-white">{p.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {p.address} • Resp: {p.financialResponsible}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bloco Profissionais */}
        {(activeTab === 'all' || activeTab === 'professionals') && (
          <div className="neon-card p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-pastel-blue uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Equipe de Saúde
              </h3>
              <button
                onClick={onNavigateToEmployees}
                className="text-xs text-pastel-blue hover:underline"
              >
                Gerenciamento Completo →
              </button>
            </div>

            <div className="space-y-2.5">
              {employees.map((e) => (
                <div
                  key={e.id}
                  className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-semibold text-white">{e.name}</h4>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-500" />
                      {e.phone} • Chave PIX: {e.pixKey}
                    </p>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                    {e.role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
