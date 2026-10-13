import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { AssistantHome } from './components/assistant/AssistantHome';
import { AgendaView } from './components/assistant/AgendaView';
import { PeopleView } from './components/assistant/PeopleView';
import { TasksView } from './components/assistant/TasksView';
import { MoreView } from './components/assistant/MoreView';
import { AuditLogView, AuditItem } from './components/assistant/AuditLogView';
import { TaskItem } from './types/tasks';
import { Dashboard } from './components/Dashboard';
import { PatientsView } from './components/PatientsView';
import { EmployeesView } from './components/EmployeesView';
import { FinanceView } from './components/FinanceView';
import { MonitoringView } from './components/MonitoringView';
import { ShiftManagementView } from './components/ShiftManagementView';
import { TimeCardView } from './components/TimeCardView';
import { AuthProvider, useAuth } from './context/AuthContext';
import { 
  Patient, Employee, Contract, FinanceRecord, MonthlyMonitoring, 
  ContractStatus, PaymentType, PaymentStatus, Shift, TimeRecord 
} from './types';

// Dados iniciais conectados às 10 entidades
const initialPatients: Patient[] = [
  { 
    id: 'p1', 
    name: 'Maria Silva', 
    financialResponsible: 'João Silva', 
    financialResponsibleContact: '(11) 99988-7766', 
    address: 'Rua A, 123 - Jardins, SP', 
    status: 'Ativo', 
    notes: 'Cuidados de média complexidade, paciente lúcida.', 
    document: 'contrato_maria_assinado.pdf',
    linkedEmployees: [],
    clinicalRecord: {
      clinicalCondition: 'Paciente acamada, suporte de O2 intermitente.',
      hasComorbidities: true,
      comorbiditiesDescription: 'HAS, Diabetes Tipo 2',
      hasAllergies: false,
      allergiesDescription: '',
      medications: 'Losartana 50mg, Insulina NPH',
      physicianName: 'Dr. Roberto Mendes',
      physicianContact: '(11) 91234-5678'
    }
  },
  { 
    id: 'p2', 
    name: 'Antonio Santos', 
    financialResponsible: 'Ana Santos', 
    financialResponsibleContact: '(11) 98877-6655', 
    address: 'Av Paulista, 456 - Bela Vista, SP', 
    status: 'Ativo', 
    notes: 'Pós-cirúrgico ortopédico',
    linkedEmployees: []
  },
  { 
    id: 'p3', 
    name: 'Josefa Oliveira', 
    financialResponsible: 'Pedro Oliveira', 
    financialResponsibleContact: '(21) 97766-5544', 
    address: 'Rua C, 789 - Moema, SP', 
    status: 'Inativo', 
    notes: 'Alta médica concedida', 
    document: 'contrato_finalizado.pdf',
    linkedEmployees: []
  },
];

const initialEmployees: Employee[] = [
  { id: 'e1', name: 'Enf. Carla Diaz', phone: '(11) 97777-6666', role: 'Enfermeiro', pixKey: '11977776666', professionalRegister: 'COREN 12345-SP', admissionDate: '2023-01-15', documents: [], skills: ['UTI', 'Sondas'], status: 'Ativo' },
  { id: 'e2', name: 'Téc. Bruno Souza', phone: '(11) 95555-4444', role: 'Téc. Enfermagem', pixKey: 'bruno@email.com', professionalRegister: 'COREN 67890-SP', admissionDate: '2023-03-10', documents: [], skills: ['Banho no leito'], status: 'Ativo' },
  { id: 'e3', name: 'Téc. Camila Rocha', phone: '(11) 94444-3333', role: 'Téc. Enfermagem', pixKey: 'camila@pix.com', professionalRegister: 'COREN 99887-SP', admissionDate: '2023-05-20', documents: [], skills: ['Medicação'], status: 'Ativo' },
  { id: 'e4', name: 'Téc. Solange Lima', phone: '(11) 93333-2222', role: 'Téc. Enfermagem', pixKey: 'solange@pix.com', professionalRegister: 'COREN 88776-SP', admissionDate: '2023-06-01', documents: [], skills: ['Curativos'], status: 'Ativo' },
];

const initialContracts: Contract[] = [
  { id: 'c1', patientId: 'p1', value: 15000, startDate: '2023-01-01', shiftsPerMonth: 30, status: ContractStatus.ACTIVE, description: 'Home Care 24h' },
  { id: 'c2', patientId: 'p2', value: 8000, startDate: '2023-02-01', shiftsPerMonth: 15, status: ContractStatus.ACTIVE, description: 'Home Care 12h Diurno' },
  { id: 'c3', patientId: 'p3', value: 5000, startDate: '2023-06-01', shiftsPerMonth: 10, status: ContractStatus.ENDED, description: 'Home Care Básico' },
];

