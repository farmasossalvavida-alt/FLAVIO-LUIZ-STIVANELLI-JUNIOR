import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { PatientsView } from './components/PatientsView';
import { EmployeesView } from './components/EmployeesView';
import { FinanceView } from './components/FinanceView';
import { MonitoringView } from './components/MonitoringView';
import { ShiftManagementView } from './components/ShiftManagementView';
import { TimeCardView } from './components/TimeCardView';
import { Patient, Employee, Contract, FinanceRecord, MonthlyMonitoring, ContractStatus, PaymentType, PaymentStatus, PatientEmployeeLink, Shift, TimeRecord } from './types';

// --- MOCK DATA INITIALIZATION ---
const initialPatients: Patient[] = [
  { 
    id: 'p1', 
    name: 'Maria Silva', 
    financialResponsible: 'João Silva', 
    financialResponsibleContact: '(11) 99988-7766', 
    address: 'Rua A, 123', 
    status: 'Ativo', 
    notes: 'Cuidados paliativos', 
    document: 'contrato_maria_assinado.pdf',
    linkedEmployees: [],
    clinicalRecord: {
        clinicalCondition: 'Paciente acamada, dependente de O2, sequela de AVC isquêmico.',
        hasComorbidities: true,
        comorbiditiesDescription: 'Hipertensão Arterial Sistêmica, Diabetes Tipo 2',
        hasAllergies: false,
        allergiesDescription: '',
        medications: 'Losartana 50mg, Metformina 850mg, AAS 100mg',
        physicianName: 'Dr. Roberto Mendes',
        physicianContact: '(11) 91234-5678'
    },
    medicalRecord: {
        medicalPrescription: '1. Dieta enteral 1200kcal/dia\n2. Fisioterapia motora 3x/semana\n3. Decúbito elevado 30º',
        nursingPrescription: '1. Mudança de decúbito 2/2h\n2. Higiene oral 3x/dia\n3. Curativo em LPP sacral',
        medicalEvolution: 'Paciente estável, mantendo saturação 96% em AA. Ausculta pulmonar limpa. Abdome flácido.',
        nursingEvolution: 'Plantão sem intercorrências. Paciente aceitou bem a dieta. Diurese presente em fralda.',
        nursingNotes: 'Realizado banho no leito às 09:00. Familiares orientados sobre hidratação.',
        attachments: [
            { id: 'a1', name: 'Hemograma Completo.pdf', url: '#', date: '2024-02-10', type: 'EXAM' },
            { id: 'a2', name: 'Raio-X Torax.pdf', url: '#', date: '2024-01-15', type: 'EXAM' }
        ]
    }
  },
  { 
    id: 'p2', 
    name: 'Antonio Santos', 
    financialResponsible: 'Ana Santos', 
    financialResponsibleContact: '(11) 98877-6655', 
    address: 'Av B, 456', 
    status: 'Ativo', 
    notes: 'Pós-cirúrgico',
    linkedEmployees: []
  },
  { 
    id: 'p3', 
    name: 'Josefa Oliveira', 
    financialResponsible: 'Pedro Oliveira', 
    financialResponsibleContact: '(21) 97766-5544', 
    address: 'Rua C, 789', 
    status: 'Inativo', 
    notes: 'Alta médica', 
    document: 'contrato_antigo.pdf',
    linkedEmployees: []
  },
];

const initialEmployees: Employee[] = [
  { id: 'e1', name: 'Enf. Carla Diaz', phone: '(11) 97777-6666', role: 'Enfermeiro', pixKey: 'cpf-mock', professionalRegister: 'COREN 123', admissionDate: '2023-01-15', documents: [{name:'Contrato de Trabalho.pdf', uploaded:true}], skills: ['UTI', 'Sondas'], status: 'Ativo' },
  { id: 'e2', name: 'Téc. Bruno Souza', phone: '(11) 95555-4444', role: 'Téc. Enfermagem', pixKey: 'phone-mock', professionalRegister: 'COREN 456', admissionDate: '2023-03-10', documents: [], skills: ['Banho leito'], status: 'Ativo' },
];

