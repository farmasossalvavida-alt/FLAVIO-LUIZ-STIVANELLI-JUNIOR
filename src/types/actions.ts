// Princípio de Ações Estruturadas para Futura Camada de IA
export type AssistantActionType =
  | 'create_task'
  | 'create_reminder'
  | 'query_agenda'
  | 'create_patient'
  | 'create_shift'
  | 'register_coverage'
  | 'query_pending_payments'
  | 'close_month_preview'
  | 'general_query';

export interface StructuredAssistantAction {
  id: string;
  type: AssistantActionType;
  label: string;
  payload: Record<string, any>;
  requiresConfirmation: boolean;
  explanation: string;
  status: 'suggested' | 'confirmed' | 'cancelled' | 'executed';
}

export interface AssistantTurn {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  action?: StructuredAssistantAction;
}
