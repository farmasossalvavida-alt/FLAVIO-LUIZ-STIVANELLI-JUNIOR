
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Clock, User, Briefcase, X, Check, Trash2, Repeat, Settings } from 'lucide-react';
import { Shift, Patient, Employee } from '../types';

interface ShiftManagementViewProps {
  shifts: Shift[];
  patients: Patient[];
  employees: Employee[];
  onAddShift: (shift: Shift) => void;
  onAddShifts: (shifts: Shift[]) => void;
  onUpdateShift: (shift: Shift) => void;
  onDeleteShift: (id: string) => void;
}

export const ShiftManagementView: React.FC<ShiftManagementViewProps> = ({
  shifts,
  patients,
  employees,
  onAddShift,
  onAddShifts,
  onUpdateShift,
  onDeleteShift
}) => {
  // State for Calendar Navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // State for Filters
  const [selectedPatientFilter, setSelectedPatientFilter] = useState<string>('');

  // State for Modals
  const [showModal, setShowModal] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    patientId: '',
    employeeId: '',
    date: '',
    startTime: '07:00',
    endTime: '19:00',
    status: 'Agendado' as Shift['status'],
    notes: '',
    repeatCount: 1,
    scaleType: 'Diário' // Novo campo de escala
  });

  // --- CALENDAR LOGIC ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  // --- HANDLERS ---
  const handleDayClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setFormData({
      patientId: selectedPatientFilter || '', // Pre-fill if filter is active
      employeeId: '',
      date: dateStr,
      startTime: '07:00',
      endTime: '19:00',
      status: 'Agendado',
      notes: '',
      repeatCount: 1,
      scaleType: 'Diário'
    });
    setEditingShift(null);
    setShowModal(true);
  };

  const handleShiftClick = (e: React.MouseEvent, shift: Shift) => {
    e.stopPropagation();
    setEditingShift(shift);
    setFormData({
      patientId: shift.patientId,
      employeeId: shift.employeeId,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      status: shift.status,
      notes: shift.notes || '',
      repeatCount: shift.repeatCount || 1,
      scaleType: 'Diário'
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.patientId || !formData.employeeId || !formData.date) return;

    if (editingShift) {
      // Edição de um único plantão
      onUpdateShift({
        ...editingShift,
        patientId: formData.patientId,
        employeeId: formData.employeeId,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: formData.status,
        notes: formData.notes,
        repeatCount: formData.repeatCount
      });
    } else {
      // Criação de novos plantões com lógica de ESCALA e BATCH INSERT
      const targetCount = formData.repeatCount > 0 ? formData.repeatCount : 1;
      const newShiftsBuffer: Shift[] = [];
      
      // Parse da data inicial sem problemas de timezone
      const [sYear, sMonth, sDay] = formData.date.split('-').map(Number);
      const startDate = new Date(sYear, sMonth - 1, sDay);
      
      let shiftsCreated = 0;
      let currentDayOffset = 0;
      let safetyCounter = 0;

      // Loop até criar o número desejado de plantões
      while (shiftsCreated < targetCount && safetyCounter < 1000) {
        // Calcular data candidata
        const candidateDate = new Date(startDate);
        candidateDate.setDate(startDate.getDate() + currentDayOffset);
        
        // Verificar se a data deve receber um plantão com base na escala
        let shouldAdd = false;
        
        if (formData.scaleType === 'Diário') {
            shouldAdd = true;
            // Para o próximo loop
            if (shiftsCreated + 1 < targetCount) currentDayOffset += 1;
        } 
        else if (formData.scaleType === '12x36' || formData.scaleType === '24x24') {
            shouldAdd = true;
            // Pula 1 dia (trabalha d0, folga d1, trabalha d2)
            if (shiftsCreated + 1 < targetCount) currentDayOffset += 2;
        } 
        else if (formData.scaleType === '24x48') {
            shouldAdd = true;
            // Pula 2 dias (trabalha d0, folga d1 e d2, trabalha d3)
            if (shiftsCreated + 1 < targetCount) currentDayOffset += 3;
        }
        else if (formData.scaleType === '5x2') {
            // Escala 5x2 (Geralmente Seg-Sex, folga Sáb/Dom)
            // Se o dia for Sábado (6) ou Domingo (0), não adiciona, mas avança o offset
            const dayOfWeek = candidateDate.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                shouldAdd = true;
                shiftsCreated++; // Incrementa contador apenas se adicionou
            }
            // Sempre avança 1 dia no calendário
            currentDayOffset += 1;
        }

        if (shouldAdd && formData.scaleType !== '5x2') {
             shiftsCreated++;
        }

        if (shouldAdd) {
            const y = candidateDate.getFullYear();
            const m = String(candidateDate.getMonth() + 1).padStart(2, '0');
            const d = String(candidateDate.getDate()).padStart(2, '0');
            const dateStr = `${y}-${m}-${d}`;

            newShiftsBuffer.push({
              id: Math.random().toString(36).substr(2, 9),
              patientId: formData.patientId,
              employeeId: formData.employeeId,
              date: dateStr,
              startTime: formData.startTime,
              endTime: formData.endTime,
              status: formData.status,
              notes: formData.notes,
              repeatCount: targetCount > 1 ? targetCount : undefined
            });
        }
        safetyCounter++;
      }
      
      // Batch Insert
      if (newShiftsBuffer.length > 0) {
          onAddShifts(newShiftsBuffer);
      }
    }
    setShowModal(false);
  };

  const handleDelete = () => {
    if (editingShift) {
      onDeleteShift(editingShift.id);
      setShowModal(false);
    }
  };

  // --- RENDER HELPERS ---
  const getShiftsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let dayShifts = shifts.filter(s => s.date === dateStr);
    
    // Aplicar filtro de paciente se selecionado
    if (selectedPatientFilter) {
        dayShifts = dayShifts.filter(s => s.patientId === selectedPatientFilter);
    }
    
    return dayShifts;
  };

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <CalendarIcon className="text-blue-600 dark:text-blue-400" /> Gestão de Escalas
            </h2>
            
            {/* Patient Filter */}
            <div className="ml-4">
                <select 
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-200 outline-none focus:ring-2 focus:ring-blue-500"
                    value={selectedPatientFilter}
                    onChange={(e) => setSelectedPatientFilter(e.target.value)}
                >
                    <option value="">Todos os Pacientes</option>
                    {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
            </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
          <span className="text-lg font-bold text-gray-800 dark:text-white w-40 text-center">
            {monthNames[month]} {year}
          </span>
          <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
            <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <button 
          onClick={() => {
             const today = new Date();
             const dateStr = today.toISOString().slice(0, 10);
             setFormData({
                 ...formData, 
                 date: dateStr, 
                 patientId: selectedPatientFilter || '', 
                 employeeId: '', 
                 repeatCount: 1, 
                 scaleType: 'Diário'
             });
             setEditingShift(null);
             setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-sm"
        >
          <Plus size={20} /> Novo Plantão
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
          {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto">
          {blanksArray.map(blank => (
            <div key={`blank-${blank}`} className="bg-gray-50/30 dark:bg-gray-800/50 border-r border-b border-gray-100 dark:border-gray-700 min-h-[100px]" />
          ))}
          
          {daysArray.map(day => {
            const dayShifts = getShiftsForDay(day);
            const isToday = 
                day === new Date().getDate() && 
                month === new Date().getMonth() && 
                year === new Date().getFullYear();

            return (
              <div 
                key={day} 
                onClick={() => handleDayClick(day)}
                className={`border-r border-b border-gray-100 dark:border-gray-700 p-2 min-h-[120px] cursor-pointer hover:bg-blue-50/30 dark:hover:bg-gray-700/30 transition relative group ${isToday ? 'bg-blue-50/20 dark:bg-blue-900/10' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {day}
                  </span>
                  <Plus size={16} className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="space-y-1">
                  {dayShifts.map(shift => {
                    const patient = patients.find(p => p.id === shift.patientId);
                    const employee = employees.find(e => e.id === shift.employeeId);
                    
                    let statusColor = 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
                    if (shift.status === 'Realizado') statusColor = 'bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
                    if (shift.status === 'Cancelado') statusColor = 'bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
                    if (shift.status === 'Falta') statusColor = 'bg-orange-50 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';

                    // Abbreviate names
                    const patientName = patient ? patient.name.split(' ')[0] : '???';
                    const employeeName = employee ? employee.name.split(' ')[0] : '???';

                    return (
                      <div 
                        key={shift.id}
                        onClick={(e) => handleShiftClick(e, shift)}
                        className={`text-xs p-1.5 rounded border ${statusColor} cursor-pointer hover:opacity-80 transition shadow-sm`}
                        title={`${shift.startTime} - ${patient?.name} (${employee?.name})`}
                      >
                         <div className="font-bold border-b border-black/10 dark:border-white/10 pb-0.5 mb-0.5 flex justify-between">
                            <span>{shift.startTime}</span>
                            {shift.repeatCount && shift.repeatCount > 1 && <Repeat size={10} />}
                         </div>
                         <div className="flex items-center gap-1 truncate font-medium">
                            <User size={10} className="opacity-70" />
                            <span>{patientName}</span>
                         </div>
                         <div className="flex items-center gap-1 truncate opacity-80 text-[10px]">
                            <Briefcase size={10} className="opacity-70" />
                            <span>{employeeName}</span>
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 transition-colors">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingShift ? 'Editar Plantão' : 'Agendar Plantão'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Paciente</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                        className="w-full pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 outline-none text-gray-800 dark:text-white appearance-none"
                        value={formData.patientId}
                        onChange={e => setFormData({...formData, patientId: e.target.value})}
                    >
                        <option value="">Selecione o Paciente</option>
                        {patients.filter(p => p.status === 'Ativo').map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Profissional</label>
                <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <select 
                        className="w-full pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 outline-none text-gray-800 dark:text-white appearance-none"
                        value={formData.employeeId}
                        onChange={e => setFormData({...formData, employeeId: e.target.value})}
                    >
                        <option value="">Selecione o Colaborador</option>
                        {employees.filter(e => e.status === 'Ativo').map(e => (
                        <option key={e.id} value={e.id}>{e.name} - {e.role}</option>
                        ))}
                    </select>
                </div>
              </div>

              {/* Data, Escala e Recorrência */}
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Data Inicial</label>
                 <input 
                    type="date"
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 outline-none text-gray-800 dark:text-white"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                 />
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo de Escala</label>
                    <div className="relative">
                        <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <select 
                            className={`w-full pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 outline-none text-gray-800 dark:text-white appearance-none ${editingShift ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={formData.scaleType}
                            onChange={e => setFormData({...formData, scaleType: e.target.value})}
                            disabled={!!editingShift}
                        >
                            <option value="Diário">Diário (Todo dia)</option>
                            <option value="12x36">12x36 (Dia Sim/Não)</option>
                            <option value="24x24">24x24 (Dia Sim/Não)</option>
                            <option value="24x48">24x48 (1 Trab, 2 Folga)</option>
                            <option value="5x2">5x2 (Seg a Sex)</option>
                        </select>
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nº Plantões</label>
                    <div className="relative">
                        <Repeat className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="number"
                            min="1"
                            max="60"
                            className={`w-full pl-10 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 outline-none text-gray-800 dark:text-white ${editingShift ? 'opacity-50 cursor-not-allowed' : ''}`}
                            value={formData.repeatCount}
                            onChange={e => setFormData({...formData, repeatCount: Number(e.target.value)})}
                            disabled={!!editingShift} 
                        />
                    </div>
                 </div>
              </div>

              {/* Horários */}
              <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Início</label>
                    <input 
                        type="time"
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 outline-none text-gray-800 dark:text-white"
                        value={formData.startTime}
                        onChange={e => setFormData({...formData, startTime: e.target.value})}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fim</label>
                    <input 
                        type="time"
                        className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 outline-none text-gray-800 dark:text-white"
                        value={formData.endTime}
                        onChange={e => setFormData({...formData, endTime: e.target.value})}
                    />
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <div className="flex gap-2 bg-gray-50 dark:bg-gray-700 p-1 rounded-lg">
                    {['Agendado', 'Realizado', 'Cancelado', 'Falta'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFormData({...formData, status: status as any})}
                            className={`flex-1 text-xs py-2 rounded-md transition font-medium ${
                                formData.status === status 
                                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm' 
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
              </div>

              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Observações</label>
                 <textarea 
                    className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 outline-none text-gray-800 dark:text-white h-20"
                    placeholder="Detalhes adicionais..."
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                 />
              </div>

            </div>
            
            <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-between rounded-b-xl">
               {editingShift ? (
                   <button 
                    onClick={handleDelete}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition flex items-center gap-2"
                   >
                     <Trash2 size={18} /> Excluir
                   </button>
               ) : <div />}
               
               <div className="flex gap-3">
                    <button onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition">Cancelar</button>
                    <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-sm flex items-center gap-2">
                        <Check size={18} /> Salvar
                    </button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