const initialContracts: Contract[] = [
  { id: 'c1', patientId: 'p1', value: 15000, startDate: '2023-01-01', shiftsPerMonth: 30, status: ContractStatus.ACTIVE, description: 'Home Care 24h' },
  { id: 'c2', patientId: 'p2', value: 8000, startDate: '2023-02-01', shiftsPerMonth: 15, status: ContractStatus.ACTIVE, description: 'Home Care 12h' },
  { id: 'c3', patientId: 'p3', value: 5000, startDate: '2023-06-01', shiftsPerMonth: 10, status: ContractStatus.ENDED, description: 'Home Care Básico' },
];

const initialFinance: FinanceRecord[] = [
  { id: 'f1', type: PaymentType.INCOME, description: 'Mensalidade Jan/24 - Maria Silva', amount: 15000, date: '2024-01-05', status: PaymentStatus.PAID, patientId: 'p1' },
  { id: 'f2', type: PaymentType.EXPENSE_PAYROLL, description: 'Pagamento Plantões - Carla Diaz', amount: 4500, date: '2024-01-10', status: PaymentStatus.PAID },
  { id: 'f3', type: PaymentType.INCOME, description: 'Mensalidade Fev/24 - Maria Silva', amount: 15000, date: '2024-02-05', status: PaymentStatus.PENDING, patientId: 'p1' },
];

const initialMonitoring: MonthlyMonitoring[] = [
  { id: 'm1', contractId: 'c1', month: '2024-02', hoursWorked: 680, occurrences: '[2024-02-12] Paciente apresentou febre.\n[2024-02-15] Troca de sonda realizada com sucesso. Quadro estável.', status: 'Em Aberto' },
  { id: 'm2', contractId: 'c2', month: '2024-02', hoursWorked: 320, occurrences: 'Sem intercorrências.', status: 'Fechado' }
];

const initialShifts: Shift[] = [
  { id: 's1', patientId: 'p1', employeeId: 'e1', date: new Date().toISOString().slice(0, 10), startTime: '07:00', endTime: '19:00', status: 'Agendado' },
  { id: 's2', patientId: 'p1', employeeId: 'e2', date: new Date(Date.now() + 86400000).toISOString().slice(0, 10), startTime: '19:00', endTime: '07:00', status: 'Agendado' }
];

