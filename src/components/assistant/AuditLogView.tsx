import React from 'react';
import { ShieldCheck, History, User } from 'lucide-react';

export interface AuditItem {
  id: string;
  user: string;
  action: string;
  entityType: string;
  timestamp: string;
}

interface AuditLogViewProps {
  logs: AuditItem[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white font-tech">TRILHA DE AUDITORIA</h1>
        <p className="text-slate-400 text-sm">
          Histórico imutável de ações importantes registradas pelos administradores.
        </p>
      </div>

      <div className="neon-card p-6 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>RLS ativo • Nenhum registro crítico é removido sem rastreabilidade</span>
        </div>

        <div className="space-y-2.5">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-slate-200 font-medium">{log.action}</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Autor: <span className="text-pastel-pink">{log.user}</span> • Entidade: <span className="font-mono text-slate-400">{log.entityType}</span>
                  </p>
                </div>
              </div>
              <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">
                {log.timestamp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
