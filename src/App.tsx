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
    