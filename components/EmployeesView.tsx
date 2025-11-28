
import React, { useState, useEffect } from 'react';
import { Plus, Search, Phone, CreditCard, FileCheck, Shield, X, ArrowLeft, Briefcase, Mail, Upload, Paperclip, FileText, CheckCircle, Edit, Save, Trash2, Calendar, DollarSign, User, AlertTriangle } from 'lucide-react';
import { Employee, Patient, PatientEmployeeLink } from '../types';

interface EmployeesViewProps {
  employees: Employee[];
  patients: Patient[];
  onAddEmployee: (e: Employee) => void;
  onUpdateEmployee: (e: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onLinkPatient: (patientId: string, link: PatientEmployeeLink) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({ employees, patients, onAddEmployee, onUpdateEmployee, onDeleteEmployee, onLinkPatient }) => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  // Create State
  const [formData, setFormData] = useState({
    name: '',
    role: 'Téc. Enfermagem',
    phone: '',
    pixKey: '',
    professionalRegister: '',
    skills: ''
  });

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<Employee | null>(null);

  // Link Patient State
  const [linkData, setLinkData] = useState({
    patientId: '',
    shiftsCount: 0,
    valuePerShift: 0
  });

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

  // Sync edit form data when entering edit mode
  useEffect(() => {
    if (selectedEmployee) {
        setEditFormData(selectedEmployee);
    }
  }, [selectedEmployee, isEditing]);

  const resetForm = () => {
    setFormData({
        name: '',
        role: 'Téc. Enfermagem',
        phone: '',
        pixKey: '',
        professionalRegister: '',
        skills: ''
    });
  };

  const handleSaveNew = () => {
    const newEmp: Employee = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        phone: formData.phone || '(00) 00000-0000',
        role: formData.role,
        pixKey: formData.pixKey,
        professionalRegister: formData.professionalRegister,
        admissionDate: new Date().toISOString(),
        documents: [], 
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s !== ''),
        status: 'Ativo'
    };
    onAddEmployee(newEmp);
    setShowModal(false);
    resetForm();
  };

  const handleUploadContract = (file: File) => {
    if (!selectedEmployeeId) return;
    const emp = employees.find(e => e.id === selectedEmployeeId);
    if (emp) {
        const updatedEmp = {
            ...emp,
            documents: [...emp.documents, { name: file.name, uploaded: true }]
        };
        onUpdateEmployee(updatedEmp);
    }
  };

  const handleSaveChanges = () => {
     if (editFormData) {
         onUpdateEmployee(editFormData);
         setIsEditing(false);
     }
  };

  const handleDeleteConfirm = () => {
    if (showDeleteConfirm) {
        onDeleteEmployee(showDeleteConfirm);
        setShowDeleteConfirm(null);
        setSelectedEmployeeId(null); // Return to list if deleting viewed employee
    }
  };

  const handleAddShiftLink = () => {
      if (!selectedEmployee || !linkData.patientId) return;

      const newLink: PatientEmployeeLink = {
          id: Math.random().toString(36).substr(2, 9),
          employeeId: selectedEmployee.id,
          employeeName: selectedEmployee.name,
          shiftsCount: linkData.shiftsCount,
          valuePerShift: linkData.valuePerShift
      };

      onLinkPatient(linkData.patientId, newLink);
      
      // Reset form
      setLinkData({ patientId: '', shiftsCount: 0, valuePerShift: 0 });
  };

  // Derived: Patients linked to this employee
  const linkedPatients = patients.filter(p => 
      p.linkedEmployees?.some(link => link.employeeId === selectedEmployeeId)
  );

  const filtered = employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // ================= VIEW PROFILE (DETAIL) =================
  if (selectedEmployee && editFormData) {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => {
                            setSelectedEmployeeId(null);
                            setIsEditing(false);
                        }}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition"
                    >
                        <ArrowLeft size={24} className="text-gray-600 dark:text-gray-300"/>
                    </button>
                    <div>
                        {isEditing ? (
                            <input 
                                type="text"
                                className="text-2xl font-bold text-gray-800 dark:text-white bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 outline-none w-full capitalize"
                                value={editFormData.name}
                                onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                            />
                        ) : (
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white capitalize">{selectedEmployee.name}</h2>
                        )}
                        
                        <div className="flex items-center gap-2 mt-1">
                            {isEditing ? (
                                <select
                                    className="text-sm bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-0.5 outline-none text-gray-800 dark:text-gray-200"
                                    value={editFormData.role}
                                    onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                                >
                                    <option>Enfermeiro(a)</option>
                                    <option>Téc. Enfermagem</option>
                                    <option>Fisioterapeuta</option>
                                    <option>Fonoaudiólogo(a)</option>
                                    <option>Cuidador(a)</option>
                                </select>
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedEmployee.role}</p>
                            )}
                            <span className="text-gray-400">•</span>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Admissão: {new Date(selectedEmployee.admissionDate).toLocaleDateString('pt-BR')}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isEditing ? (
                        <>
                             <select
                                className="px-3 py-1.5 rounded-lg text-sm font-bold bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none text-gray-800 dark:text-white"
                                value={editFormData.status}
                                onChange={(e) => setEditFormData({...editFormData, status: e.target.value as any})}
                            >
                                <option value="Ativo">Ativo</option>
                                <option value="Inativo">Inativo</option>
                                <option value="Ferias">Férias</option>
                            </select>
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveChanges}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center gap-2 shadow-sm"
                            >
                                <Save size={18} /> Salvar
                            </button>
                        </>
                    ) : (
                        <>
                             <span className={`px-3 py-1 rounded-full text-sm font-bold ${selectedEmployee.status === 'Ativo' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'}`}>
                                {selectedEmployee.status}
                            </span>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 font-medium flex items-center gap-2 transition"
                            >
                                <Edit size={18} /> Editar
                            </button>
                            <button 
                                onClick={() => setShowDeleteConfirm(selectedEmployee.id)}
                                className="px-4 py-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 font-medium flex items-center gap-2 transition"
                            >
                                <Trash2 size={18} /> Excluir
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Info Card */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4 h-fit">
                    <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Briefcase size={20} className="text-blue-600 dark:text-blue-400"/> Dados Profissionais
                    </h3>
                    
                    <div className="space-y-4 text-sm">
                        <div className="border-b border-gray-50 dark:border-gray-700 pb-3">
                            <span className="block text-gray-500 dark:text-gray-400 mb-1">Telefone / WhatsApp</span>
                            {isEditing ? (
                                <input 
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 outline-none text-gray-800 dark:text-white"
                                    value={editFormData.phone}
                                    onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                                />
                            ) : (
                                <span className="font-medium text-gray-800 dark:text-gray-200">{selectedEmployee.phone}</span>
                            )}
                        </div>
                        
                        <div className="border-b border-gray-50 dark:border-gray-700 pb-3">
                            <span className="block text-gray-500 dark:text-gray-400 mb-1">Chave PIX</span>
                            {isEditing ? (
                                <input 
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 outline-none text-gray-800 dark:text-white"
                                    value={editFormData.pixKey}
                                    onChange={(e) => setEditFormData({...editFormData, pixKey: e.target.value})}
                                />
                            ) : (
                                <span className="font-medium text-gray-800 dark:text-gray-200">{selectedEmployee.pixKey}</span>
                            )}
                        </div>

                        <div className="border-b border-gray-50 dark:border-gray-700 pb-3">
                            <span className="block text-gray-500 dark:text-gray-400 mb-1">Registro (COREN/CRM)</span>
                            {isEditing ? (
                                <input 
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 outline-none text-gray-800 dark:text-white uppercase"
                                    value={editFormData.professionalRegister}
                                    onChange={(e) => setEditFormData({...editFormData, professionalRegister: e.target.value})}
                                />
                            ) : (
                                <span className="font-medium text-gray-800 dark:text-gray-200 uppercase">{selectedEmployee.professionalRegister}</span>
                            )}
                        </div>
                    </div>

                    <div className="pt-2">
                        <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Competências</h4>
                        {isEditing ? (
                             <div>
                                <input 
                                    type="text"
                                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-2 py-1.5 outline-none text-gray-800 dark:text-white capitalize text-sm"
                                    placeholder="Separe por vírgula"
                                    value={editFormData.skills.join(', ')}
                                    onChange={(e) => setEditFormData({
                                        ...editFormData, 
                                        skills: e.target.value.split(',').map(s => s.trim())
                                    })}
                                    onBlur={(e) => setEditFormData({
                                        ...editFormData,
                                        skills: e.target.value.split(',').map(s => s.trim()).filter(s => s !== '')
                                    })}
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Separe as habilidades por vírgula.</p>
                             </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {selectedEmployee.skills.length > 0 ? selectedEmployee.skills.map(skill => (
                                    <span key={skill} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 capitalize">
                                        {skill}
                                    </span>
                                )) : <span className="text-gray-400 text-xs italic">Nenhuma registrada</span>}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column (Documents & Shifts) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Shift Management Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                            <Calendar size={20} className="text-green-600 dark:text-green-400"/> Pacientes e Plantões
                        </h3>
                        
                        {/* List of Linked Patients */}
                        {linkedPatients.length > 0 ? (
                            <div className="overflow-x-auto mb-6">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                        <tr>
                                            <th className="p-3 rounded-l-lg">Paciente</th>
                                            <th className="p-3">Valor/Plantão</th>
                                            <th className="p-3">Qtd Plantões</th>
                                            <th className="p-3 rounded-r-lg text-right">Valor Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                                        {linkedPatients.map(p => {
                                            const link = p.linkedEmployees?.find(l => l.employeeId === selectedEmployeeId);
                                            if (!link) return null;
                                            return (
                                                <tr key={p.id + link.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="p-3 font-medium text-gray-800 dark:text-gray-200 capitalize">{p.name}</td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">
                                                        {link.valuePerShift.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </td>
                                                    <td className="p-3 text-gray-600 dark:text-gray-400">{link.shiftsCount}</td>
                                                    <td className="p-3 text-right font-bold text-green-600 dark:text-green-400">
                                                        {(link.valuePerShift * link.shiftsCount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 italic bg-gray-50 dark:bg-gray-700/50 p-3 rounded">
                                Nenhum paciente vinculado a este colaborador.
                            </p>
                        )}

                        {/* Add New Link Form */}
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase flex items-center gap-2">
                                <Plus size={16} /> Adicionar Novo Plantão
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Paciente</label>
                                    <select 
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm outline-none text-gray-800 dark:text-gray-200"
                                        value={linkData.patientId}
                                        onChange={e => setLinkData({...linkData, patientId: e.target.value})}
                                    >
                                        <option value="">Selecione...</option>
                                        {patients.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Valor Plantão (R$)</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm outline-none text-gray-800 dark:text-gray-200"
                                        value={linkData.valuePerShift}
                                        onChange={e => setLinkData({...linkData, valuePerShift: Number(e.target.value)})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Nº Plantões</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-2 text-sm outline-none text-gray-800 dark:text-gray-200"
                                        value={linkData.shiftsCount}
                                        onChange={e => setLinkData({...linkData, shiftsCount: Number(e.target.value)})}
                                    />
                                </div>
                                <div>
                                     <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Total (Calc)</label>
                                     <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-lg p-2 text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center justify-between">
                                        <span>R$</span>
                                        <span>{(linkData.valuePerShift * linkData.shiftsCount).toFixed(2)}</span>
                                     </div>
                                </div>
                            </div>
                            <div className="mt-3 flex justify-end">
                                <button 
                                    onClick={handleAddShiftLink}
                                    disabled={!linkData.patientId || linkData.valuePerShift <= 0}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                        !linkData.patientId || linkData.valuePerShift <= 0 
                                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed' 
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                                >
                                    Vincular Paciente
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Documents / Contract Card */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
                        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4">
                            <FileText size={20} className="text-purple-600 dark:text-purple-400"/> Contrato de Trabalho e Documentos
                        </h3>

                        <div className="flex-1 space-y-4">
                            {/* List of existing docs */}
                            {selectedEmployee.documents.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedEmployee.documents.map((doc, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-600 dark:text-red-400">
                                                    <FileText size={18} />
                                                </div>
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{doc.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-green-600 dark:text-green-400 flex items-center gap-1 text-xs font-bold">
                                                    <CheckCircle size={14} /> Anexado
                                                </span>
                                                {isEditing && (
                                                    <button 
                                                        onClick={() => {
                                                            const newDocs = editFormData.documents.filter((_, i) => i !== idx);
                                                            setEditFormData({...editFormData, documents: newDocs});
                                                        }}
                                                        className="text-gray-400 hover:text-red-500"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-400 dark:text-gray-500 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                                    <FileText size={32} className="mx-auto mb-2 opacity-50"/>
                                    <p>Nenhum documento anexado.</p>
                                </div>
                            )}

                            {/* Upload Area */}
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Importar Novo Documento (Contrato)</p>
                                <div className="border-2 border-dashed border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-blue-100 dark:hover:bg-blue-900/20 transition cursor-pointer relative group">
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept=".pdf"
                                        onChange={(e) => {
                                            if(e.target.files && e.target.files[0]) {
                                                handleUploadContract(e.target.files[0]);
                                            }
                                        }}
                                    />
                                    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                                        <Upload size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-blue-700 dark:text-blue-300">Clique para anexar o Contrato de Trabalho</p>
                                        <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">Apenas arquivos PDF</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 p-6 rounded-xl max-w-sm text-center shadow-2xl border border-white/10">
                        <div className="w-12 h-12 bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                            <AlertTriangle size={24} />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">EXCLUIR COLABORADOR</h3>
                        <p className="text-slate-400 mb-6 text-sm">Tem certeza? Isso removerá o colaborador de todos os vínculos com pacientes e excluirá plantões futuros.</p>
                        <div className="flex gap-4 justify-center">
                            <button onClick={() => setShowDeleteConfirm(null)} className="px-4 py-2 text-slate-400 hover:bg-white/5 rounded-lg transition font-medium">Cancelar</button>
                            <button onClick={handleDeleteConfirm} className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-500 transition font-bold shadow-lg shadow-rose-500/20">Confirmar Exclusão</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  }

  // ================= LIST VIEW =================
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Colaboradores (RH)</h2>
        <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                type="text" 
                placeholder="Buscar colaborador..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button 
                onClick={() => { resetForm(); setShowModal(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
            >
            <Plus size={18} /> Novo Colaborador
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(emp => (
            <div key={emp.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md transition-all group relative">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg capitalize">{emp.name}</h3>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{emp.role}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${emp.status === 'Ativo' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'}`}>
                        {emp.status}
                    </span>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-5 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center gap-2">
                        <Phone size={15} className="text-gray-400" /> {emp.phone}
                    </div>
                    <div className="flex items-center gap-2">
                        <CreditCard size={15} className="text-gray-400" /> PIX: <span className="font-mono">{emp.pixKey}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield size={15} className="text-gray-400" /> Reg: {emp.professionalRegister}
                    </div>
                </div>

                {/* Lista de Pacientes Vinculados (Substituindo Competências) */}
                {(() => {
                    const empPatients = patients.filter(p => p.linkedEmployees?.some(link => link.employeeId === emp.id));
                    return (
                        <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                            <p className="text-xs font-bold text-gray-500 dark:text-gray-500 mb-2 uppercase tracking-wide">Pacientes Atendidos</p>
                            <div className="flex flex-col gap-2">
                                {empPatients.length > 0 ? empPatients.map(p => (
                                    <div key={p.id} className="flex items-center gap-2 text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1.5 rounded-md border border-blue-100 dark:border-blue-900/30">
                                        <User size={14} />
                                        <span className="capitalize font-medium">{p.name}</span>
                                    </div>
                                )) : <span className="text-xs text-gray-400 italic">Disponível (Sem pacientes)</span>}
                            </div>
                        </div>
                    );
                })()}

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <FileCheck size={14} className={emp.documents.every(d => d.uploaded) && emp.documents.length > 0 ? "text-green-500" : "text-gray-400"} />
                        {emp.documents.filter(d => d.uploaded).length} Docs
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => {
                                setSelectedEmployeeId(emp.id);
                                setIsEditing(true); // Open directly in edit mode? Optional. Let's just open details.
                                // setIsEditing(true); 
                            }}
                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition"
                            title="Editar Perfil"
                        >
                            <Edit size={18}/>
                        </button>
                        <button 
                            onClick={() => setShowDeleteConfirm(emp.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                            title="Excluir Colaborador"
                        >
                            <Trash2 size={18} />
                        </button>
                         <button 
                            onClick={() => setSelectedEmployeeId(emp.id)}
                            className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline cursor-pointer ml-2"
                        >
                            Ver Perfil
                        </button>
                    </div>
                </div>
            </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 transition-colors max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-gray-900">Cadastrar Profissional</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                    <X size={24} />
                </button>
            </div>
            
            <div className="p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                    <input 
                        type="text" 
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none capitalize"
                        placeholder="Ex: Maria Oliveira"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Função / Cargo</label>
                        <select 
                            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            value={formData.role}
                            onChange={e => setFormData({...formData, role: e.target.value})}
                        >
                            <option>Enfermeiro(a)</option>
                            <option>Téc. Enfermagem</option>
                            <option>Fisioterapeuta</option>
                            <option>Fonoaudiólogo(a)</option>
                            <option>Cuidador(a)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                        <input 
                            type="text" 
                            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="(00) 00000-0000"
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Registro Profissional</label>
                        <input 
                            type="text" 
                            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                            placeholder="COREN/CRM..."
                            value={formData.professionalRegister}
                            onChange={e => setFormData({...formData, professionalRegister: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX</label>
                        <input 
                            type="text" 
                            className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="CPF, Email ou Aleatória"
                            value={formData.pixKey}
                            onChange={e => setFormData({...formData, pixKey: e.target.value})}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Competências / Habilidades</label>
                    <input 
                        type="text" 
                        className="w-full bg-white text-gray-900 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none capitalize"
                        placeholder="Ex: UTI, Sondas, Curativos (separar por vírgula)"
                        value={formData.skills}
                        onChange={e => setFormData({...formData, skills: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 mt-1">Separe as habilidades por vírgula.</p>
                </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-xl sticky bottom-0">
                <button onClick={() => setShowModal(false)} className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition">Cancelar</button>
                <button onClick={handleSaveNew} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">Cadastrar Colaborador</button>
            </div>
          </div>
        </div>
      )}

       {/* Delete Confirmation Modal (Added at end) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 p-6 rounded-xl max-w-sm text-center shadow-2xl border border-white/10">
                <div className="w-12 h-12 bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-rose-500">
                    <AlertTriangle size={24} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">EXCLUIR COLABORADOR</h3>
                <p className="text-slate-400 mb-6 text-sm">Tem certeza? Isso removerá o colaborador e desvinculará de todos os pacientes.</p>
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
