
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, MoreVertical, User, FileText, Trash2, Edit, AlertTriangle, X, Upload, Paperclip, ArrowLeft, Users, DollarSign, Calendar, ArrowDownLeft, ArrowUpRight, MapPin, Stethoscope, Activity, Pill, AlertCircle, FileCheck, ClipboardList, CheckSquare } from 'lucide-react';
import { Patient, Contract, ContractStatus, Employee, PatientEmployeeLink, FinanceRecord, PaymentType, PaymentStatus, ClinicalRecord, MedicalRecord, Attachment } from '../types';

interface PatientsViewProps {
  patients: Patient[];
  contracts: Contract[];
  employees: Employee[];
  financeRecords: FinanceRecord[];
  onAddPatient: (p: Patient, c: Contract) => void;
  onEditPatient: (p: Patient, c: Contract) => void;
  onDeletePatient: (id: string) => void;
  onLinkEmployee: (patientId: string, link: PatientEmployeeLink) => void;
  onAddExtraExpense: (record: FinanceRecord) => void;
  onAddEmployee: (e: Employee) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({ 
    patients, contracts, employees, financeRecords, 
    onAddPatient, onEditPatient, onDeletePatient, onLinkEmployee, onAddExtraExpense, onAddEmployee
}) => {
  // --- STATES ---
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<{p: Patient, c: Contract} | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Sub-modals states
  const [showLinkEmpModal, setShowLinkEmpModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showClinicalModal, setShowClinicalModal] = useState(false);
  const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    patientStatus: 'Ativo',
    financialResponsible: '',
    financialResponsibleContact: '',
    address: '',
    notes: '',
    contractValue: 0,
    contractStart: '',
    shiftsPerMonth: 0,
    contractStatus: ContractStatus.ACTIVE,
    fileName: ''
  });

  const [mapQuery, setMapQuery] = useState('');

  // Link Employee Form
  const [isNewEmployee, setIsNewEmployee] = useState(false);
  const [linkEmpData, setLinkEmpData] = useState({
    employeeId: '',
    shiftsCount: 0,
    valuePerShift: 0,
    newEmpName: '',
    newEmpRole: 'Cuidador(a)'
  });

  // Extra Expense Form
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: 0,
    date: new Date().toISOString().slice(0,10)
  });

  // Clinical Record Form
  const [clinicalData, setClinicalData] = useState<ClinicalRecord>({
      clinicalCondition: '',
      hasComorbidities: false,
      comorbiditiesDescription: '',
      hasAllergies: false,
      allergiesDescription: '',
      medications: '',
      physicianName: '',
      physicianContact: ''
  });

  // Medical Record Form (Prontuário)
  const [medicalData, setMedicalData] = useState<MedicalRecord>({
      nursingPrescription: '',
      medicalPrescription: '',
      medicalEvolution: '',
      nursingEvolution: '',
      nursingNotes: '',
      attachments: []
  });

  // --- HANDLERS (Same logic, new style) ---
  const resetForm = () => {
    setFormData({
      name: '',
      patientStatus: 'Ativo',
      financialResponsible: '',
      financialResponsibleContact: '',
      address: '',
      notes: '',
      contractValue: 0,
      contractStart: '',
      shiftsPerMonth: 0,
      contractStatus: ContractStatus.ACTIVE,
      fileName: ''
    });
    setMapQuery('');
    setEditingPatient(null);
  };

  const handleEditClick = (p: Patient) => {
    const c = contracts.find(c => c.patientId === p.id);
    const tempContract = c || {
        id: '',
        patientId: p.id,
        value: 0,
        startDate: '',
        shiftsPerMonth: 0,
        status: ContractStatus.ACTIVE,
        description: ''
    };

    setEditingPatient({ p, c: tempContract });
    setFormData({
      name: p.name,
      patientStatus: p.status,
      financialResponsible: p.financialResponsible,
      financialResponsibleContact: p.financialResponsibleContact || '',
      address: p.address,
      notes: p.notes,
      contractValue: tempContract.value,
      contractStart: tempContract.startDate,
      shiftsPerMonth: tempContract.shiftsPerMonth,
      contractStatus: tempContract.status,
      fileName: p.document || ''
    });
    setMapQuery(p.address);
    setShowModal(true);
  };

  const handleSave = () => {
    const patientData: Patient = {
      id: editingPatient ? editingPatient.p.id : Math.random().toString(36).substr(2, 9),
      name: formData.name,
      financialResponsible: formData.financialResponsible,
      financialResponsibleContact: formData.financialResponsibleContact,
      address: formData.address,
      status: formData.patientStatus as 'Ativo' | 'Inativo',
      notes: formData.notes,
      document: formData.fileName,
      linkedEmployees: editingPatient?.p.linkedEmployees || [],
      clinicalRecord: editingPatient?.p.clinicalRecord,
      medicalRecord: editingPatient?.p.medicalRecord
    };

    const contractData: Contract = {
      id: (editingPatient && editingPatient.c.id) ? editingPatient.c.id : Math.random().toString(36).substr(2, 9),
      patientId: patientData.id,
      value: formData.contractValue,
      startDate: formData.contractStart,
      shiftsPerMonth: formData.shiftsPerMonth,
      status: formData.contractStatus,
      description: `Contrato ${patientData.name}`
    };

    if (editingPatient) {
      onEditPatient(patientData, contractData);
    } else {
      onAddPatient(patientData, contractData);
    }
    setShowModal(false);
    resetForm();
  };

  const handleDeleteConfirm = () => {
    if (showDeleteConfirm) {
        onDeletePatient(showDeleteConfirm);
        setShowDeleteConfirm(null);
        setSelectedPatientId(null);
    }
  };

  const handleLinkEmployeeSubmit = () => {
    if (!selectedPatientId) return;
    let targetEmpId = linkEmpData.employeeId;
    let targetEmpName = '';

    if (isNewEmployee) {
        if (!linkEmpData.newEmpName) return;
        const newEmp: Employee = {
            id: Math.random().toString(36).substr(2, 9),
            name: linkEmpData.newEmpName,
            role: linkEmpData.newEmpRole,
            phone: '',
            pixKey: '',
            professionalRegister: '',
            admissionDate: new Date().toISOString(),
            documents: [],
            skills: [],
            status: 'Ativo'
        };
        onAddEmployee(newEmp);
        targetEmpId = newEmp.id;
        targetEmpName = newEmp.name;
    } else {
        if (!linkEmpData.employeeId) return;
        const emp = employees.find(e => e.id === linkEmpData.employeeId);
        if (!emp) return;
        targetEmpId = emp.id;
        targetEmpName = emp.name;
    }

    const newLink: PatientEmployeeLink = {
        id: Math.random().toString(36).substr(2, 9),
        employeeId: targetEmpId,
        employeeName: targetEmpName,
        shiftsCount: linkEmpData.shiftsCount,
        valuePerShift: linkEmpData.valuePerShift
    };
    
    onLinkEmployee(selectedPatientId, newLink);
    setShowLinkEmpModal(false);
    setLinkEmpData({ 
        employeeId: '', shiftsCount: 0, valuePerShift: 0, 
        newEmpName: '', newEmpRole: 'Cuidador(a)' 
    });
    setIsNewEmployee(false);
  };

  const handleExpenseSubmit = () => {
    if (!selectedPatientId) return;
    const newRecord: FinanceRecord = {
        id: Math.random().toString(36).substr(2, 9),
        type: PaymentType.EXPENSE_EXTRA,
        description: expenseData.description,
        amount: expenseData.amount,
        date: expenseData.date,
        status: PaymentStatus.PENDING,
        patientId: selectedPatientId
    };
    onAddExtraExpense(newRecord);
    setShowExpenseModal(false);
    setExpenseData({ description: '', amount: 0, date: new Date().toISOString().slice(0,10) });
  };

  // Clinical Record Handlers
  const handleOpenClinicalModal = () => {
    if (selectedPatient && selectedPatient.clinicalRecord) {
        setClinicalData(selectedPatient.clinicalRecord);
    } else {
        setClinicalData({
            clinicalCondition: '',
            hasComorbidities: false,
            comorbiditiesDescription: '',
            hasAllergies: false,
            allergiesDescription: '',
            medications: '',
            physicianName: '',
            physicianContact: ''
        });
    }
    setShowClinicalModal(true);
  };

  const handleClinicalSubmit = () => {
    if (!selectedPatientId || !selectedContract) return;
    const updatedPatient: Patient = {
        ...selectedPatient!,
        clinicalRecord: clinicalData
    };
    onEditPatient(updatedPatient, selectedContract);
    setShowClinicalModal(false);
  };

  // Medical Record Handlers
  const handleOpenMedicalRecordModal = () => {
    if (selectedPatient && selectedPatient.medicalRecord) {
        setMedicalData(selectedPatient.medicalRecord);
    } else {
        setMedicalData({
            nursingPrescription: '',
            medicalPrescription: '',
            medicalEvolution: '',
            nursingEvolution: '',
            nursingNotes: '',
            attachments: []
        });
    }
    setShowMedicalRecordModal(true);
  };

  const handleMedicalSubmit = () => {
     if (!selectedPatientId || !selectedContract) return;
     const updatedPatient: Patient = {
         ...selectedPatient!,
         medicalRecord: medicalData
     };
     onEditPatient(updatedPatient, selectedContract);
     setShowMedicalRecordModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const newAttachment: Attachment = {
              id: Math.random().toString(36).substr(2, 9),
              name: file.name,
              url: '#', // In a real app, this would be the uploaded URL
              date: new Date().toISOString().slice(0,10),
              type: 'EXAM'
          };
          setMedicalData(prev => ({
              ...prev,
              attachments: [...prev.attachments, newAttachment]
          }));
      }
  };

  const handleAddressBlur = () => {
     if (formData.address) setMapQuery(formData.address);
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);
  const selectedContract = contracts.find(c => c.patientId === selectedPatientId);
  
  const patientStatement = React.useMemo(() => {
    if (!selectedPatient || !selectedContract) return [];
    const items = [];
    items.push({
        id: 'contract-income',
        date: 'Mensal',
        desc: 'Receita Contrato',
        type: 'income',
        value: selectedContract.value
    });
    if (selectedPatient.linkedEmployees) {
        selectedPatient.linkedEmployees.forEach(link => {
            items.push({
                id: link.id,
                date: 'Mensal',
                desc: `Pgto. ${link.employeeName} (${link.shiftsCount} plantões)`,
                type: 'expense',
                value: link.shiftsCount * link.valuePerShift
            });
        });
    }
    const extras = financeRecords.filter(f => f.patientId === selectedPatient.id && f.type === PaymentType.EXPENSE_EXTRA);
    extras.forEach(ex => {
        items.push({
            id: ex.id,
            date: new Date(ex.date).toLocaleDateString('pt-BR'),
            desc: ex.description,
            type: 'expense',
            value: ex.amount
        });
    });
    return items;
  }, [selectedPatient, selectedContract, financeRecords]);

  const totalIncome = patientStatement.filter(i => i.type === 'income').reduce((acc, c) => acc + c.value, 0);
  const totalExpense = patientStatement.filter(i => i.type === 'expense').reduce((acc, c) => acc + c.value, 0);
  const finalBalance = totalIncome - totalExpense;
  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // ================= RENDER =================

  if (selectedPatientId && selectedPatient) {
    // === DETAIL VIEW (Dark Theme Preserved for Dashboard parts) ===
    return (
        <div className="animate-fade-in space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between glass-panel p-4 rounded-xl border-l-4 border-cyan-500">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setSelectedPatientId(null)}
                        className="p-2 hover:bg-white/10 rounded-full transition text-cyan-400"
                    >
                        <ArrowLeft size={24}/>
                    </button>
                    <div>
                        <h2 className="text-2xl font-tech font-bold text-white flex items-center gap-3">
                          {selectedPatient.name}
                          <span className={`px-2 py-0.5 rounded text-xs font-mono border ${
                              selectedPatient.status === 'Ativo' 
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                              : 'bg-slate-700 text-slate-400 border-slate-600'
                          }`}>
                              {selectedPatient.status}
                          </span>
                        </h2>
                    </div>
                </div>
                <button 
                   onClick={() => handleEditClick(selectedPatient)}
                   className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-500/50 rounded-lg hover:bg-blue-600/40 font-medium flex items-center gap-2 transition-all"
                >
                   <Edit size={16} /> <span className="hidden sm:inline">Editar</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Contract Info */}
                <div className="glass-panel p-6 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-10"><FileText size={100} /></div>
                    <h3 className="font-tech text-lg font-bold text-cyan-400 mb-6 flex items-center gap-2">
                        <FileText size={18} /> CONTRATO
                    </h3>
                    <div className="space-y-4 relative z-10">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-slate-400 text-sm">Valor Mensal</span>
                            <span className="font-mono font-bold text-emerald-400 text-lg">
                                {selectedContract?.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-slate-400 text-sm">Plantões/Mês</span>
                            <span className="font-mono text-white">{selectedContract?.shiftsPerMonth}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                            <span className="text-slate-400 text-sm">Início</span>
                            <span className="font-mono text-white">
                                {selectedContract ? new Date(selectedContract.startDate).toLocaleDateString('pt-BR') : '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Team Management */}
                <div className="glass-panel p-6 rounded-xl lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-tech text-lg font-bold text-violet-400 flex items-center gap-2">
                            <Users size={18} /> EQUIPE TÉCNICA
                        </h3>
                        <button 
                            onClick={() => { setIsNewEmployee(false); setShowLinkEmpModal(true); }}
                            className="text-xs bg-violet-600/20 border border-violet-500/50 text-violet-300 px-3 py-1.5 rounded hover:bg-violet-600/40 flex items-center gap-1 transition-all"
                        >
                            <Plus size={14} /> Add Colaborador
                        </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-slate-500 uppercase text-xs border-b border-white/10">
                                <tr>
                                    <th className="p-3">Colaborador</th>
                                    <th className="p-3">Valor/Plantão</th>
                                    <th className="p-3">Nº Plantões</th>
                                    <th className="p-3 text-right">Valor Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {selectedPatient.linkedEmployees && selectedPatient.linkedEmployees.length > 0 ? (
                                    selectedPatient.linkedEmployees.map(link => (
                                        <tr key={link.id} className="hover:bg-white/5">
                                            <td className="p-3 font-medium text-white capitalize">{link.employeeName}</td>
                                            <td className="p-3 text-slate-300 font-mono">
                                                {link.valuePerShift.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </td>
                                            <td className="p-3 text-slate-300 font-mono">{link.shiftsCount}</td>
                                            <td className="p-3 text-right font-mono text-rose-400">
                                                - {(link.shiftsCount * link.valuePerShift).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="p-4 text-center text-slate-600 italic">
                                            Nenhum colaborador vinculado.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Clinical Record Card */}
            <div className="glass-panel p-6 rounded-xl border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="font-tech text-lg font-bold text-rose-400 flex items-center gap-2">
                        <Stethoscope size={18} /> FICHA CLÍNICA
                     </h3>
                     <button 
                        onClick={handleOpenClinicalModal}
                        className="text-xs px-3 py-1.5 rounded border border-rose-500/30 text-rose-300 hover:bg-rose-500/10 transition"
                     >
                        {selectedPatient.clinicalRecord ? 'EDITAR FICHA' : 'CRIAR FICHA'}
                     </button>
                 </div>

                 {selectedPatient.clinicalRecord ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Condição Clínica</p>
                                <div className="p-4 bg-slate-900/50 rounded-lg border border-white/5 text-slate-200 text-sm leading-relaxed">
                                    {selectedPatient.clinicalRecord.clinicalCondition || 'Não informado.'}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-3 rounded-lg border ${selectedPatient.clinicalRecord.hasComorbidities ? 'bg-rose-900/10 border-rose-500/30' : 'bg-slate-900/30 border-white/5'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Activity size={14} className={selectedPatient.clinicalRecord.hasComorbidities ? "text-rose-500" : "text-slate-500"} />
                                        <span className="text-xs font-bold text-slate-400 uppercase">Comorbidades</span>
                                    </div>
                                    <p className="text-sm font-medium text-white">
                                        {selectedPatient.clinicalRecord.hasComorbidities ? selectedPatient.clinicalRecord.comorbiditiesDescription : 'Não possui'}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-lg border ${selectedPatient.clinicalRecord.hasAllergies ? 'bg-amber-900/10 border-amber-500/30' : 'bg-slate-900/30 border-white/5'}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <AlertCircle size={14} className={selectedPatient.clinicalRecord.hasAllergies ? "text-amber-500" : "text-slate-500"} />
                                        <span className="text-xs font-bold text-slate-400 uppercase">Alergias</span>
                                    </div>
                                    <p className="text-sm font-medium text-white">
                                        {selectedPatient.clinicalRecord.hasAllergies ? selectedPatient.clinicalRecord.allergiesDescription : 'Não possui'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Pill size={14} /> Medicamentos
                                </p>
                                <div className="p-4 bg-slate-900/50 rounded-lg border border-white/5 text-slate-200 text-sm whitespace-pre-line font-mono">
                                    {selectedPatient.clinicalRecord.medications || 'Nenhum medicamento informado.'}
                                </div>
                            </div>
                            <div className="p-4 bg-cyan-900/10 rounded-lg border border-cyan-500/20">
                                <p className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-2">Médico Responsável</p>
                                <p className="text-sm font-bold text-white mb-1">{selectedPatient.clinicalRecord.physicianName || 'Não informado'}</p>
                                <p className="text-sm text-cyan-200/70 font-mono">{selectedPatient.clinicalRecord.physicianContact}</p>
                            </div>
                        </div>
                    </div>
                 ) : (
                    <div className="text-center py-10 border border-dashed border-white/10 rounded-lg">
                        <Stethoscope size={32} className="mx-auto mb-3 text-slate-600"/>
                        <p className="text-slate-500">Nenhuma ficha clínica cadastrada.</p>
                    </div>
                 )}
            </div>

            {/* Prontuário Completo */}
            <div className="glass-panel p-6 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                 <div className="flex justify-between items-center mb-6">
                     <h3 className="font-tech text-lg font-bold text-blue-400 flex items-center gap-2">
                        <ClipboardList size={18} /> PRONTUÁRIO
                     </h3>
                     <button 
                        onClick={handleOpenMedicalRecordModal}
                        className="text-xs px-3 py-1.5 rounded border border-blue-500/30 text-blue-300 hover:bg-blue-500/10 transition flex items-center gap-2"
                     >
                        <Edit size={12} /> {selectedPatient.medicalRecord ? 'EDITAR PRONTUÁRIO' : 'INICIAR PRONTUÁRIO'}
                     </button>
                 </div>
                 
                 {selectedPatient.medicalRecord ? (
                    <div className="space-y-6">
                        {/* Seção 1: Prescrições */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card p-4 rounded-lg border-l-2 border-blue-500">
                                <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                    <User size={14} /> Prescrição Médica
                                </h4>
                                <div className="text-sm text-slate-300 whitespace-pre-line font-mono bg-black/20 p-3 rounded h-40 overflow-y-auto custom-scrollbar">
                                    {selectedPatient.medicalRecord.medicalPrescription || 'Sem prescrição registrada.'}
                                </div>
                            </div>
                            <div className="glass-card p-4 rounded-lg border-l-2 border-violet-500">
                                <h4 className="text-sm font-bold text-violet-400 mb-3 flex items-center gap-2 uppercase tracking-wide">
                                    <User size={14} /> Prescrição de Enfermagem
                                </h4>
                                <div className="text-sm text-slate-300 whitespace-pre-line font-mono bg-black/20 p-3 rounded h-40 overflow-y-auto custom-scrollbar">
                                    {selectedPatient.medicalRecord.nursingPrescription || 'Sem prescrição registrada.'}
                                </div>
                            </div>
                        </div>

                        {/* Seção 2: Evoluções */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass-card p-4 rounded-lg">
                                <h4 className="text-sm font-bold text-blue-300 mb-3 uppercase tracking-wide">Evolução Médica</h4>
                                <div className="text-sm text-slate-400 whitespace-pre-line leading-relaxed">
                                    {selectedPatient.medicalRecord.medicalEvolution || 'Sem evolução registrada.'}
                                </div>
                            </div>
                            <div className="glass-card p-4 rounded-lg">
                                <h4 className="text-sm font-bold text-violet-300 mb-3 uppercase tracking-wide">Evolução de Enfermagem</h4>
                                <div className="text-sm text-slate-400 whitespace-pre-line leading-relaxed">
                                    {selectedPatient.medicalRecord.nursingEvolution || 'Sem evolução registrada.'}
                                </div>
                            </div>
                        </div>

                        {/* Seção 3: Anotações e Anexos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Anotações Gerais de Enfermagem</h4>
                                <div className="p-4 bg-slate-900/50 rounded-lg border border-white/5 text-slate-300 text-sm whitespace-pre-line min-h-[120px]">
                                    {selectedPatient.medicalRecord.nursingNotes || 'Nenhuma anotação adicional.'}
                                </div>
                             </div>
                             
                             <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Paperclip size={14} /> Documentos e Exames Anexados
                                </h4>
                                <div className="bg-slate-900/30 rounded-lg border border-white/5 p-2 space-y-2 min-h-[120px]">
                                    {selectedPatient.medicalRecord.attachments && selectedPatient.medicalRecord.attachments.length > 0 ? (
                                        selectedPatient.medicalRecord.attachments.map(att => (
                                            <div key={att.id} className="flex items-center justify-between p-2 bg-white/5 rounded hover:bg-white/10 transition cursor-pointer group">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-red-500/20 text-red-400 p-1.5 rounded">
                                                        <FileText size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-200 font-medium">{att.name}</p>
                                                        <p className="text-[10px] text-slate-500">{new Date(att.date).toLocaleDateString('pt-BR')}</p>
                                                    </div>
                                                </div>
                                                <Upload size={14} className="text-slate-500 opacity-0 group-hover:opacity-100" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-600">
                                            <Paperclip size={24} className="mb-2 opacity-50" />
                                            <p className="text-xs">Nenhum documento anexado.</p>
                                        </div>
                                    )}
                                </div>
                             </div>
                        </div>
                    </div>
                 ) : (
                    <div className="text-center py-12 border border-dashed border-white/10 rounded-lg bg-white/5">
                        <ClipboardList size={40} className="mx-auto mb-3 text-slate-600"/>
                        <p className="text-slate-400 font-medium">Prontuário não iniciado</p>
                        <p className="text-xs text-slate-600 mt-1">Clique em "Iniciar Prontuário" para adicionar informações médicas e de enfermagem.</p>
                    </div>
                 )}
            </div>

            {/* Financial Statement */}
            <div className="glass-panel rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h3 className="font-tech text-lg font-bold text-emerald-400 flex items-center gap-2">
                        <DollarSign size={18} /> EXTRATO FINANCEIRO
                    </h3>
                    <div className="flex items-center gap-6">
                         <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Saldo Previsto</p>
                            <p className={`text-xl font-mono font-bold ${finalBalance >= 0 ? 'text-emerald-400 text-shadow-neon-green' : 'text-rose-400'}`}>
                                {finalBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                         </div>
                         <button 
                            onClick={() => setShowExpenseModal(true)}
                            className="bg-rose-500/20 text-rose-300 border border-rose-500/50 px-4 py-2 rounded hover:bg-rose-500/30 transition text-sm flex items-center gap-2"
                         >
                            <ArrowUpRight size={16} /> Lançar Gasto
                         </button>
                    </div>
                </div>

                <table className="w-full text-left">
                    <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-4">Data/Ref</th>
                            <th className="p-4">Descrição</th>
                            <th className="p-4 text-right">Valor</th>
                            <th className="p-4 text-center">Tipo</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {patientStatement.map((item, idx) => (
                            <tr key={item.id + idx} className="hover:bg-white/5">
                                <td className="p-4 text-slate-400 font-mono">{item.date}</td>
                                <td className="p-4 font-medium text-white capitalize">{item.desc}</td>
                                <td className={`p-4 text-right font-mono ${item.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                    {item.type === 'expense' ? '-' : '+'} {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${item.type === 'income' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                                        {item.type === 'income' ? 'ENTRADA' : 'SAÍDA'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- MODALS (DARK/CYBERPUNK THEME) --- */}
            
            {/* Modal: Cadastro/Edição de Paciente */}
            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                            <h3 className="text-xl font-bold text-white font-tech tracking-wide">
                                {editingPatient ? 'Editar Paciente' : 'Novo Paciente'}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white transition">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase mb-1">Nome Completo</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none capitalize"
                                        value={formData.name}
                                        onChange={e => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-400 uppercase mb-1">Status</label>
                                    <select 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                                        value={formData.patientStatus}
                                        onChange={e => setFormData({...formData, patientStatus: e.target.value})}
                                    >
                                        <option value="Ativo">Ativo</option>
                                        <option value="Inativo">Inativo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-blue-900/10 p-4 rounded-xl border border-blue-500/20">
                                <h4 className="text-sm font-bold text-blue-400 mb-3 flex items-center gap-2">
                                    <FileText size={16}/> RESPONSÁVEL FINANCEIRO
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-blue-300 uppercase mb-1">Nome do Responsável</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none capitalize"
                                            value={formData.financialResponsible}
                                            onChange={e => setFormData({...formData, financialResponsible: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-blue-300 uppercase mb-1">Tel. Responsável</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none"
                                            placeholder="(00) 00000-0000"
                                            value={formData.financialResponsibleContact}
                                            onChange={e => setFormData({...formData, financialResponsibleContact: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-400 uppercase mb-1">Endereço Completo</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none"
                                        value={formData.address}
                                        onChange={e => setFormData({...formData, address: e.target.value})}
                                        onBlur={handleAddressBlur}
                                    />
                                    <button 
                                        type="button"
                                        className="bg-slate-700 text-slate-300 border border-slate-600 px-4 rounded-lg hover:bg-slate-600 flex items-center gap-2"
                                        onClick={() => setMapQuery(formData.address)}
                                    >
                                        <Search size={16} /> Mapa
                                    </button>
                                </div>
                            </div>

                            {mapQuery && (
                                <div className="rounded-xl overflow-hidden border border-slate-700 h-48 w-full bg-slate-800">
                                    <iframe 
                                        width="100%" 
                                        height="100%" 
                                        style={{border:0}} 
                                        loading="lazy" 
                                        allowFullScreen 
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.API_KEY || ''}&q=${encodeURIComponent(mapQuery)}`}>
                                    </iframe>
                                </div>
                            )}

                            <div className="bg-emerald-900/10 p-4 rounded-xl border border-emerald-500/20">
                                <h4 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                                    <DollarSign size={16}/> DADOS DO CONTRATO
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Valor Mensal (R$)</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none"
                                            value={formData.contractValue}
                                            onChange={e => setFormData({...formData, contractValue: Number(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Data de Início</label>
                                        <input 
                                            type="date" 
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none"
                                            value={formData.contractStart}
                                            onChange={e => setFormData({...formData, contractStart: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Plantões/Mês</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none"
                                            placeholder="Ex: 12"
                                            value={formData.shiftsPerMonth}
                                            onChange={e => setFormData({...formData, shiftsPerMonth: Number(e.target.value)})}
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            {/* Upload Area */}
                            <div className="pt-2">
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                                    <Paperclip size={14}/> ANEXAR DOCUMENTO
                                </label>
                                <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-white/5 transition cursor-pointer relative group">
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept=".pdf"
                                        onChange={(e) => {
                                            if(e.target.files && e.target.files[0]) {
                                                setFormData({...formData, fileName: e.target.files[0].name});
                                            }
                                        }}
                                    />
                                    <div className="bg-cyan-500/20 p-3 rounded-full text-cyan-400 mb-2 group-hover:scale-110 transition-transform">
                                        <Upload size={24} />
                                    </div>
                                    {formData.fileName ? (
                                        <p className="text-sm font-bold text-emerald-400">{formData.fileName}</p>
                                    ) : (
                                        <>
                                            <p className="text-sm font-bold text-slate-300">Clique para anexar PDF do Contrato</p>
                                            <p className="text-xs text-slate-500 mt-1">Apenas arquivos PDF</p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-6 py-2.5 text-slate-400 font-medium hover:bg-white/10 rounded-lg transition">
                                Cancelar
                            </button>
                            <button onClick={handleSave} className="px-6 py-2.5 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-500 transition shadow-lg shadow-cyan-500/20">
                                {editingPatient ? 'Salvar Alterações' : 'Cadastrar Paciente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Vincular Colaborador */}
            {showLinkEmpModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg border border-white/10 overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                            <h3 className="text-xl font-bold text-white font-tech">Adicionar à Equipe</h3>
                            <button onClick={() => setShowLinkEmpModal(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
                        </div>
                        
                        <div className="p-6">
                            <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
                                <button 
                                    className={`pb-2 text-sm font-bold border-b-2 transition ${!isNewEmployee ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                                    onClick={() => setIsNewEmployee(false)}
                                >
                                    Selecionar Existente
                                </button>
                                <button 
                                    className={`pb-2 text-sm font-bold border-b-2 transition ${isNewEmployee ? 'border-violet-500 text-violet-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                                    onClick={() => setIsNewEmployee(true)}
                                >
                                    Novo Cadastro
                                </button>
                            </div>

                            <div className="space-y-4">
                                {isNewEmployee ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1">Nome Completo</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none capitalize"
                                                value={linkEmpData.newEmpName}
                                                onChange={e => setLinkEmpData({...linkEmpData, newEmpName: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-400 mb-1">Profissão</label>
                                            <select 
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
                                                value={linkEmpData.newEmpRole}
                                                onChange={e => setLinkEmpData({...linkEmpData, newEmpRole: e.target.value})}
                                            >
                                                <option>Enfermeiro(a)</option>
                                                <option>Téc. Enfermagem</option>
                                                <option>Fisioterapeuta</option>
                                                <option>Fonoaudiólogo(a)</option>
                                                <option>Cuidador(a)</option>
                                            </select>
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Profissional</label>
                                        <select 
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
                                            value={linkEmpData.employeeId}
                                            onChange={e => setLinkEmpData({...linkEmpData, employeeId: e.target.value})}
                                        >
                                            <option value="">Selecione...</option>
                                            {employees.filter(e => e.status === 'Ativo').map(e => (
                                                <option key={e.id} value={e.id}>{e.name} - {e.role}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Valor por Plantão (R$)</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
                                            value={linkEmpData.valuePerShift}
                                            onChange={e => setLinkEmpData({...linkEmpData, valuePerShift: Number(e.target.value)})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Qtd. Plantões</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
                                            value={linkEmpData.shiftsCount}
                                            onChange={e => setLinkEmpData({...linkEmpData, shiftsCount: Number(e.target.value)})}
                                        />
                                    </div>
                                </div>
                                
                                <div className="bg-violet-900/20 p-3 rounded-lg flex justify-between items-center border border-violet-500/30">
                                    <span className="text-violet-200 font-medium">Total Mensal Previsto:</span>
                                    <span className="text-xl font-bold text-violet-400">
                                        {(linkEmpData.valuePerShift * linkEmpData.shiftsCount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                            <button onClick={() => setShowLinkEmpModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button>
                            <button onClick={handleLinkEmployeeSubmit} className="px-6 py-2 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-500 transition shadow-lg shadow-violet-500/20">
                                Salvar Vínculo
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Lançar Gasto Extra */}
            {showExpenseModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-md border border-white/10 overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                            <h3 className="text-xl font-bold text-white font-tech">Lançar Despesa Extra</h3>
                            <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Descrição</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
                                    placeholder="Ex: Medicamentos, Transporte..."
                                    value={expenseData.description}
                                    onChange={e => setExpenseData({...expenseData, description: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Valor (R$)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
                                    value={expenseData.amount}
                                    onChange={e => setExpenseData({...expenseData, amount: Number(e.target.value)})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Data</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
                                    value={expenseData.date}
                                    onChange={e => setExpenseData({...expenseData, date: e.target.value})}
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                            <button onClick={() => setShowExpenseModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancelar</button>
                            <button onClick={handleExpenseSubmit} className="px-6 py-2 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-500 transition shadow-lg shadow-rose-500/20">
                                Lançar Despesa
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Ficha Clínica */}
            {showClinicalModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                            <h3 className="text-xl font-bold text-white flex items-center gap-2 font-tech">
                                <Stethoscope className="text-rose-500" /> FICHA CLÍNICA
                            </h3>
                            <button onClick={() => setShowClinicalModal(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Condição Clínica</label>
                                <textarea 
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-rose-500 outline-none h-32"
                                    placeholder="Descreva o quadro do paciente..."
                                    value={clinicalData.clinicalCondition}
                                    onChange={e => setClinicalData({...clinicalData, clinicalCondition: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Comorbidades</label>
                                    <select 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none mb-2"
                                        value={clinicalData.hasComorbidities ? 'Sim' : 'Não'}
                                        onChange={e => setClinicalData({...clinicalData, hasComorbidities: e.target.value === 'Sim'})}
                                    >
                                        <option>Não</option>
                                        <option>Sim</option>
                                    </select>
                                    {clinicalData.hasComorbidities && (
                                        <input 
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
                                            placeholder="Descreva..."
                                            value={clinicalData.comorbiditiesDescription}
                                            onChange={e => setClinicalData({...clinicalData, comorbiditiesDescription: e.target.value})}
                                        />
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Alergias</label>
                                    <select 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none mb-2"
                                        value={clinicalData.hasAllergies ? 'Sim' : 'Não'}
                                        onChange={e => setClinicalData({...clinicalData, hasAllergies: e.target.value === 'Sim'})}
                                    >
                                        <option>Não</option>
                                        <option>Sim</option>
                                    </select>
                                    {clinicalData.hasAllergies && (
                                        <input 
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none"
                                            placeholder="Descreva..."
                                            value={clinicalData.allergiesDescription}
                                            onChange={e => setClinicalData({...clinicalData, allergiesDescription: e.target.value})}
                                        />
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Medicamentos em Uso</label>
                                <textarea 
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white outline-none h-24"
                                    placeholder="Listar medicamentos e posologia..."
                                    value={clinicalData.medications}
                                    onChange={e => setClinicalData({...clinicalData, medications: e.target.value})}
                                />
                            </div>

                            <div className="bg-cyan-900/10 p-4 rounded-xl border border-cyan-500/20">
                                <h4 className="text-sm font-bold text-cyan-400 mb-3">MÉDICO RESPONSÁVEL</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <input 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none"
                                        placeholder="Nome do Médico"
                                        value={clinicalData.physicianName}
                                        onChange={e => setClinicalData({...clinicalData, physicianName: e.target.value})}
                                    />
                                    <input 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white outline-none"
                                        placeholder="Contato / CRM"
                                        value={clinicalData.physicianContact}
                                        onChange={e => setClinicalData({...clinicalData, physicianContact: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3 sticky bottom-0">
                            <button onClick={() => setShowClinicalModal(false)} className="px-4 py-2 text-slate-400 hover:text-white font-medium">Cancelar</button>
                            <button onClick={handleClinicalSubmit} className="px-6 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shadow-lg shadow-rose-500/20 transition">
                                Salvar Ficha Clínica
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Prontuário Médico */}
            {showMedicalRecordModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-4xl border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5 sticky top-0 z-10 backdrop-blur-md">
                             <h3 className="text-xl font-bold text-white flex items-center gap-2 font-tech">
                                <ClipboardList className="text-blue-500" /> PRONTUÁRIO INTEGRADO
                             </h3>
                            <button onClick={() => setShowMedicalRecordModal(false)} className="text-slate-400 hover:text-white"><X size={24}/></button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            
                            {/* Linha 1: Prescrições */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-blue-400 uppercase mb-2 flex items-center gap-1">
                                        <User size={14} /> Prescrição Médica
                                    </label>
                                    <textarea 
                                        className="w-full bg-blue-900/10 border border-blue-500/20 rounded-lg p-3 text-blue-100 focus:ring-1 focus:ring-blue-500 outline-none h-40 resize-none font-mono text-sm"
                                        placeholder="Digite a prescrição médica..."
                                        value={medicalData.medicalPrescription}
                                        onChange={e => setMedicalData({...medicalData, medicalPrescription: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-violet-400 uppercase mb-2 flex items-center gap-1">
                                        <User size={14} /> Prescrição de Enfermagem
                                    </label>
                                    <textarea 
                                        className="w-full bg-violet-900/10 border border-violet-500/20 rounded-lg p-3 text-violet-100 focus:ring-1 focus:ring-violet-500 outline-none h-40 resize-none font-mono text-sm"
                                        placeholder="Digite a prescrição de enfermagem..."
                                        value={medicalData.nursingPrescription}
                                        onChange={e => setMedicalData({...medicalData, nursingPrescription: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Linha 2: Evoluções */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Evolução Médica</label>
                                    <textarea 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-blue-500 outline-none h-32 text-sm"
                                        placeholder="Registro da evolução médica..."
                                        value={medicalData.medicalEvolution}
                                        onChange={e => setMedicalData({...medicalData, medicalEvolution: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Evolução de Enfermagem</label>
                                    <textarea 
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-blue-500 outline-none h-32 text-sm"
                                        placeholder="Registro da evolução de enfermagem..."
                                        value={medicalData.nursingEvolution}
                                        onChange={e => setMedicalData({...medicalData, nursingEvolution: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Linha 3: Anotações Gerais */}
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Anotações Gerais de Enfermagem</label>
                                <textarea 
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-1 focus:ring-blue-500 outline-none h-24 text-sm"
                                    placeholder="Outras anotações pertinentes..."
                                    value={medicalData.nursingNotes}
                                    onChange={e => setMedicalData({...medicalData, nursingNotes: e.target.value})}
                                />
                            </div>
                            
                            {/* Anexos */}
                            <div className="bg-slate-800/50 border border-white/5 rounded-xl p-4">
                                <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                                    <Paperclip size={16} /> Anexos e Exames
                                </h4>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        {medicalData.attachments.length > 0 ? medicalData.attachments.map((file, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-slate-900 p-2 rounded border border-white/10 shadow-sm">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <FileText size={16} className="text-red-400 shrink-0"/>
                                                    <span className="text-sm text-slate-300 truncate">{file.name}</span>
                                                </div>
                                                <button 
                                                    onClick={() => {
                                                        const newAtt = medicalData.attachments.filter((_, i) => i !== idx);
                                                        setMedicalData({...medicalData, attachments: newAtt});
                                                    }}
                                                    className="text-slate-500 hover:text-red-400"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        )) : (
                                            <p className="text-sm text-slate-500 italic">Nenhum arquivo anexado.</p>
                                        )}
                                    </div>
                                    
                                    <div className="border-2 border-dashed border-blue-500/30 bg-blue-900/10 rounded-lg p-4 flex flex-col items-center justify-center text-center cursor-pointer relative group hover:bg-blue-900/20 transition">
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            accept=".pdf"
                                            onChange={handleFileUpload}
                                        />
                                        <Upload size={24} className="text-blue-500 mb-2"/>
                                        <span className="text-sm font-bold text-blue-400">Adicionar PDF</span>
                                        <span className="text-xs text-blue-500/70">Exames ou Documentos</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <div className="p-6 border-t border-white/10 bg-white/5 flex justify-end gap-3 sticky bottom-0">
                            <button onClick={() => setShowMedicalRecordModal(false)} className="px-4 py-2 text-slate-400 hover:text-white font-medium">Cancelar</button>
                            <button onClick={handleMedicalSubmit} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 transition flex items-center gap-2">
                                <CheckSquare size={18} /> Salvar Prontuário
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação de Exclusão */}
             {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 p-6 rounded-xl max-w-sm text-center shadow-2xl border border-white/10">
                        <div className="w-12 h-12 bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">CONFIRMAR EXCLUSÃO</h3>
                        <p className="text-slate-400 mb-6">Deseja realmente excluir este paciente? Esta ação não pode ser desfeita.</p>
                        <div className="flex gap-4 justify-center">
                            <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-slate-400 hover:bg-white/5 rounded-lg transition font-medium">Cancelar</button>
                            <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-500 transition font-bold shadow-lg shadow-rose-500/20">Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  }

  // === LIST VIEW ===
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-tech font-bold text-white tracking-wide">PACIENTES</h2>
        <div className="flex gap-2">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="BUSCAR SISTEMA..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-white placeholder-slate-600 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition shadow-[0_0_15px_rgba(8,145,178,0.4)] font-bold tracking-wide"
          >
            <Plus size={20} /> NOVO
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider border-b border-white/5">
              <tr>
                <th className="p-4 font-bold">Paciente</th>
                <th className="p-4 font-bold">Responsável Financeiro</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Contrato Atual</th>
                <th className="p-4 font-bold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredPatients.map(patient => {
                const contract = contracts.find(c => c.patientId === patient.id);
                return (
                  <tr key={patient.id} className="hover:bg-white/5 transition group">
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400 font-bold border border-white/10">
                                {patient.name.charAt(0)}
                            </div>
                            <div>
                                <button 
                                    onClick={() => setSelectedPatientId(patient.id)}
                                    className="font-bold text-white hover:text-cyan-400 text-lg capitalize transition-colors"
                                >
                                    {patient.name}
                                </button>
                                {patient.document && (
                                    <div className="flex items-center gap-1 text-xs text-cyan-500/70 mt-1">
                                        <Paperclip size={12} />
                                        <span className="truncate max-w-[150px]">{patient.document}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="flex items-center gap-3">
                            <div>
                                <p className="font-medium text-slate-300 capitalize">{patient.financialResponsible}</p>
                                <p className="text-xs text-slate-500 font-mono">{patient.financialResponsibleContact}</p>
                            </div>
                        </div>
                    </td>
                    <td className="p-4">
                        <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border ${
                            patient.status === 'Ativo' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : 'bg-slate-700/50 text-slate-400 border-slate-600'
                        }`}>
                            {patient.status}
                        </span>
                    </td>
                    <td className="p-4">
                        <div className="text-sm">
                            <p className="font-bold text-white font-mono">
                                {contract?.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </p>
                            <p className="text-slate-500 text-xs">
                                {contract?.shiftsPerMonth} Plantões • Início: {new Date(contract?.startDate || '').toLocaleDateString('pt-BR')}
                            </p>
                        </div>
                    </td>
                    <td className="p-4 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                           <button 
                               onClick={() => handleEditClick(patient)}
                               className="p-2 text-cyan-400 hover:bg-cyan-400/10 rounded transition"
                           >
                               <Edit size={18} />
                           </button>
                           <button 
                               onClick={() => setShowDeleteConfirm(patient.id)}
                               className="p-2 text-rose-400 hover:bg-rose-400/10 rounded transition"
                           >
                               <Trash2 size={18} />
                           </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
