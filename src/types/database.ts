export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'partner' | 'manager';
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  name: string;
  phone?: string | null;
  family_contact?: string | null;
  financial_responsible?: string | null;
  address?: string | null;
  start_date?: string | null;
  status: 'active' | 'inactive' | 'paused' | 'hospitalized';
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  phone?: string | null;
  pix_key?: string | null;
  active: boolean;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  due_date: string;
  due_time?: string | null;
  assigned_to?: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  recurrence?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export interface Scale {
  id: string;
  patient_id: string;
  professional_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'replaced';
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Shift {
  id: string;
  patient_id: string;
  professional_id: string;
  scheduled_professional_id?: string | null;
  date: string;
  start_time: string;
  end_time: string;
  type: 'scheduled' | 'coverage' | 'extra';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Extra {
  id: string;
  patient_id?: string | null;
  professional_id?: string | null;
  date: string;
  type:
    | 'extra_shift'
    | 'coverage'
    | 'procedure'
    | 'additional_service'
    | 'ambulance'
    | 'transport'
    | 'exam'
    | 'material'
    | 'other';
  description: string;
  amount_to_receive: number;
  amount_to_pay: number;
  status: 'pending' | 'approved' | 'billed' | 'paid' | 'cancelled';
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  patient_id?: string | null;
  professional_id?: string | null;
  extra_id?: string | null;
  shift_id?: string | null;
  type: 'receivable' | 'payable';
  amount: number;
  status: 'pending' | 'paid' | 'received' | 'cancelled';
  payment_date?: string | null;
  description: string;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id?: string | null;
  message: string;
  message_type: 'text' | 'voice';
  assistant_response?: string | null;
  intent?: string | null;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  old_data?: Json;
  new_data?: Json;
  created_at: string;
}