const initialFinance: FinanceRecord[] = [
  { id: 'f1', type: PaymentType.INCOME, description: 'Mensalidade Out/26 - Maria Silva', amount: 15000, date: '2026-10-05', status: PaymentStatus.PAID, patientId: 'p1' },
  { id: 'f2', type: PaymentType.EXPENSE_PAYROLL, description: 'Plantões Set/26 - Carla Diaz', amount: 4500, date: '2026-10-10', status: PaymentStatus.PAID },
  { id: 'f3', type: PaymentType.EXPENSE_PAYROLL, description: 'Plantões Out/26 - Camila Rocha (Cobertura)', amount: 480, date: '2026-10-15', status: PaymentStatus.PENDING },
];

const initialMonitoring: MonthlyMonitoring[] = [
  { id: 'm1', contractId: 'c1', month: '2026-10', hoursWorked: 680, occurrences: '[12/10] Troca de curativo realizada sem intercorrências.', status: 'Em Aberto' },
  { id: 'm2', contractId: 'c2', month: '2026-10', hoursWorked: 320, occurrences: 'Quadro clínico estável.', status: 'Fechado' }
];

const initialShifts: Shift[] = [
  { id: 's1', patientId: 'p1', employeeId: 'e3', date: '2026-10-12', startTime: '08:00', endTime: '20:00', value: 240, status: 'Confirmado', type: 'COBERTURA' as any, notes: 'Camila cobriu Solange na Maria' },
  { id: 's2', patientId: 'p2', employeeId: 'e2', date: '2026-10-13', startTime: '20:00', endTime: '08:00', value: 220, status: 'Agendado' },
];

const initialTasks: TaskItem[] = [
  {
    id: 't1',
    title: 'Ligar para a família da Maria (Alinhamento cuidados)',
    category: 'Atendimento Familiar',
    dueDate: 'Hoje, 09:00',
    priority: 'high',
    assignedTo: 'Flavio',
    status: 'pending',
  },
  {
    id: 't2',
    title: 'Validar comprovante de cobertura da Camila',
    category: 'Financeiro / RH',
    dueDate: 'Hoje, 11:30',
    priority: 'medium',
    assignedTo: 'Sócia',
    status: 'pending',
  },
  {
    id: 't3',
    title: 'Renovação do contrato do paciente Antonio Santos',
    category: 'Contratos',
    dueDate: 'Ontem (Atrasada)',
    priority: 'urgent',
    assignedTo: 'Flavio',
    status: 'pending',
  },
  {
    id: 't4',
    title: 'Comprar materiais de curativo para Maria Silva',
    category: 'Suprimentos',
    dueDate: 'Hoje, 08:00',
    priority: 'medium',
    assignedTo: 'Sócia',
    status: 'completed',
  },
];

const initialAuditLogs: AuditItem[] = [
  { id: 'a1', user: 'Flavio', action: 'Criou nova tarefa: Ligar para a família da Maria', entityType: 'tasks', timestamp: '13/10/2026 09:12' },
  { id: 'a2', user: 'Sócia', action: 'Registrou cobertura: Camila na Maria Silva', entityType: 'shifts', timestamp: '12/10/2026 19:40' },
  { id: 'a3', user: 'Flavio', action: 'Atualizou dados cadastrais do paciente Maria Silva', entityType: 'patients', timestamp: '10/10/2026 14:15' },
];

