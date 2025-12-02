import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Filter, Plus, Edit, Trash2, Save, CheckCircle, AlertCircle, Loader2, DollarSign, Calendar, FileText, X, Upload, AlertTriangle } from 'lucide-react';
import { FinanceRecord, PaymentType, PaymentStatus } from '../types';

interface FinanceViewProps {
  records: FinanceRecord[];
  onAddRecord: (record: FinanceRecord) => void;
  onUpdateRecord: (record: FinanceRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ records, onAddRecord, onUpdateRecord, onDeleteRecord }) => {
  // --- States for Modal (Edit/Full Add) ---
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // --- States for Quick Add Card ---
  const [quickForm, setQuickForm] = useState({
    description: '',
    amount: '',
    type: PaymentType.INCOME,
    date: new Date().toISOString().slice(0, 10)
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // --- States for Modal Form ---
  const [formData, setFormData] = useState({
    description: '',
    type: PaymentType.INCOME,
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    status: PaymentStatus.PENDING,
    proofUrl: ''
  });

  // --- Handlers for Quick Add ---
  const handleQuickSave = async () => {
    // Validação
    if (!quickForm.description || !quickForm.amount || Number(quickForm.amount) <= 0) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
        return;
    }

    setSaveStatus('loading');

    // Simulação de delay de backend/API
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newRecord: FinanceRecord = {
        id: Math.random().toString(36).substr(2, 9),
        description: quickForm.description,
        type: quickForm.type,
        amount: Number(quickForm.amount),
        date: quickForm.date,
        status: PaymentStatus.PENDING // Quick adds default to Pending
    };

    onAddRecord(newRecord);
    setSaveStatus('success');
    
    // Reset form
    setQuickForm(prev => ({ 
        ...prev, 
        description: '', 
        amount: '' 
    }));

    setTimeout(() => setSaveStatus('idle'), 3000);
  };

  // --- Handlers for Modal ---
  const resetForm = () => {
    setFormData({
        description: '',
        type: PaymentType.INCOME,
        amount: 0,
        date: new Date().toISOString().slice(0, 10),
        status: PaymentStatus.PENDING,
        proofUrl: ''
    });
    setEditingRecord(null);
  };

  const handleEditClick = (record: FinanceRecord) => {
    setEditingRecord(record);
    setFormData({
        description: record.description,
        type: record.type,
        amount: record.amount,
        date: record.date,
        status: record.status,
        proofUrl: record.proofUrl || ''
    });
    setShowModal(true);
  };

  const handleSaveModal = () => {
    if (editingRecord) {
        const updated: FinanceRecord = {
            ...editingRecord,
            description: formData.description,
            type: formData.type,
            amount: formData.amount,
            date: formData.date,
            status: formData.status,
            proofUrl: formData.proofUrl
        };
        onUpdateRecord(updated);
    } else {
        const newRecord: FinanceRecord = {
            id: Math.random().toString(36).substr(2, 9),
            description: formData.description,
            type: formData.type,
            amount: formData.amount,
            date: formData.date,
            status: formData.status,
            proofUrl: formData.proofUrl
        };
        onAddRecord(newRecord);
    }
    setShowModal(false);
    resetForm();
  };

  const handleDeleteConfirm = () => {
      if (showDeleteConfirm) {
          onDeleteRecord(showDeleteConfirm);
          setShowDeleteConfirm(null);
      }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-tech font-bold text-white drop-shadow-lg">FINANCEIRO</h2>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-medium text-slate-300 hover:bg-white/10 hover:border-pastel-blue/30 transition-all">
                <Filter size={16} /> Filtros
            </button>
            <button 
                onClick={() => { resetForm(); setShowModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600/80 text-white border border-indigo-500 rounded-lg hover:bg-indigo-600 font-bold transition shadow-[0_0_15px_rgba(79,70,229,0.3)]"
            >
                <Plus size={18} /> Novo Detalhado
            </button>
        </div>
      </div>

      {/* --- QUICK ADD CARD --- */}
      <div className="neon-card p-6 rounded-2xl relative overflow-hidden group border border-pastel-blue/20">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-cyan-500/20 transition-all duration-700"></div>
        
        <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400 border border-cyan-500/30">
                    <Save size={20} />
                </div>
                Lançamento Rápido
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                {/* Description */}
                <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Descrição</label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="text"
                            placeholder="Ex: Pagamento Fornecedor X"
                            className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all"
                            value={quickForm.description}
                            onChange={(e) => setQuickForm({...quickForm, description: e.target.value})}
                        />
                    </div>
                </div>

                {/* Amount */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Valor</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="number"
                            placeholder="0,00"
                            className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all"
                            value={quickForm.amount}
                            onChange={(e) => setQuickForm({...quickForm, amount: e.target.value})}
                        />
                    </div>
                </div>

                {/* Type */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Tipo</label>
                    <select 
                        className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 px-3 text-white focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all appearance-none cursor-pointer"
                        value={quickForm.type}
                        onChange={(e) => setQuickForm({...quickForm, type: e.target.value as PaymentType})}
                    >
                        <option value={PaymentType.INCOME}>Receita</option>
                        <option value={PaymentType.EXPENSE_PAYROLL}>Despesa (Folha)</option>
                        <option value={PaymentType.EXPENSE_EXTRA}>Despesa (Extra)</option>
                    </select>
                </div>

                {/* Date */}
                <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Data</label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input 
                            type="date"
                            className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-3 pl-10 pr-2 text-white text-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all"
                            value={quickForm.date}
                            onChange={(e) => setQuickForm({...quickForm, date: e.target.value})}
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="md:col-span-2 mt-[26px]">
                    <button 
                        onClick={handleQuickSave}
                        disabled={saveStatus === 'loading'}
                        className={`w-full h-[46px] rounded-xl font-bold text-slate-900 flex items-center justify-center gap-2 transition-all shadow-lg ${
                            saveStatus === 'loading' 
                            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                            : saveStatus === 'success'
                            ? 'bg-emerald-400 hover:bg-emerald-300 shadow-emerald-400/30'
                            : 'bg-cyan-400 hover:bg-cyan-300 shadow-cyan-400/30 hover:scale-[1.02]'
                        }`}
                    >
                        {saveStatus === 'loading' ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : saveStatus === 'success' ? (
                            <><CheckCircle size={20} /> Salvo</>
                        ) : (
                            <><Save size={20} /> Salvar</>
                        )}
                    </button>
                </div>
            </div>

            {/* Visual Feedback Text */}
            <div className="h-6 mt-2">
                 {saveStatus === 'success' && (
                    <div className="text-emerald-400 text-sm flex items-center gap-1.5 font-medium animate-fade-in">
                        <CheckCircle size={14} /> Lançamento salvo com sucesso!
                    </div>
                 )}
                 {saveStatus === 'error' && (
                    <div className="text-rose-400 text-sm flex items-center gap-1.5 font-medium animate-fade-in">
                        <AlertCircle size={14} /> Preencha a descrição e o valor corretamente.
                    </div>
                 )}
            </div>
        </div>
      </div>

      {/* --- RECORDS TABLE --- */}
      <div className="neon-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-slate-400 text-sm uppercase">
              <tr>
                <th className="p-4">Data</th>
                <th className="p-4">Descrição</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Valor</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Docs</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300 text-sm">
              {records.map(record => (
                <tr key={record.id} className="hover:bg-white/5 transition group">
                  <td className="p-4 font-mono text-slate-400">{new Date(record.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4 font-medium text-white">{record.description}</td>
                  <td className="p-4">
                     <div className={`flex items-center gap-1 ${record.type === PaymentType.INCOME ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {record.type === PaymentType.INCOME ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        <span className="text-xs font-bold uppercase">{record.type === PaymentType.INCOME ? 'Entrada' : 'Saída'}</span>
                    </div>
                  </td>
                  <td className={`p-4 font-mono font-bold text-base ${record.type === PaymentType.INCOME ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {record.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-4">
                     <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border ${
                        record.status === PaymentStatus.PAID 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : record.status === PaymentStatus.LATE
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                        {record.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    {record.proofUrl ? <CheckCircle size={16} className="text-emerald-500 mx-auto"/> : <span className="text-slate-600">-</span>}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEditClick(record)} className="p-2 text-pastel-blue hover:bg-pastel-blue/10 rounded transition"><Edit size={16}/></button>
                        <button onClick={() => setShowDeleteConfirm(record.id)} className="p-2 text-rose-400 hover:bg-rose-400/10 rounded transition"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

       {/* --- DETAILED MODAL --- */}
       {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="neon-card bg-slate-900 rounded-xl w-full max-w-lg border border-white/10 overflow-hidden shadow-2xl">
                <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                    <h3 className="text-xl font-bold text-white font-tech">
                        {editingRecord ? 'Editar Movimentação' : 'Nova Movimentação'}
                    </h3>
                    <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Descrição</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                            placeholder="Ex: Mensalidade Paciente X"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Tipo</label>
                            <select 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value as any})}
                            >
                                <option value={PaymentType.INCOME}>Receita (Entrada)</option>
                                <option value={PaymentType.EXPENSE_PAYROLL}>Despesa (Folha)</option>
                                <option value={PaymentType.EXPENSE_EXTRA}>Despesa (Extra)</option>
                            </select>
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Valor (R$)</label>
                            <input 
                                type="number" 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                value={formData.amount}
                                onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                            />
                         </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Data</label>
                            <input 
                                type="date" 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Status</label>
                            <select 
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value as any})}
                            >
                                <option value={PaymentStatus.PENDING}>Pendente</option>
                                <option value={PaymentStatus.PAID}>Pago</option>
                                <option value={PaymentStatus.LATE}>Atrasado</option>
                            </select>
                        </div>
                    </div>

                    {/* Upload */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">Comprovante (PDF)</label>
                         <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/5 transition cursor-pointer relative group">
                            <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept=".pdf"
                                onChange={(e) => {
                                    if(e.target.files && e.target.files[0]) {
                                        setFormData({...formData, proofUrl: e.target.files[0].name});
                                    }
                                }}
                            />
                            <Upload size={20} className="text-slate-500 mb-2 group-hover:text-cyan-400 transition-colors"/>
                            {formData.proofUrl ? (
                                <span className="text-sm font-bold text-emerald-400 flex items-center gap-1">
                                    <CheckCircle size={14}/> {formData.proofUrl}
                                </span>
                            ) : (
                                <span className="text-sm text-slate-400">Clique para anexar arquivo</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                    <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-400 font-medium hover:text-white transition">Cancelar</button>
                    <button onClick={handleSaveModal} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20">
                        {editingRecord ? 'Salvar Alterações' : 'Adicionar'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="neon-card bg-slate-900 p-6 rounded-xl max-w-sm text-center shadow-2xl border border-white/10">
                <div className="w-12 h-12 bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                    <AlertTriangle size={24} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">Excluir Registro</h3>
                <p className="text-slate-400 mb-6">Tem certeza que deseja excluir esta movimentação financeira?</p>
                <div className="flex gap-4 justify-center">
                    <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-slate-400 hover:bg-white/5 rounded-lg transition font-medium">Cancelar</button>
                    <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-500 transition font-bold shadow-lg shadow-rose-500/20">Confirmar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};