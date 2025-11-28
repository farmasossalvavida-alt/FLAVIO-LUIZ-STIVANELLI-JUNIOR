
export enum UserRole {
  ADMIN = 'ADMIN',
  FINANCE = 'FINANCE',
  RH = 'RH',
  COLLABORATOR = 'COLLABORATOR'
}

export enum ContractStatus {
  ACTIVE = 'Ativo',
  PENDING = 'Pendente',
  ENDED = 'Encerrado',
  SUSPENDED = 'Suspenso'
}

export enum PaymentType {
  INCOME = 'Receita (Fatura)',
  EXPENSE_PAYROLL = 'Repasse (Folha)',
  EXPENSE_EXTRA = 'Despesa Extra'
}

export enum PaymentStatus {
  PENDING = 'Pendente',
  PAID = 'Pago',
  LATE = 'Atrasado'
}

export interface PatientEmployeeLink {
  id: string;
  employeeId: string;
  employeeName: string;
  shiftsCount: number;
  valuePerShift: number;
}

export interface ClinicalRecord {
  clinicalCondition: string;
  hasComorbidities: boolean;
  comorbiditiesDescription?: string;
  hasAllergies: boolean;
  allergiesDescription?: string;
  medications: string;
  physicianName: string;
  physicianContact?: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  date: string;
  type: 'EXAM' | 'DOCUMENT' | 'OTHER';
}

export interface MedicalRecord {
  nursingPrescription: string;
  medicalPrescription: string;
  medicalEvolution: string;
  nursingEvolution: string;
  nursingNotes: string;
  attachments: Attachment[];
}

export interface Patient {
  id: string;
  name: string;
  contact?: string;
  financialResponsible: string;
  financialResponsibleContact?: string;
  address: string;
  status: 'Ativo' | 'Inativo';
  notes: string;
  document?: string;
  linkedEmployees?: PatientEmployeeLink[]; // Colaboradores vinculados
  clinicalRecord?: ClinicalRecord; // Ficha Clínica
  medicalRecord?: MedicalRecord; // Prontuário (Prescrições, Evoluções, etc)
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  role: string;
  pixKey: string;
  professionalRegister: string;
  admissionDate: string;
  documents: { name: string; uploaded: boolean }[];
  skills: string[];
  status: 'Ativo' | 'Inativo' | 'Ferias';
}

export interface Contract {
  id: string;
  patientId: string;
  value: number;
  startDate: string;
  shiftsPerMonth: number; // Alterado de hoursPerDay para shiftsPerMonth
  status: ContractStatus;
  description: string;
}

export interface FinanceRecord {
  id: string;
  type: PaymentType;
  description: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  relatedContractId?: string;
  relatedEmployeeId?: string;
  patientId?: string; // Vinculo direto com paciente para extrato
  proofUrl?: string;
}

export interface MonthlyMonitoring {
  id: string;
  contractId: string;
  month: string;
  hoursWorked: number;
  occurrences: string;
  aiSummary?: string;
  status: 'Em Aberto' | 'Fechado';
}

export interface Shift {
  id: string;
  patientId: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: 'Agendado' | 'Realizado' | 'Cancelado' | 'Falta';
  notes?: string;
  repeatCount?: number;
}

export interface TimeRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // ISO String
  checkInLocation?: { lat: number; lng: number };
  checkOut?: string; // ISO String
  checkOutLocation?: { lat: number; lng: number };
  status: 'Aberto' | 'Fechado';
}