const MainApp: React.FC = () => {
  // Tela principal inicia em 'assistant' (Assistente Privilege com botão FALAR e resumo de atenção)
  const [currentView, setCurrentView] = useState('assistant');
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>(initialFinance);
  const [monitorings, setMonitorings] = useState<MonthlyMonitoring[]>(initialMonitoring);
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>(initialAuditLogs);
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);

  const { user } = useAuth();

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t))
    );
  };

  const handleAddTask = (task: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleAddAuditLog = (action: string, entityType: string, details?: any) => {
    const newLog: AuditItem = {
      id: Math.random().toString(36).substring(2, 9),
      user: user?.name || 'Administrador',
      action,
      entityType,
      timestamp: new Date().toLocaleString('pt-BR'),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const handleAddFinanceRecord = (record: Omit<FinanceRecord, 'id'>) => {
    const newRec = { ...record, id: Math.random().toString(36).substr(2, 9) };
    setFinanceRecords([...financeRecords, newRec]);
    handleAddAuditLog(`Registrou pagamento: ${record.description}`, 'payments', record);
  };

  const handleUpdateFinanceRecord = (updated: FinanceRecord) => {
    setFinanceRecords(financeRecords.map(f => f.id === updated.id ? updated : f));
  };

  const handleDeleteFinanceRecord = (id: string) => {
    setFinanceRecords(financeRecords.filter(f => f.id !== id));
  };

  const handleAddPatient = (patient: Omit<Patient, 'id'>) => {
    const newP = { ...patient, id: Math.random().toString(36).substr(2, 9) };
    setPatients([...patients, newP]);
    handleAddAuditLog(`Cadastrou paciente: ${patient.name}`, 'patients', patient);
  };

  const handleEditPatient = (updated: Patient) => {
    setPatients(patients.map(p => p.id === updated.id ? updated : p));
    handleAddAuditLog(`Alterou paciente: ${updated.name}`, 'patients', updated);
  };

  const handleDeletePatient = (id: string) => {
    setPatients(patients.filter(p => p.id !== id));
  };

  const handleAddEmployee = (emp: Omit<Employee, 'id'>) => {
    const newE = { ...emp, id: Math.random().toString(36).substr(2, 9) };
    setEmployees([...employees, newE]);
    handleAddAuditLog(`Cadastrou colaborador: ${emp.name}`, 'professionals', emp);
  };

  const handleUpdateEmployee = (updated: Employee) => {
    setEmployees(employees.map(e => e.id === updated.id ? updated : e));
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(employees.filter(e => e.id !== id));
  };

  const handleAddShift = (shift: Omit<Shift, 'id'>) => {
    const newS = { ...shift, id: Math.random().toString(36).substr(2, 9) };
    setShifts([...shifts, newS]);
    handleAddAuditLog(`Adicionou plantão na escala`, 'shifts', shift);
  };

  const handleAddShifts = (newShifts: Omit<Shift, 'id'>[]) => {
    const created = newShifts.map(s => ({ ...s, id: Math.random().toString(36).substr(2, 9) }));
    setShifts([...shifts, ...created]);
  };

  const handleUpdateShift = (updated: Shift) => {
    setShifts(shifts.map(s => s.id === updated.id ? updated : s));
  };

  const handleDeleteShift = (id: string) => {
    setShifts(shifts.filter(s => s.id !== id));
  };

  const handleCheckIn = (employeeId: string, location: { lat: number; lng: number }) => {
    const newRecord: TimeRecord = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId,
      date: new Date().toISOString().slice(0, 10),
      checkIn: new Date().toISOString(),
      checkInLocation: location,
      status: 'Aberto'
    };
    setTimeRecords([...timeRecords, newRecord]);
  };

  const handleCheckOut = (recordId: string, location: { lat: number; lng: number }) => {
    setTimeRecords(timeRecords.map(r => {
      if (r.id === recordId) {
        return {
          ...r,
          checkOut: new Date().toISOString(),
          checkOutLocation: location,
          status: 'Fechado'
        };
      }
      return r;
    }));
  };

  const handleLinkEmployee = (patientId: string, employeeId: string, role: string, shiftRate: number) => {
    setPatients(patients.map(p => {
      if (p.id === patientId) {
        const currentLinks = p.linkedEmployees || [];
        if (currentLinks.some(l => l.employeeId === employeeId)) return p;
        return {
          ...p,
          linkedEmployees: [...currentLinks, { employeeId, role, shiftRate }]
        };
      }
      return p;
    }));
  };

  const handleAddExtraExpense = (patientId: string, expense: any) => {
    const newFinance: FinanceRecord = {
      id: Math.random().toString(36).substr(2, 9),
      type: PaymentType.EXPENSE_EXTRA,
      description: `Gasto Extra (${expense.description}) - Paciente ID: ${patientId}`,
      amount: expense.amount,
      date: expense.date,
      status: PaymentStatus.PENDING,
      patientId
    };
    setFinanceRecords([...financeRecords, newFinance]);
  };

  const renderContent = () => {
    switch (currentView) {
      // 1. TELA PRINCIPAL: ASSISTENTE PRIVILEGE
      case 'assistant':
        return (
          <AssistantHome 
            onNavigate={(view) => setCurrentView(view)} 
            onAddAuditLog={handleAddAuditLog}
            patients={patients}
            employees={employees}
            tasks={tasks}
            onAddTask={handleAddTask}
          />
        );

      // 2. AGENDA
      case 'agenda':
        return <AgendaView />;

      // 3. PESSOAS
      case 'people':
        return (
          <PeopleView 
            patients={patients}
            employees={employees}
            onNavigateToPatients={() => setCurrentView('patients')}
            onNavigateToEmployees={() => setCurrentView('employees')}
          />
        );

      // 4. TAREFAS / PENDÊNCIAS
      case 'tasks':
        return <TasksView tasks={tasks} onToggleTask={handleToggleTask} onAddTask={handleAddTask} />;

      // 5. MAIS
      case 'more':
        return <MoreView onNavigate={(view) => setCurrentView(view)} />;

      // TRILHA DE AUDITORIA
      case 'audit':
        return <AuditLogView logs={auditLogs} />;

      // Telas detalhadas existentes mantidas e integradas
      case 'dashboard':
        return (
          <Dashboard 
            patients={patients} 
            contracts={contracts} 
            finance={financeRecords} 
            onAddFinanceRecord={handleAddFinanceRecord}
          />
        );
      case 'patients':
        return (
          <PatientsView 
            patients={patients} 
            contracts={contracts} 
            employees={employees}
            financeRecords={financeRecords}
            onAddPatient={handleAddPatient} 
            onEditPatient={handleEditPatient}
            onDeletePatient={handleDeletePatient}
            onLinkEmployee={handleLinkEmployee}
            onAddExtraExpense={handleAddExtraExpense}
            onAddEmployee={handleAddEmployee}
          />
        );
      case 'employees':
        return (
          <EmployeesView 
            employees={employees} 
            patients={patients} 
            onAddEmployee={handleAddEmployee} 
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onLinkPatient={handleLinkEmployee} 
          />
        );
      case 'shifts':
        return (
          <ShiftManagementView 
            shifts={shifts}
            patients={patients}
            employees={employees}
            onAddShift={handleAddShift}
            onAddShifts={handleAddShifts}
            onUpdateShift={handleUpdateShift}
            onDeleteShift={handleDeleteShift}
          />
        );
      case 'timecard':
        return (
          <TimeCardView 
            employees={employees}
            timeRecords={timeRecords}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        );
      case 'finance':
        return (
          <FinanceView 
            records={financeRecords} 
            onAddRecord={handleAddFinanceRecord}
            onUpdateRecord={handleUpdateFinanceRecord}
            onDeleteRecord={handleDeleteFinanceRecord}
          />
        );
      case 'monitoring':
        return (
          <MonitoringView 
            monitorings={monitorings} 
            patients={patients} 
            contracts={contracts} 
            onUpdateMonitoring={(m) => setMonitorings(monitorings.map(item => item.id === m.id ? m : item))} 
          />
        );
      default:
        return (
          <AssistantHome 
            onNavigate={(view) => setCurrentView(view)} 
            onAddAuditLog={handleAddAuditLog}
            patients={patients}
            employees={employees}
            tasks={tasks}
            onAddTask={handleAddTask}
          />
        );
    }
  };

  return (
    <div className="flex min-h-screen font-sans text-slate-100 bg-pastel-dark selection:bg-pastel-pink selection:text-white relative overflow-hidden">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-pastel-blue/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pastel-pink/10 rounded-full blur-[120px]"></div>
      </div>

      <Sidebar 
        currentView={currentView} 
        onChangeView={setCurrentView} 
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />
      
      {/* MAIN CONTENT */}
      <main className="flex-1 ml-20 md:ml-64 p-4 md:p-8 relative z-10 overflow-x-hidden pb-24 md:pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Mobile com Identidade Privilege Care */}
          <header className="flex justify-between items-center mb-6 md:hidden">
            <span className="font-tech text-xl font-bold text-pastel-pink tracking-wider uppercase">
              ASSISTENTE PRIVILEGE
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium">
              {user?.name}
            </span>
          </header>
          
          {renderContent()}
        </div>
      </main>

      {/* Navegação Inferior Mobile para Usabilidade Móvel */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 flex justify-around py-2.5 px-2">
        <button
          onClick={() => setCurrentView('assistant')}
          className={`flex flex-col items-center text-[10px] ${
            currentView === 'assistant' ? 'text-pastel-pink font-semibold' : 'text-slate-400'
          }`}
        >
          <span>🎙️</span>
          <span>Início</span>
        </button>
        <button
          onClick={() => setCurrentView('agenda')}
          className={`flex flex-col items-center text-[10px] ${
            currentView === 'agenda' ? 'text-pastel-pink font-semibold' : 'text-slate-400'
          }`}
        >
          <span>📅</span>
          <span>Agenda</span>
        </button>
        <button
          onClick={() => setCurrentView('people')}
          className={`flex flex-col items-center text-[10px] ${
            currentView === 'people' || currentView === 'patients' || currentView === 'employees'
              ? 'text-pastel-pink font-semibold'
              : 'text-slate-400'
          }`}
        >
          <span>👥</span>
          <span>Pessoas</span>
        </button>
        <button
          onClick={() => setCurrentView('tasks')}
          className={`flex flex-col items-center text-[10px] ${
            currentView === 'tasks' ? 'text-pastel-pink font-semibold' : 'text-slate-400'
          }`}
        >
          <span>✓</span>
          <span>Tarefas</span>
        </button>
        <button
          onClick={() => setCurrentView('more')}
          className={`flex flex-col items-center text-[10px] ${
            currentView === 'more' ? 'text-pastel-pink font-semibold' : 'text-slate-400'
          }`}
        >
          <span>•••</span>
          <span>Mais</span>
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;
