import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { Users, FileText, DollarSign, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import { Patient, Contract, FinanceRecord, PaymentStatus, PaymentType, ContractStatus } from '../types';

interface DashboardProps {
  patients: Patient[];
  contracts: Contract[];
  finance: FinanceRecord[];
}

// Cyberpunk Neon Palette
const COLORS = ['#06b6d4', '#8b5cf6', '#f472b6', '#10b981'];

export const Dashboard: React.FC<DashboardProps> = ({ patients, contracts, finance }) => {
  // KPI Calculations
  const activePatients = patients.filter(p => p.status === 'Ativo').length;
  const activeContractsVal = contracts
    .filter(c => c.status === ContractStatus.ACTIVE)
    .reduce((acc, curr) => acc + curr.value, 0);
  
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const revenueMonth = finance
    .filter(f => f.date.startsWith(currentMonth) && f.type === PaymentType.INCOME && f.status === PaymentStatus.PAID)
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const pendingPayments = finance.filter(f => f.status === PaymentStatus.PENDING || f.status === PaymentStatus.LATE).length;

  // Chart Data Preparation
  const revenueVsExpenseData = [
    {
      name: 'Receitas',
      amount: finance.filter(f => f.type === PaymentType.INCOME).reduce((acc, curr) => acc + curr.amount, 0)
    },
    {
      name: 'Despesas',
      amount: finance.filter(f => f.type !== PaymentType.INCOME).reduce((acc, curr) => acc + curr.amount, 0)
    }
  ];

  const contractStatusData = [
    { name: 'Ativos', value: contracts.filter(c => c.status === ContractStatus.ACTIVE).length },
    { name: 'Pendentes', value: contracts.filter(c => c.status === ContractStatus.PENDING).length },
    { name: 'Suspensos', value: contracts.filter(c => c.status === ContractStatus.SUSPENDED).length },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-cyan-500/30 p-3 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.2)] backdrop-blur-md">
          <p className="text-cyan-100 font-bold mb-1">{label}</p>
          <p className="text-white text-sm">
            {payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
          <h2 className="text-3xl font-tech font-bold text-white tracking-wide flex items-center gap-2">
            <Zap className="text-cyan-400 fill-current" />
            VISÃO GERAL
          </h2>
          <div className="text-sm text-slate-400 font-mono">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Users, label: 'Pacientes Ativos', value: activePatients, color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', shadow: 'shadow-neon-blue' },
          { icon: FileText, label: 'Contratos (Mensal)', value: activeContractsVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/30', shadow: 'shadow-neon-purple' },
          { icon: TrendingUp, label: 'Receita Realizada', value: revenueMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', shadow: '' },
          { icon: AlertCircle, label: 'Pendências Fin.', value: pendingPayments, color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', shadow: '' },
        ].map((kpi, idx) => (
            <div key={idx} className={`glass-card p-6 rounded-2xl border ${kpi.border} relative overflow-hidden group hover:bg-white/5 transition-all duration-300`}>
                <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${kpi.bg} blur-2xl opacity-50 group-hover:opacity-100 transition-opacity`}></div>
                <div className="flex items-center relative z-10">
                    <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color} mr-4 ${kpi.shadow}`}>
                        <kpi.icon size={28} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold">{kpi.label}</p>
                        <h3 className="text-2xl font-tech font-bold text-white mt-1">{kpi.value}</h3>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-tech font-bold mb-6 text-white flex items-center gap-2">
            <DollarSign className="text-cyan-400" size={18} /> FLUXO DE CAIXA
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueVsExpenseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} barSize={60}>
                    {revenueVsExpenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#06b6d4' : '#f472b6'} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl">
          <h3 className="text-lg font-tech font-bold mb-6 text-white flex items-center gap-2">
            <FileText className="text-violet-400" size={18} /> STATUS CONTRATOS
          </h3>
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contractStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {contractStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                <Legend 
                    wrapperStyle={{ paddingTop: '20px' }} 
                    formatter={(value) => <span className="text-slate-300 ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-8 text-center pointer-events-none">
                <span className="text-3xl font-tech font-bold text-white">{contracts.length}</span>
                <p className="text-xs text-slate-400 uppercase">Total</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};