import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Users, FileText, DollarSign, AlertCircle, TrendingUp, Search, Bell, Save, Loader2, CheckCircle, Calendar, ArrowRight } from 'lucide-react';
import { Patient, Contract, FinanceRecord, PaymentStatus, PaymentType, ContractStatus } from '../types';

interface DashboardProps {
  patients: Patient[];
  contracts: Contract[];
  finance: FinanceRecord[];
  onAddFinanceRecord: (record: FinanceRecord) => void;
}

// Pastel Palette for Charts
const COLORS = ['#f9a8d4', '#a5f3fc', '#94a3b8', '#cbd5e1']; // Pink, Blue, Gray, Light Gray

export const Dashboard: React.FC<DashboardProps> = ({ patients, contracts, finance, onAddFinanceRecord }) => {
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

  // --- Quick Save State ---
  const [quickForm, setQuickForm] = useState({
    description: '',
    amount: '',
    type: PaymentType.INCOME,
    date: new Date().toISOString().slice(0, 10)
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // --- Handlers ---
  const handleQuickSave = async () => {
    // Validate
    if (!quickForm.description || !quickForm.amount || Number(quickForm.amount) <= 0) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
        return;
    }

    setSaveStatus('loading');

    // Simulate Network Delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const newRecord: FinanceRecord = {
        id: Math.random().toString(36).substr(2, 9),
        description: quickForm.description,
        type: quickForm.type,
        amount: Number(quickForm.amount),
        date: quickForm.date,
        status: PaymentStatus.PENDING // Default status for quick add
    };

    onAddFinanceRecord(newRecord);
    setSaveStatus('success');

    // Reset Form
    setQuickForm(prev => ({ 
        ...prev, 
        description: '', 
        amount: '' 
    }));

    setTimeout(() => setSaveStatus('idle'), 3000);
  };

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
        <div className="bg-slate-900/90 border border-pastel-blue/30 p-4 rounded-xl shadow-[0_0_15px_rgba(165,243,252,0.2)] backdrop-blur-md">
          <p className="text-pastel-gray font-medium text-xs uppercase tracking-wider mb-1">{label}</p>
          <p className="text-pastel-blue font-mono font-bold text-lg">
            {payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-tech font-bold text-white tracking-wide drop-shadow-lg">Dashboard</h2>
            <p className="text-pastel-gray mt-1 flex items-center gap-2 text-sm">
                Visão geral do sistema
            </p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative hidden md:block group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pastel-pink transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar dados..." 
                    className="pl-10 pr-4 py-2.5 bg-slate-900/50 border border-white/10 rounded-full text-sm focus:outline-none focus:border-pastel-pink focus:shadow-[0_0_10px_rgba(249,168,212,0.3)] w-64 transition-all text-white placeholder-slate-600"
                />
             </div>
             <button className="relative p-2.5 bg-slate-900/50 rounded-full border border-white/10 text-slate-400 hover:text-pastel-blue hover:border-pastel-blue hover:shadow-[0_0_10px_rgba(165,243,252,0.3)] transition-all">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-3 h-3 bg-pastel-pink rounded-full shadow-[0_0_5px_#f9a8d4]"></span>
             </button>
          </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Users, label: 'Pacientes Ativos', value: activePatients, subtext: 'Base Atual', color: 'text-pastel-blue' },
          { icon: FileText, label: 'Contratos (Mensal)', value: activeContractsVal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), subtext: 'Receita Recorrente', color: 'text-pastel-pink' },
          { icon: TrendingUp, label: 'Receita Realizada', value: revenueMonth.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }), subtext: 'Confirmado', color: 'text-emerald-300' },
          { icon: AlertCircle, label: 'Pendências', value: pendingPayments, subtext: 'Atenção Necessária', color: 'text-rose-300' },
        ].map((kpi, idx) => (
            <div key={idx} className="neon-card p-6 rounded-2xl relative overflow-hidden group cursor-default">
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${kpi.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <kpi.icon size={24} />
                    </div>
                </div>
                <div className="relative z-10">
                    <h3 className="text-3xl font-mono font-bold text-white mb-1 group-hover:text-shadow-glow transition-all">{kpi.value}</h3>
                    <p className="text-xs font-bold text-pastel-gray uppercase tracking-widest group-hover:text-white transition-colors">{kpi.label}</p>
                    <p className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${kpi.color.replace('text-', 'bg-')} shadow-[0_0_5px_currentColor]`}></span>
                        {kpi.subtext}
                    </p>
                </div>
                {/* Background Glow on Hover */}
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-pastel-pink/10 transition-all duration-500"></div>
            </div>
        ))}
      </div>

      {/* --- QUICK ADD TRANSACTION CARD --- */}
      <div className="neon-card p-1 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-white/10 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl rounded-2xl m-[1px]"></div>
        <div className="relative z-10 p-6">
            <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <div className="p-2 bg-pastel-pink/10 rounded-lg text-pastel-pink border border-pastel-pink/20">
                         <Save size={18} />
                    </div>
                    Novo Lançamento Rápido
                 </h3>
                 {saveStatus === 'success' && (
                    <span className="text-emerald-400 text-sm font-medium flex items-center gap-1 animate-fade-in">
                        <CheckCircle size={14} /> Salvo com sucesso!
                    </span>
                 )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Description */}
                <div className="md:col-span-4">
                     <div className="relative group">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pastel-blue transition-colors" size={16} />
                        <input 
                            type="text" 
                            placeholder="Descrição (ex: Pagamento X)" 
                            className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-pastel-blue focus:ring-1 focus:ring-pastel-blue focus:shadow-[0_0_10px_rgba(165,243,252,0.2)] outline-none transition-all placeholder-slate-600"
                            value={quickForm.description}
                            onChange={(e) => setQuickForm({...quickForm, description: e.target.value})}
                        />
                     </div>
                </div>

                {/* Amount */}
                <div className="md:col-span-2">
                    <div className="relative group">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pastel-blue transition-colors" size={16} />
                        <input 
                            type="number" 
                            placeholder="Valor" 
                            className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-pastel-blue focus:ring-1 focus:ring-pastel-blue outline-none transition-all placeholder-slate-600"
                            value={quickForm.amount}
                            onChange={(e) => setQuickForm({...quickForm, amount: e.target.value})}
                        />
                    </div>
                </div>

                {/* Date */}
                <div className="md:col-span-2">
                    <div className="relative group">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-pastel-blue transition-colors" size={16} />
                        <input 
                            type="date" 
                            className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white text-sm focus:border-pastel-blue focus:ring-1 focus:ring-pastel-blue outline-none transition-all"
                            value={quickForm.date}
                            onChange={(e) => setQuickForm({...quickForm, date: e.target.value})}
                        />
                    </div>
                </div>

                {/* Type */}
                <div className="md:col-span-2">
                    <select 
                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:border-pastel-blue focus:ring-1 focus:ring-pastel-blue outline-none transition-all cursor-pointer"
                        value={quickForm.type}
                        onChange={(e) => setQuickForm({...quickForm, type: e.target.value as PaymentType})}
                    >
                        <option value={PaymentType.INCOME}>Receita</option>
                        <option value={PaymentType.EXPENSE_PAYROLL}>Despesa (Folha)</option>
                        <option value={PaymentType.EXPENSE_EXTRA}>Despesa (Extra)</option>
                    </select>
                </div>

                {/* Button */}
                <div className="md:col-span-2">
                    <button 
                        onClick={handleQuickSave}
                        disabled={saveStatus === 'loading'}
                        className={`w-full h-[46px] rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                            saveStatus === 'loading'
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : 'bg-pastel-pink text-slate-900 hover:bg-pink-300 hover:shadow-[0_0_15px_rgba(249,168,212,0.4)] hover:scale-[1.02]'
                        }`}
                    >
                        {saveStatus === 'loading' ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                <Save size={18} /> 
                                <span className="uppercase tracking-wide text-xs">Salvar</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
            
            {/* Validation Error Message */}
            {saveStatus === 'error' && (
                <div className="absolute bottom-2 left-6 text-rose-400 text-xs flex items-center gap-1 animate-fade-in">
                    <AlertCircle size={12} /> Preencha a descrição e o valor.
                </div>
            )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 neon-card p-8 rounded-2xl">
          <div className="flex justify-between items-center mb-8">
            <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <DollarSign className="text-pastel-blue" size={20}/> Fluxo de Caixa
                </h3>
            </div>
            <button className="text-xs text-pastel-blue hover:text-white flex items-center gap-1 transition-colors">
                Ver Detalhes <ArrowRight size={12}/>
            </button>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueVsExpenseData} barSize={50}>
                <defs>
                    <linearGradient id="colorPink" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f9a8d4" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#ec4899" stopOpacity={0.4}/>
                    </linearGradient>
                    <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a5f3fc" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" tick={{fontSize: 12}} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val/1000}k`} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} content={<CustomTooltip />} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {revenueVsExpenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? 'url(#colorBlue)' : 'url(#colorPink)'} strokeWidth={0} />
                    ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="neon-card p-8 rounded-2xl flex flex-col">
          <h3 className="text-xl font-bold text-white mb-2">Contratos</h3>
          <p className="text-sm text-pastel-gray mb-8">Distribuição da carteira</p>
          
          <div className="flex-1 relative min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contractStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {contractStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', borderRadius: '8px' }} />
                <Legend 
                    verticalAlign="bottom" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-slate-400 text-sm font-medium ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-6 text-center pointer-events-none">
                <span className="text-4xl font-mono font-bold text-white block drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">{contracts.length}</span>
                <span className="text-xs font-bold text-pastel-pink uppercase tracking-widest">Total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};