import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Filter, Download, Plus, Edit, Trash2, X, Save, Upload, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { FinanceRecord, PaymentType, PaymentStatus } from '../types';

interface FinanceViewProps {
  records: FinanceRecord[];
  onAddRecord: (record: FinanceRecord) => void;
  onUpdateRecord: (record: FinanceRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const FinanceView: React.FC<FinanceViewProps> = ({ records, onAddRecord, onUpdateRecord, onDeleteRecord }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FinanceRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    description: '',
    type: PaymentType.INCOME,
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    status: PaymentStatus.PENDING,
    proofUrl: ''
  });

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

  const handleSave = () => {
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Gestão Financeira</h2>
        <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Filter size={16} /> Filtros
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <Download size={16} /> Exportar CSV
            </button>
            <button 
                onClick={() => { resetForm(); setShowModal(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-sm"
            >
                <Plus size={18} /> Nova Movimentação
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm">
              <tr>
                <th className="p-4 font-medium">Data</th>
                <th className="p-4 font-medium">Descrição</th>
                <th className="p-4 font-medium">Tipo</th>
                <th className="p-4 font-medium">Valor</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-center">Comprovante</th>
                <th className="p-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {records.map(record => (
                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="p-4 text-gray-600 dark:text-gray-400 text-sm">
                    {new Date(record.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-800 dark:text-gray-200 capitalize">{record.description}</div>
                  </td>
                  <td className="p-4">
                    <div className={`flex items-center gap-1 text-sm ${
                        record.type === PaymentType.INCOME ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                        {record.type === PaymentType.INCOME ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        {record.type === PaymentType.INCOME ? 'Entrada' : 'Saída'}
                    </div>
                  </td>
                  <td className="p-4 font-medium text-gray-800 dark:text-gray-200">
                    {record.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        record.status === PaymentStatus.PAID 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                        : record.status === PaymentStatus.LATE
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                    }`}>
                        {record.status}
                    </span>
                  </td>
                   <td className="p-4 text-center">
                    {record.proofUrl ? (
                         <div className="flex justify-center text-green-500" title={record.proofUrl}><CheckCircle size={18} /></div>
                    ) : <span className="text-gray-300 dark:text-gray-600">-</span>}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEditClick(record)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition"><Edit size={16}/></button>
                        <button onClick={() => setShowDeleteConfirm(record.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal - Light Theme Forced */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                    <h3 className="text-xl font-bold text-gray-800">
                        {editingRecord ? 'Editar Movimentação' : 'Nova Movimentação'}
                    </h3>
                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                        <input 
                            type="text" 
                            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: Mensalidade Paciente X"
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                            <select 
                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 outline-none"
                                value={formData.type}
                                onChange={e => setFormData({...formData, type: e.target.value as any})}
                            >
                                <option value={PaymentType.INCOME}>Receita (Entrada)</option>
                                <option value={PaymentType.EXPENSE_PAYROLL}>Despesa (Folha)</option>
                                <option value={PaymentType.EXPENSE_EXTRA}>Despesa (Extra)</option>
                            </select>
                         </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor (R$)</label>
                            <input 
                                type="number" 
                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.amount}
                                onChange={e => setFormData({...formData, amount: Number(e.target.value)})}
                            />
                         </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                            <input 
                                type="date" 
                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                                value={formData.date}
                                onChange={e => setFormData({...formData, date: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select 
                                className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 outline-none"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value as any})}
                            >
                                <option value={PaymentStatus.PENDING}>Pendente</option>
                                <option value={PaymentStatus.PAID}>Pago</option>
                                <option value={PaymentStatus.LATE}>Atrasado</option>
                            </select>
                        </div>
                    </div>

                    {/* Upload de Comprovante */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comprovante (PDF)</label>
                         <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer relative group">
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
                            <Upload size={20} className="text-gray-400 mb-2 group-hover:text-blue-500 transition-colors"/>
                            {formData.proofUrl ? (
                                <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                                    <CheckCircle size={14}/> {formData.proofUrl}
                                </span>
                            ) : (
                                <span className="text-sm text-gray-500">Clique para anexar arquivo</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm">
                        {editingRecord ? 'Salvar Alterações' : 'Adicionar'}
                    </button>
                </div>
            </div>
        </div>
      )}
      
      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl max-w-sm text-center shadow-2xl border border-gray-200">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                    <AlertTriangle size={24} />
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-2">Excluir Registro</h3>
                <p className="text-gray-500 mb-6">Tem certeza que deseja excluir esta movimentação financeira?</p>
                <div className="flex gap-4 justify-center">
                    <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium">Cancelar</button>
                    <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-bold shadow-sm">Confirmar</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};