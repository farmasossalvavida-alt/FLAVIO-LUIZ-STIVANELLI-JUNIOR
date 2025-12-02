import React, { useState } from 'react';
import { Plus, Search, Phone, CreditCard, FileCheck, Shield, X, ArrowLeft, Briefcase, Mail, Upload, Edit, Trash2, Calendar, User, AlertTriangle } from 'lucide-react';
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
  const [formData, setFormData] = useState({ name: '', role: 'Téc. Enfermagem', phone: '', pixKey: '', professionalRegister: '', skills: '' });

  const resetForm = () => { setFormData({ name: '', role: 'Téc. Enfermagem', phone: '', pixKey: '', professionalRegister: '', skills: '' }); };
  const handleSaveNew = () => {
    const newEmp: Employee = { id: Math.random().toString(36).substr(2, 9), name: formData.name, phone: formData.phone, role: formData.role, pixKey: formData.pixKey, professionalRegister: formData.professionalRegister, admissionDate: new Date().toISOString(), documents: [], skills: formData.skills.split(','), status: 'Ativo' };
    onAddEmployee(newEmp); setShowModal(false); resetForm();
  };

  const filtered = employees.filter(e => e.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-tech font-bold text-white drop-shadow-lg">COLABORADORES</h2>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="bg-pastel-pink/20 text-pastel-pink border border-pastel-pink/50 px-6 py-2 rounded-lg hover:shadow-[0_0_15px_rgba(249,168,212,0.4)] transition font-bold flex items-center gap-2">
            <Plus size={20} /> NOVO
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(emp => (
            <div key={emp.id} className="neon-card p-6 rounded-xl group relative overflow-hidden">
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                        <h3 className="font-bold text-white text-lg group-hover:text-pastel-blue transition-colors">{emp.name}</h3>
                        <p className="text-sm text-slate-400">{emp.role}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-bold ${emp.status === 'Ativo' ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-400 bg-slate-700'}`}>{emp.status}</span>
                </div>
                <div className="space-y-2 text-sm text-slate-300 relative z-10">
                    <div className="flex items-center gap-2"><Phone size={14} className="text-pastel-pink"/> {emp.phone}</div>
                    <div className="flex items-center gap-2"><Shield size={14} className="text-pastel-blue"/> {emp.professionalRegister}</div>
                </div>
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-pastel-blue/10 transition-all duration-500"></div>
            </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="neon-card bg-slate-900 rounded-xl w-full max-w-lg shadow-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Novo Colaborador</h3>
            <div className="space-y-4">
                <input className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white" placeholder="Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input className="w-full bg-slate-800 border-slate-700 rounded-lg p-3 text-white" placeholder="Telefone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <button onClick={handleSaveNew} className="w-full bg-pastel-pink text-slate-900 font-bold py-3 rounded-lg hover:shadow-[0_0_15px_#f9a8d4] transition">Cadastrar</button>
            </div>
             <button onClick={() => setShowModal(false)} className="w-full mt-2 text-slate-400">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};