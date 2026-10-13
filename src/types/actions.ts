// Princípio de Ações Estruturadas do Assistente Privilege Care
export type AssistantActionType =
  | 'create_task'
  | 'create_reminder'
  | 'query_tasks'
  | 'query_agenda'
  | 'query_patients'
  | 'query_professionals'
  | 'general_query';

export interface TaskPayload {
  title: string;
  description?: string;
  due_date: string; // YYYY-MM-DD
  due_date_label?: string; // e.g. "Amanhã", "17/10/2026"
  due_time?: string; // HH:mm
  assigned_to?: string;
  assigned_to_name?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  recurrence?: string;
  is_reminder?: boolean;
}

export interface QueryResultItem {
  id: string;
  primary: string;
  secondary?: string;
  meta?: string;
  badge?: string;
}

export interface StructuredAssistantAction {
  id: string;
  type: AssistantActionType;
  label: string;
  payload: Record<string, any>;
  requiresConfirmation: boolean;
  explanation: string;
  status: 'suggested' | 'confirmed' | 'cancelled' | 'executed';
  results?: QueryResultItem[];
}

export interface AssistantTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  action?: StructuredAssistantAction;
  waitingForClarification?: {
    actionType: 'create_task' | 'create_reminder';
    missingField: 'time' | 'patient' | 'title' | 'date';
    partialPayload: Partial<TaskPayload>;
  };
}
