import { AssistantTurn, StructuredAssistantAction } from '../types/actions';

// Interpretador estruturado de intenções (Fundação para futura IA)
// Converte linguagem natural em ações estruturadas com validação antes de alterar dados.
export function interpretNaturalLanguage(message: string): AssistantTurn {
  const normalized = message.trim().toLowerCase();
  const id = Math.random().toString(36).substring(2, 9);
  const now = new Date().toISOString();

  // 1. "Me lembra amanhã às 9h de ligar para a família da Maria."
  if (normalized.includes('lembra') || normalized.includes('tarefa') || normalized.includes('ligar')) {
    const action: StructuredAssistantAction = {
      id,
      type: 'create_reminder',
      label: 'Criar Lembrete / Tarefa',
      payload: {
        title: 'Ligar para a família da Maria',
        due_date: 'Amanhã',
        due_time: '09:00',
        category: 'Atendimento Familiar',
        priority: 'high',
      },
      requiresConfirmation: true,
      explanation: 'Identificado pedido de lembrete com horário e paciente especificados.',
      status: 'suggested',
    };
    return {
      id,
      role: 'assistant',
      text: 'Entendido. Preparei o agendamento do lembrete para você revisar e confirmar antes de gravar no sistema:',
      timestamp: now,
      action,
    };
  }

  // 2. "A Camila fez a cobertura da Solange na Maria ontem."
  if (normalized.includes('cobertura') || (normalized.includes('plantão') && normalized.includes('ontem'))) {
    const action: StructuredAssistantAction = {
      id,
      type: 'register_coverage',
      label: 'Registrar Cobertura de Plantão',
      payload: {
        patient: 'Maria Silva',
        performed_by: 'Camila',
        scheduled_for: 'Solange',
        date: 'Ontem',
        type: 'coverage',
        status: 'completed',
      },
      requiresConfirmation: true,
      explanation: 'Identificada substituição de profissional no plantão (cobertura realizada).',
      status: 'suggested',
    };
    return {
      id,
      role: 'assistant',
      text: 'Identifiquei a cobertura de plantão. Confira os detalhes para registrar a alteração e vincular ao financeiro:',
      timestamp: now,
      action,
    };
  }

  // 3. "Quanto tenho para pagar para a Camila?"
  if (normalized.includes('quanto') && normalized.includes('pagar')) {
    const action: StructuredAssistantAction = {
      id,
      type: 'query_pending_payments',
      label: 'Consultar Pagamentos Pendentes',
      payload: {
        professional: 'Camila',
        total_pending: 480.0,
        shifts_count: 2,
        due_date: 'Próxima sexta-feira',
      },
      requiresConfirmation: false,
      explanation: 'Consulta direta de lançamentos a pagar para a profissional.',
      status: 'executed',
    };
    return {
      id,
      role: 'assistant',
      text: 'Consultando o banco de dados: Camila possui 2 plantões pendentes de acerto, totalizando R$ 480,00.',
      timestamp: now,
      action,
    };
  }

  // 4. "Quais são minhas pendências hoje?"
  if (normalized.includes('pendências') || normalized.includes('pendencias') || normalized.includes('hoje')) {
    const action: StructuredAssistantAction = {
      id,
      type: 'query_agenda',
      label: 'Consultar Pendências do Dia',
      payload: {
        tasks_count: 3,
        urgent_count: 1,
        shifts_today: 4,
      },
      requiresConfirmation: false,
      explanation: 'Consulta de pendências, tarefas do dia e plantões ativos.',
      status: 'executed',
    };
    return {
      id,
      role: 'assistant',
      text: 'Hoje você possui 3 tarefas pendentes (1 com prioridade alta) e 4 plantões em andamento.',
      timestamp: now,
      action,
    };
  }

  // 5. "Vamos fechar outubro."
  if (normalized.includes('fechar') || normalized.includes('fechamento')) {
    const action: StructuredAssistantAction = {
      id,
      type: 'close_month_preview',
      label: 'Prévia de Fechamento Mensal',
      payload: {
        month: 'Outubro',
        total_receivable: 45000.0,
        total_payable: 28500.0,
        estimated_margin: 16500.0,
        unsettled_shifts: 1,
      },
      requiresConfirmation: true,
      explanation: 'Simulação de fechamento mensal. Nenhuma alteração irreversível será feita sem sua autorização.',
      status: 'suggested',
    };
    return {
      id,
      role: 'assistant',
      text: 'Preparei o demonstrativo prévio de Outubro. Veja os valores antes de consolidar o fechamento:',
      timestamp: now,
      action,
    };
  }

  // Resposta padrão estruturada
  return {
    id,
    role: 'assistant',
    text: `Recebi sua solicitação: "${message}". A arquitetura de IA está pronta para conectar o modelo de processamento de linguagem natural e executar ações estruturadas no banco de dados.`,
    timestamp: now,
    action: {
      id,
      type: 'general_query',
      label: 'Processamento de Intenção',
      payload: { raw_text: message },
      requiresConfirmation: false,
      explanation: 'Entrada registrada e pronta para envio à camada de IA.',
      status: 'executed',
    },
  };
}