const initialTimeRecords: TimeRecord[] = [
    { id: 'tr1', employeeId: 'e1', date: new Date().toISOString().slice(0, 10), checkIn: new Date().toISOString(), checkInLocation: { lat: -23.5505, lng: -46.6333 }, status: 'Aberto' }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true); // Default Dark Mode for Neon
  
  // Centralized State
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>(initialFinance);
  const [monitorings, setMonitorings] = useState<MonthlyMonitoring[]>(initialMonitoring);
  const [shifts, setShifts] = useState<Shift[]>(initialShifts);
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>(initialTimeRecords);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // --- CRUD HANDLERS ---
  const handleAddPatient = (newPatient: Patient, newContract: Contract) => {
    setPatients([...patients, newPatient]);
    setContracts([...contracts, newContract]);
  };

  const handleEditPatient = (updatedPatient: Patient, updatedContract: Contract) => {
    setPatients(patients.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    const contractExists = contracts.some(c => c.id === updatedContract.id);
    if (contractExists) {
      setContracts(contracts.map(c => c.id === updatedContract.id ? updatedContract : c));
    } else {
      setContracts([...contracts, updatedContract]);
    }
  };

  const handleDeletePatient = (patientId: string) => {
    setPatients(patients.filter(p => p.id !== patientId));
    setContracts(contracts.filter(c => c.patientId !== patientId));
    setShifts(shifts.filter(s => s.patientId !== patientId));
  };

  const handleAddEmployee = (newEmployee: Employee) => {
    setEmployees([...employees, newEmployee]);
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees(employees.map(e => e.id === updatedEmployee.id ? updatedEmployee : e));
  };

  const handleDeleteEmployee = (employeeId: string) => {
    setEmployees(employees.filter(e => e.id !== employeeId));
    setPatients(patients.map(p => ({
        ...p,
        linkedEmployees: p.linkedEmployees?.filter(link => link.employeeId !== employeeId)
    })));
    setShifts(shifts.filter(s => s.employeeId !== employeeId));
  };

  const handleUpdateMonitoring = (id: string, data: Partial<MonthlyMonitoring>) => {
    setMonitorings(monitorings.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const handleLinkEmployee = (patientId: string, link: PatientEmployeeLink) => {
    setPatients(patients.map(p => {
      if (p.id === patientId) {
        const currentLinks = p.linkedEmployees || [];
        return { ...p, linkedEmployees: [...currentLinks, link] };
      }
      return p;
    }));
  };

  const handleAddExtraExpense = (record: FinanceRecord) => {
    setFinanceRecords([...financeRecords, record]);
  };

  const handleAddFinanceRecord = (record: FinanceRecord) => {
    setFinanceRecords([...financeRecords, record]);
  };

  const handleUpdateFinanceRecord = (updatedRecord: FinanceRecord) => {
    setFinanceRecords(financeRecords.map(r => r.id === updatedRecord.id ? updatedRecord : r));
  };

  const handleDeleteFinanceRecord = (id: string) => {
    setFinanceRecords(financeRecords.filter(r => r.id !== id));
  };

  const handleAddShift = (shift: Shift) => {
    setShifts([...shifts, shift]);
  };

  const handleAddShifts = (newShifts: Shift[]) => {
    setShifts(prev => [...prev, ...newShifts]);
  };

  const handleUpdateShift = (updatedShift: Shift) => {
    setShifts(shifts.map(s => s.id === updatedShift.id ? updatedShift : s));
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

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard 
                  patients={patients} 
                  contracts={contracts} 
                  finance={financeRecords} 
                  onAddFinanceRecord={handleAddFinanceRecord}
                />;
      case 'patients':
        return <PatientsView 
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
               />;
      case 'employees':
        return <EmployeesView 
                  employees={employees} 
                  patients={patients} 
                  onAddEmployee={handleAddEmployee} 
                  onUpdateEmployee={handleUpdateEmployee}
                  onDeleteEmployee={handleDeleteEmployee}
                  onLinkPatient={handleLinkEmployee} 
               />;
      case 'shifts':
        return <ShiftManagementView 
                  shifts={shifts}
                  patients={patients}
                  employees={employees}
                  onAddShift={handleAddShift}
                  onAddShifts={handleAddShifts}
                  onUpdateShift={handleUpdateShift}
                  onDeleteShift={handleDeleteShift}
               />;
      case 'timecard':
        return <TimeCardView 
                  employees={employees}
                  timeRecords={timeRecords}
                  onCheckIn={handleCheckIn}
                  onCheckOut={handleCheckOut}
               />;
      case 'finance':
        return <FinanceView 
                  records={financeRecords} 
                  onAddRecord={handleAddFinanceRecord}
                  onUpdateRecord={handleUpdateFinanceRecord}
                  onDeleteRecord={handleDeleteFinanceRecord}
               />;
      case 'monitoring':
        return <MonitoringView 
                  monitorings={monitorings} 
                  patients={patients} 
                  contracts={contracts} 
                  onUpdateMonitoring={handleUpdateMonitoring} 
               />;
      default:
        return <Dashboard 
                  patients={patients} 
                  contracts={contracts} 
                  finance={financeRecords} 
                  onAddFinanceRecord={handleAddFinanceRecord}
                />;
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
        onToggleTheme={toggleTheme}
      />
      
      {/* MAIN CONTENT */}
      <main className="flex-1 ml-20 md:ml-64 p-6 md:p-8 relative z-10 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
            {/* Header Mobile */}
            <header className="flex justify-between items-center mb-8 md:hidden">
               <span className="font-tech text-2xl font-bold text-pastel-pink tracking-widest uppercase glow-text">PRIVILEGE CARE</span>
            </header>
            
            {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;