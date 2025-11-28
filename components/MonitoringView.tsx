
import React, { useState } from 'react';
import { Sparkles, FileText, Save, Plus, Search, Calendar, User, Send, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { MonthlyMonitoring, Patient, Contract } from '../types';
import { generateMonitoringReport } from '../services/geminiService';

interface MonitoringViewProps {
  monitorings: MonthlyMonitoring[];
  patients: Patient[];
  contracts: Contract[];
  onUpdateMonitoring: (id: string, data: Partial<MonthlyMonitoring>) => void;
}

export const MonitoringView: React.FC<MonitoringViewProps> = ({ monitorings, patients, contracts, onUpdateMonitoring }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // States for Daily Evolution Log
  const [searchDate, setSearchDate] = useState('');
  const [newEntryDate, setNewEntryDate] = useState(new Date().toISOString().slice(0, 10));
  const [newEntryText, setNewEntryText] = useState('');

  const selectedReport = monitorings.find(m => m.id === selectedId);
  const selectedContract = selectedReport ? contracts.find(c => c.id === selectedReport.contractId) : null;
  const selectedPatient = selectedContract ? patients.find(p => p.id === selectedContract.patientId) : null;

  const handleGenerateAi = async () => {
    if (!selectedReport) return;
    
    const pName = selectedPatient ? selectedPatient.name : "Paciente";
    
    setIsGenerating(true);
    const summary = await generateMonitoringReport(
        pName, 
        selectedReport.month, 
        selectedReport.occurrences, 
        selectedReport.hoursWorked
    );
    
    onUpdateMonitoring(selectedReport.id, { aiSummary: summary });
    setIsGenerating(false);
  };

  const handleAddDailyEntry = () => {
      if (!selectedReport || !newEntryText.trim()) return;

      const timestamp = newEntryDate;
      const newEntryLine = `[${timestamp}] ${newEntryText}\n`;
      const currentText = selectedReport.occurrences || '';
      
      const newText = currentText ? `${currentText}\n${newEntryLine}` : newEntryLine;

      onUpdateMonitoring(selectedReport.id, { occurrences: newText });
      setNewEntryText(''); // Clear text
  };

  // Filter occurrences lines based on searchDate
  const getFilteredOccurrences = () => {
      if (!selectedReport) return '';
      if (!searchDate) return selectedReport.occurrences;

      const lines = (selectedReport.occurrences || '').split('\n');
      return lines.filter(line => line.includes(searchDate)).join('\n');
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-140px)] animate-fade-in">
      {/* List Sidebar */}
      <div className="w-full md:w-1/3 glass-panel rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <h3 className="font-tech font-bold text-white text-lg tracking-wide">RELATÓRIOS</h3>
            <div className="bg-slate-800 p-1.5 rounded-lg border border-white/10">
                <Calendar size={16} className="text-cyan-400" />
            </div>
        </div>
        <div className="overflow-y-auto flex-1 p-2 space-y-2 custom-scrollbar">
            {monitorings.map(m => {
                 const contract = contracts.find(c => c.id === m.contractId);
                 const patient = contract ? patients.find(p => p.id === contract.patientId) : null;
                 const patientName = patient ? patient.name : `Contrato: ${m.contractId.substr(0,6)}`;

                 return (
                    <div 
                        key={m.id} 
                        onClick={() => setSelectedId(m.id)}
                        className={`p-4 rounded-lg cursor-pointer border transition-all duration-300 group ${
                            selectedId === m.id 
                            ? 'bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                            : 'bg-transparent border-white/5 hover:bg-white/5 hover:border-white/10'
                        }`}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className={`font-bold capitalize truncate ${selectedId === m.id ? 'text-cyan-400' : 'text-slate-300 group-hover:text-white'}`}>
                                {patientName}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider border ${
                                m.status === 'Fechado' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                                {m.status}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                             <div className="flex items-center gap-2">
                                 <Calendar size={12} />
                                 <span className="font-mono">Ref: {m.month}</span>
                             </div>
                             {selectedId === m.id && <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(34,211,238,1)] animate-pulse"></div>}
                        </div>
                    </div>
                 )
            })}
        </div>
      </div>

      {/* Detail Editor */}
      <div className="w-full md:w-2/3 glass-panel rounded-xl flex flex-col relative overflow-hidden">
        {selectedReport ? (
            <>
                <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 backdrop-blur-md z-10">
                    <div className="mb-4 md:mb-0">
                        <h2 className="text-2xl font-tech font-bold text-white flex items-center gap-3">
                             <User size={24} className="text-cyan-400" />
                             {selectedPatient ? selectedPatient.name : 'Paciente'}
                        </h2>
                        <div className="flex items-center gap-4 mt-1">
                             <p className="text-sm text-slate-400">Mês: <span className="font-mono text-cyan-200">{selectedReport.month}</span></p>
                             <span className="text-slate-600">|</span>
                             <p className="text-sm text-slate-400 flex items-center gap-1">
                                <Clock size={14} /> Horas: <span className="font-mono text-cyan-200 font-bold">{selectedReport.hoursWorked}h</span>
                             </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                         <div className="flex flex-col items-end mr-2">
                            <label className="text-[10px] text-slate-500 uppercase font-bold mb-1">Ajustar Horas</label>
                            <input 
                                type="number" 
                                className="bg-slate-900/50 border border-slate-700 w-20 text-center font-mono font-bold text-white text-sm rounded p-1 focus:border-cyan-500 outline-none"
                                value={selectedReport.hoursWorked}
                                onChange={(e) => onUpdateMonitoring(selectedReport.id, { hoursWorked: Number(e.target.value) })}
                            />
                         </div>
                         <div className="flex flex-col items-end">
                             <label className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status</label>
                             <select 
                                 className="bg-slate-900/50 border border-slate-700 rounded p-1 text-sm outline-none text-white focus:border-cyan-500"
                                 value={selectedReport.status}
                                 onChange={(e) => onUpdateMonitoring(selectedReport.id, { status: e.target.value as any })}
                             >
                                 <option>Em Aberto</option>
                                 <option>Fechado</option>
                             </select>
                         </div>
                    </div>
                </div>
                
                <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
                    
                    {/* Diário de Evolução Section */}
                    <div className="flex flex-col h-full min-h-[500px]">
                         <div className="flex justify-between items-end mb-4">
                             <label className="text-sm font-bold text-cyan-400 flex items-center gap-2 uppercase tracking-wide">
                                <FileText size={16} /> Diário de Evolução (Ocorrências)
                             </label>
                             <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-lg border border-white/5">
                                <Search size={14} className="text-slate-500 ml-2"/>
                                <input 
                                    type="date" 
                                    className="bg-transparent border-none text-xs outline-none text-slate-300 font-mono"
                                    value={searchDate}
                                    onChange={(e) => setSearchDate(e.target.value)}
                                />
                                {searchDate && (
                                    <button onClick={() => setSearchDate('')} className="text-slate-500 hover:text-white p-1">
                                        <Plus size={14} className="rotate-45" />
                                    </button>
                                )}
                             </div>
                         </div>

                         {/* Add New Entry Box */}
                         {!searchDate && (
                             <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 mb-6 shadow-inner relative group transition-all hover:border-white/10">
                                 <div className="flex justify-between items-center mb-3">
                                    <p className="text-sm font-bold text-slate-300 flex items-center gap-2">
                                        <Plus size={16} className="text-cyan-500" /> Adicionar Nova Evolução
                                    </p>
                                    <input 
                                         type="date"
                                         className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-xs outline-none text-slate-300 focus:border-cyan-500"
                                         value={newEntryDate}
                                         onChange={(e) => setNewEntryDate(e.target.value)}
                                     />
                                 </div>
                                 
                                 <div className="flex flex-col gap-3">
                                     <textarea
                                         className="w-full h-24 bg-black/20 border border-slate-700/50 rounded-lg p-3 text-sm outline-none text-slate-300 focus:border-cyan-500/50 focus:bg-slate-900/50 transition-all resize-none font-mono"
                                         placeholder="Descreva detalhadamente a evolução do paciente..."
                                         value={newEntryText}
                                         onChange={(e) => setNewEntryText(e.target.value)}
                                     />
                                     <div className="flex justify-end">
                                        <button 
                                            onClick={handleAddDailyEntry}
                                            disabled={!newEntryText.trim()}
                                            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                                !newEntryText.trim() 
                                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
                                                : 'bg-cyan-600 text-white hover:bg-cyan-500 shadow-[0_0_10px_rgba(8,145,178,0.3)]'
                                            }`}
                                        >
                                            <Send size={14} /> Registrar
                                        </button>
                                     </div>
                                 </div>
                             </div>
                         )}

                         {/* Main Text Area (Read Only if Filtering) */}
                         <div className="flex-1 relative flex flex-col">
                             <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block tracking-widest">
                                 Histórico Completo
                             </label>
                             {searchDate ? (
                                 <div className="flex-1 bg-black/20 border border-white/5 rounded-lg p-4 overflow-y-auto whitespace-pre-wrap text-sm text-slate-300 font-mono leading-relaxed custom-scrollbar">
                                     {getFilteredOccurrences() || <span className="text-slate-600 italic flex items-center gap-2"><AlertCircle size={14}/> Nenhuma ocorrência nesta data.</span>}
                                 </div>
                             ) : (
                                <textarea 
                                    className="flex-1 w-full bg-black/20 border border-white/5 text-slate-300 rounded-lg p-4 focus:ring-1 focus:ring-cyan-500/30 outline-none resize-none font-mono text-sm leading-relaxed custom-scrollbar"
                                    placeholder="Histórico de ocorrências..."
                                    value={selectedReport.occurrences}
                                    onChange={(e) => onUpdateMonitoring(selectedReport.id, { occurrences: e.target.value })}
                                />
                             )}
                         </div>
                    </div>

                    {/* AI Summary Section */}
                    <div className="bg-violet-900/10 rounded-xl p-5 border border-violet-500/20 mt-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <Sparkles size={100} />
                        </div>
                        <div className="flex justify-between items-center mb-4 relative z-10">
                            <div className="flex items-center gap-2 text-violet-300 font-bold font-tech text-lg">
                                <Sparkles size={18} className="text-violet-400" /> 
                                RESUMO CLÍNICO (IA)
                            </div>
                            <button 
                                onClick={handleGenerateAi}
                                disabled={isGenerating || !process.env.API_KEY}
                                className={`text-xs px-4 py-2 rounded-lg font-bold uppercase tracking-wider transition-all shadow-lg ${
                                    !process.env.API_KEY ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' :
                                    isGenerating ? 'bg-violet-900/50 text-violet-300 border border-violet-500/30' : 'bg-violet-600 text-white hover:bg-violet-500 shadow-violet-500/20'
                                }`}
                            >
                                {isGenerating ? 'Processando...' : 'Gerar Resumo'}
                            </button>
                        </div>
                        <textarea 
                            className="w-full bg-slate-900/50 border border-violet-500/10 rounded-lg p-4 h-28 text-slate-300 text-sm focus:border-violet-500/50 outline-none resize-none relative z-10 font-mono leading-relaxed"
                            value={selectedReport.aiSummary || ''}
                            readOnly
                            placeholder={process.env.API_KEY ? "Clique em 'Gerar Resumo' para a IA analisar o histórico de ocorrências e gerar um relatório executivo." : "Configure a API_KEY para usar este recurso."}
                        />
                    </div>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4 animate-pulse">
                    <FileText size={40} className="opacity-50" />
                </div>
                <p className="font-tech text-xl text-slate-500">SELECIONE UM RELATÓRIO</p>
                <p className="text-sm text-slate-600 mt-2">Escolha um item da lista para visualizar ou editar.</p>
            </div>
        )}
      </div>
    </div>
  );
};
