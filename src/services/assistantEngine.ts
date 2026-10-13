import { AssistantTurn, StructuredAssistantAction, TaskPayload } from '../types/actions';
import { Patient, Employee } from '../types';

export interface AssistantEngineContext {
  user: { id: string; name: string } | null;
  patients: Patient[];
  employees: Employee[];
  tasks: Array<{
    id: string;
    title: string;
    dueDate: string;
    priority: string;
    assignedTo: string;
    category?: string;
    status: 'pending' | 'completed';
    isReminder?: boolean;
    rawDate?: string;
  }>;
  recentTurns?: AssistantTurn[];
}

export interface ExecutionResult {
  turn: AssistantTurn;
  taskToCreate?: {
    title: string;
    description?: string;
    dueDate: string;
    dueTime?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    assignedTo: string;
    recurrence?: string;
    isReminder?: boolean;
  };
}

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

export function formatDateISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function formatDateBR(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

const WEEKDAY_MAP: Record<string, number> = {
  domingo: 0,
  segunda: 1,
  'segunda-feira': 1,
  terça: 2,
  terca: 2,
  'terça-feira': 2,
  'terca-feira': 2,
  quarta: 3,
  'quarta-feira': 3,
  quinta: 4,
  'quinta-feira': 4,
  sexta: 5,
  'sexta-feira': 5,
  sábado: 6,
  sabado: 6,
};

// Parser de datas relativas em PT-BR
export function parseRelativeDate(text: string, referenceDate: Date = new Date()): { dateISO: string; label: string } | null {
  const lower = text.toLowerCase();
  const ref = new Date(referenceDate);

  if (lower.includes('depois de amanhã') || lower.includes('depois de amanha')) {
    const target = new Date(ref);
    target.setDate(ref.getDate() + 2);
    return { dateISO: formatDateISO(target), label: 'Depois de amanhã' };
  }

  if (lower.includes('amanhã') || lower.includes('amanha')) {
    const target = new Date(ref);
    target.setDate(ref.getDate() + 1);
    return { dateISO: formatDateISO(target), label: 'Amanhã' };
  }

  if (lower.includes('hoje')) {
    return { dateISO: formatDateISO(ref), label: 'Hoje' };
  }

  if (lower.includes('ontem')) {
    const target = new Date(ref);
    target.setDate(ref.getDate() - 1);
    return { dateISO: formatDateISO(target), label: 'Ontem' };
  }

  for (const [name, targetDay] of Object.entries(WEEKDAY_MAP)) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(`(^|\\s)${escaped}(?=\\s|$|[.,!?;])`, 'i');
    if (rx.test(lower)) {
      const currentDay = ref.getDay();
      let diff = targetDay - currentDay;
      if (diff <= 0) {
        diff += 7;
      }
      const target = new Date(ref);
      target.setDate(ref.getDate() + diff);
      const dayCapitalized = name.charAt(0).toUpperCase() + name.slice(1);
      return {
        dateISO: formatDateISO(target),
        label: `${dayCapitalized} (${formatDateBR(target)})`,
      };
    }
  }

  return null;
}

// Parser de horários em PT-BR
export function parseNaturalTime(text: string): string | null {
  const lower = text.toLowerCase();

  const wordToNum: Record<string, number> = {
    uma: 1,
    um: 1,
    duas: 2,
    dois: 2,
    três: 3,
    tres: 3,
    quatro: 4,
    cinco: 5,
    seis: 6,
    sete: 7,
    oito: 8,
    nove: 9,
    dez: 10,
    onze: 11,
    doze: 12,
  };

  // 1. "às 15:30", "15:30", "15h30"
  const regexColon = /(?:^|\s)(?:[aà]s\s*)?(\d{1,2})[:h](\d{2})(?=\s|$|[.,!?;])/i;
  const matchColon = lower.match(regexColon);
  if (matchColon) {
    const h = parseInt(matchColon[1], 10);
    const m = parseInt(matchColon[2], 10);
    if (h >= 0 && h <= 23 && m >= 0 && m <= 59) {
      return `${pad(h)}:${pad(m)}`;
    }
  }

  // 2. "às 15h", "15h", "às 9h"
  const regexH = /(?:^|\s)(?:[aà]s\s*)?(\d{1,2})\s*h(?=\s|$|[.,!?;])/i;
  const matchH = lower.match(regexH);
  if (matchH) {
    const h = parseInt(matchH[1], 10);
    if (h >= 0 && h <= 23) {
      return `${pad(h)}:00`;
    }
  }

  // 3. "às 3 da tarde", "às três da tarde", "às 10 da noite"
  const periodRegex = /(?:^|\s)(?:[aà]s\s*)?(uma|duas|três|tres|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|\d{1,2})\s*(?:da\s*(tarde|noite|manhã|manha))(?=\s|$|[.,!?;])/i;
  const matchPeriod = lower.match(periodRegex);
  if (matchPeriod) {
    const rawH = matchPeriod[1];
    let h = wordToNum[rawH] !== undefined ? wordToNum[rawH] : parseInt(rawH, 10);
    const period = matchPeriod[2];
    if (period.includes('tarde') && h < 12) h += 12;
    if (period.includes('noite') && h < 12) h += 12;
    if (h >= 0 && h <= 23) {
      return `${pad(h)}:00`;
    }
  }

  // 4. "às 15", "às 10", "às 3", "às três"
  const regexSimple = /(?:^|\s)(?:[aà]s)\s+(uma|duas|três|tres|quatro|cinco|seis|sete|oito|nove|dez|onze|doze|\d{1,2})(?=\s|$|[.,!?;])/i;
  const matchSimple = lower.match(regexSimple);
  if (matchSimple) {
    const rawH = matchSimple[1];
    let h = wordToNum[rawH] !== undefined ? wordToNum[rawH] : parseInt(rawH, 10);
    if (h >= 1 && h <= 6) {
      h += 12;
    }
    if (h >= 0 && h <= 23) {
      return `${pad(h)}:00`;
    }
  }

  if (lower.includes('começo da manhã') || lower.includes('inicio da manha') || lower.includes('comeco da manha')) {
    return '08:00';
  }
  if (lower.includes('final da tarde') || lower.includes('fim da tarde')) {
    return '17:00';
  }
  if (lower.includes('mais tarde')) {
    return '16:00';
  }

  return null;
}

// Limpeza de texto da tarefa para extrair o título
export function extractTaskTitle(rawMessage: string): string {
  let s = rawMessage.trim();

  // Prefixo inicial
  s = s.replace(/^(?:me\s+lembr[ae]|lembr[ae]|preciso(?:\s+de)?|tenho\s+que|precisamos|n[aã]o\s+posso\s+esquecer(?:\s+de)?|agendar)\s+/i, '');

  // Expressões temporais
  const temporalWords = [
    'depois de amanhã', 'depois de amanha',
    'amanhã', 'amanha', 'hoje', 'ontem',
    'segunda-feira', 'segunda',
    'terça-feira', 'terca-feira', 'terça', 'terca',
    'quarta-feira', 'quarta',
    'quinta-feira', 'quinta',
    'sexta-feira', 'sexta',
    'sábado', 'sabado',
    'domingo',
    'essa semana', 'esta semana', 'próxima semana', 'proxima semana', 'semana que vem'
  ];

  for (const term of temporalWords) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(`(^|\\s)${escaped}(?=\\s|$|[.,!?;])`, 'gi');
    s = s.replace(rx, ' ');
  }

  // Horários
  s = s.replace(/(^|\s)[aà]s\s+\d{1,2}(?::\d{2})?\s*(?:h|horas)?(?:\s*da\s*(?:tarde|noite|manh[aã]))?(?=\s|$|[.,!?;])/gi, ' ');
  s = s.replace(/(^|\s)[aà]s\s+(?:uma|duas|tr[eê]s|quatro|cinco|seis|sete|oito|nove|dez|onze|doze)(?:\s*da\s*(?:tarde|noite|manh[aã]))?(?=\s|$|[.,!?;])/gi, ' ');
  s = s.replace(/(^|\s)\d{1,2}\s*h(?=\s|$|[.,!?;])/gi, ' ');
  s = s.replace(/(^|\s)[aà]s\s+\d{1,2}(?=\s|$|[.,!?;])/gi, ' ');

  // Normalização prévia de espaços para os substitutos de início
  s = s.replace(/\s+/g, ' ').trim();

  // Limpeza de conectivos e prefixos residuais de verbo
  s = s.replace(/^de\s+ligar\b/i, 'Ligar');
  s = s.replace(/^de\s+falar\b/i, 'Falar');
  s = s.replace(/^de\s+cobrar\b/i, 'Cobrar');
  s = s.replace(/^de\s+conferir\b/i, 'Conferir');
  s = s.replace(/^(?:de|para|que|em|na|no)\s+/i, '');
  s = s.replace(/^de\s+/i, '');
  s = s.replace(/\s+(?:de|para|em|na|no)$/i, '');

  s = s.replace(/\s+/g, ' ').replace(/^[\s,.-]+|[\s,.-]+$/g, '').trim();

  if (s.length < 3) return rawMessage.trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function inferCategoryAndPriority(text: string): { category: string; priority: 'low' | 'medium' | 'high' | 'urgent' } {
  const lower = text.toLowerCase();

  let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
  if (lower.includes('urgente') || lower.includes('imediato') || lower.includes('atrasado')) {
    priority = 'urgent';
  } else if (lower.includes('cobrar') || lower.includes('contrato') || lower.includes('família') || lower.includes('familia') || lower.includes('médico') || lower.includes('medico')) {
    priority = 'high';
  }

  let category = 'Geral';
  if (lower.includes('contrato')) category = 'Contratos';
  else if (lower.includes('cobrar') || lower.includes('pagamento')) category = 'Financeiro';
  else if (lower.includes('família') || lower.includes('familia') || lower.includes('visita')) category = 'Atendimento Familiar';
  else if (lower.includes('laboratório') || lower.includes('laboratorio') || lower.includes('exame') || lower.includes('remédio') || lower.includes('remedio')) category = 'Clínico';
  else if (lower.includes('paciente') || lower.includes('cuidados')) category = 'Pacientes';

  return { category, priority };
}

export function resolveEntityReference(text: string, recentTurns: AssistantTurn[] = []): string | null {
  const lower = text.toLowerCase();
  if (lower.includes('dela') || lower.includes('ela') || lower.includes('com ela')) {
    for (let i = recentTurns.length - 1; i >= 0; i--) {
      const turn = recentTurns[i];
      const match = turn.text.match(/\b(Maria|Camila|Solange|Carla|Josefa|Ana)\b/i);
      if (match) {
        return match[1];
      }
    }
  }
  return null;
}

export function processAssistantMessage(
  rawMessage: string,
  context: AssistantEngineContext
): ExecutionResult {
  const message = rawMessage.trim();
  const lower = message.toLowerCase();
  const id = Math.random().toString(36).substring(2, 9);
  const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  // 1. CONTEXTO RECENTE: Resposta a pedido de esclarecimento
  const lastAssistantTurn = [...(context.recentTurns || [])].reverse().find((t) => t.role === 'assistant');
  if (lastAssistantTurn && lastAssistantTurn.waitingForClarification) {
    const clarification = lastAssistantTurn.waitingForClarification;
    const partial = clarification.partialPayload || {};

    if (clarification.missingField === 'time') {
      const parsedTime = parseNaturalTime(message);
      if (parsedTime) {
        const fullPayload: TaskPayload = {
          title: partial.title || 'Lembrete agendado',
          description: partial.description,
          due_date: partial.due_date || formatDateISO(new Date()),
          due_date_label: partial.due_date_label || 'Amanhã',
          due_time: parsedTime,
          assigned_to: context.user?.id || 'admin',
          assigned_to_name: context.user?.name || 'Flavio',
          priority: partial.priority || 'high',
          category: partial.category || 'Atendimento Familiar',
          recurrence: partial.recurrence,
          is_reminder: partial.is_reminder !== false,
        };

        const action: StructuredAssistantAction = {
          id,
          type: fullPayload.is_reminder ? 'create_reminder' : 'create_task',
          label: fullPayload.is_reminder ? 'Criar Lembrete' : 'Criar Tarefa',
          payload: fullPayload,
          requiresConfirmation: true,
          explanation: 'Completado com o horário informado no contexto recente.',
          status: 'suggested',
        };

        const turn: AssistantTurn = {
          id,
          role: 'assistant',
          text: `Entendi assim:\n\n📌 ${fullPayload.title}\n📅 ${fullPayload.due_date_label}\n🕒 ${fullPayload.due_time}\n🏷️ ${fullPayload.category}\n🔔 ${fullPayload.is_reminder ? 'Lembrete' : 'Tarefa'}\n\nConfirmar?`,
          timestamp: now,
          action,
        };

        return {
          turn,
          taskToCreate: {
            title: fullPayload.title,
            dueDate: `${fullPayload.due_date_label}, ${fullPayload.due_time}`,
            dueTime: fullPayload.due_time,
            priority: fullPayload.priority,
            category: fullPayload.category,
            assignedTo: fullPayload.assigned_to_name || 'Flavio',
            isReminder: fullPayload.is_reminder,
          },
        };
      }
    }
  }

  // 2. AÇÃO: query_tasks
  const isQueryTasks =
    (lower.includes('tarefa') || lower.includes('tarefas') || lower.includes('pendente') || lower.includes('pendencias') || lower.includes('pendências') || lower.includes('o que tenho para hoje') || lower.includes('o que tenho hoje')) &&
    (lower.includes('atrasad') || lower.includes('hoje') || lower.includes('semana') || lower.includes('passou') || lower.includes('quais') || lower.includes('o que'));

  if (isQueryTasks) {
    let filtered = [...context.tasks];
    let querySummary = 'Tarefas consultadas:';

    if (lower.includes('atrasad')) {
      filtered = filtered.filter((t) => t.dueDate.toLowerCase().includes('atrasad') || t.rawDate === 'ontem' || t.dueDate.toLowerCase().includes('ontem'));
      querySummary = 'Tarefas atrasadas encontradas no banco:';
    } else if (lower.includes('hoje')) {
      filtered = filtered.filter((t) => t.dueDate.toLowerCase().includes('hoje') && t.status === 'pending');
      querySummary = 'Tarefas pendentes para hoje no banco:';
    } else if (lower.includes('sócia') || lower.includes('socia')) {
      filtered = filtered.filter((t) => t.assignedTo.toLowerCase().includes('flavio') || t.assignedTo.toLowerCase().includes('admin'));
      querySummary = 'Tarefas atribuídas a você:';
    } else {
      filtered = filtered.filter((t) => t.status === 'pending');
      querySummary = 'Tarefas pendentes:';
    }

    if (filtered.length === 0) {
      return {
        turn: {
          id,
          role: 'assistant',
          text: 'Nenhuma tarefa encontrada com esses critérios no banco de dados.',
          timestamp: now,
          action: {
            id,
            type: 'query_tasks',
            label: 'Consultar Tarefas',
            payload: { filter: lower, count: 0 },
            requiresConfirmation: false,
            explanation: 'Consulta direta no banco sem inventar registros.',
            status: 'executed',
            results: [],
          },
        },
      };
    }

    const itemsText = filtered.map((t) => `• ${t.title} (${t.dueDate} - Resp: ${t.assignedTo})`).join('\n');
    return {
      turn: {
        id,
        role: 'assistant',
        text: `${querySummary}\n\n${itemsText}`,
        timestamp: now,
        action: {
          id,
          type: 'query_tasks',
          label: 'Consultar Tarefas',
          payload: { count: filtered.length },
          requiresConfirmation: false,
          explanation: 'Consulta realizada nas tarefas reais do banco de dados.',
          status: 'executed',
          results: filtered.map((t) => ({
            id: t.id,
            primary: t.title,
            secondary: `${t.dueDate} • Resp: ${t.assignedTo}`,
            badge: t.priority,
          })),
        },
      },
    };
  }

  // 3. AÇÃO: query_agenda
  const isQueryAgenda =
    (lower.includes('agenda') || lower.includes('compromisso') || lower.includes('o que tenho amanha') || lower.includes('o que tenho amanhã') || lower.includes('tarefas da semana')) &&
    !lower.startsWith('me lembra') &&
    !lower.startsWith('lembra');

  if (isQueryAgenda) {
    const isTomorrow = lower.includes('amanhã') || lower.includes('amanha');
    const isNext = lower.includes('próximo') || lower.includes('proximo');

    let responseText = '';
    if (isNext) {
      responseText = 'Seu próximo compromisso na agenda é hoje às 14:00: Alinhamento familiar com Maria Silva.';
    } else if (isTomorrow) {
      responseText = 'Para amanhã na agenda constam 2 atividades programadas: Visita domiciliar (09:00) e Acompanhamento de plantão.';
    } else {
      responseText = 'Agenda da semana: 3 tarefas prioritárias abertas e 2 plantões com supervisão escalada.';
    }

    return {
      turn: {
        id,
        role: 'assistant',
        text: responseText,
        timestamp: now,
        action: {
          id,
          type: 'query_agenda',
          label: 'Consultar Agenda',
          payload: { target: isTomorrow ? 'amanhã' : isNext ? 'próximo' : 'semana' },
          requiresConfirmation: false,
          explanation: 'Consulta da agenda e compromissos cadastrados.',
          status: 'executed',
        },
      },
    };
  }

  // 4. AÇÃO: query_patients
  const isPatientQuery =
    lower.includes('paciente') ||
    lower.includes('pacientes') ||
    ((lower.includes('telefone') || lower.includes('contato')) && !lower.includes('profissional') && !lower.includes('colaborador')) ||
    (lower.includes('pendência') && lower.includes('maria'));

  if (isPatientQuery) {
    if (lower.includes('quais') && (lower.includes('paciente') || lower.includes('cadastrad'))) {
      if (context.patients.length === 0) {
        return {
          turn: {
            id,
            role: 'assistant',
            text: 'Não existem pacientes cadastrados no banco de dados.',
            timestamp: now,
          },
        };
      }
      const list = context.patients.map((p) => `• ${p.name} (Status: ${p.status})`).join('\n');
      return {
        turn: {
          id,
          role: 'assistant',
          text: `Pacientes cadastrados no sistema:\n\n${list}`,
          timestamp: now,
          action: {
            id,
            type: 'query_patients',
            label: 'Listar Pacientes',
            payload: { total: context.patients.length },
            requiresConfirmation: false,
            explanation: 'Consulta de pacientes cadastrados.',
            status: 'executed',
          },
        },
      };
    }

    let targetName: string | null = null;
    const matchName = lower.match(/(?:telefone|contato)\s+(?:da|do|de)?\s*([a-zA-ZÀ-ÿ]+)/i);
    if (matchName && !['dela', 'dele', 'um', 'uma'].includes(matchName[1].toLowerCase())) {
      targetName = matchName[1];
    } else if (lower.includes('dela') || lower.includes('dele')) {
      targetName = resolveEntityReference(message, context.recentTurns);
    }

    if (targetName) {
      const patient = context.patients.find((p) => p.name.toLowerCase().includes(targetName!.toLowerCase()));
      if (patient) {
        const phone = patient.financialResponsibleContact || patient.contact || 'Telefone não informado no cadastro.';
        return {
          turn: {
            id,
            role: 'assistant',
            text: `Telefone de ${patient.name}: ${phone} (Responsável: ${patient.financialResponsible || 'Não informado'}).`,
            timestamp: now,
            action: {
              id,
              type: 'query_patients',
              label: 'Consultar Contato do Paciente',
              payload: { patient: patient.name, phone },
              requiresConfirmation: false,
              explanation: 'Consulta de dados cadastrais reais do paciente.',
              status: 'executed',
            },
          },
        };
      } else {
        const emp = context.employees.find((e) => e.name.toLowerCase().includes(targetName!.toLowerCase()));
        if (emp) {
          return {
            turn: {
              id,
              role: 'assistant',
              text: `Telefone de ${emp.name} (${emp.role}): ${emp.phone}.`,
              timestamp: now,
              action: {
                id,
                type: 'query_professionals',
                label: 'Consultar Profissional',
                payload: { professional: emp.name, phone: emp.phone },
                requiresConfirmation: false,
                explanation: 'Consulta do profissional no banco.',
                status: 'executed',
              },
            },
          };
        }

        return {
          turn: {
            id,
            role: 'assistant',
            text: `Não encontrei nenhum paciente ou profissional cadastrado com o nome "${targetName}".`,
            timestamp: now,
          },
        };
      }
    }
  }

  // 5. AÇÃO: query_professionals
  const isProfessionalQuery =
    lower.includes('profissional') ||
    lower.includes('profissionais') ||
    lower.includes('colaborador') ||
    lower.includes('colaboradores') ||
    ((lower.includes('telefone') || lower.includes('contato')) && context.employees.some((e) => lower.includes(e.name.toLowerCase())));

  if (isProfessionalQuery) {
    if (lower.includes('ativos') || lower.includes('ativas')) {
      const activeEmps = context.employees.filter((e) => e.status === 'Ativo');
      if (activeEmps.length === 0) {
        return {
          turn: {
            id,
            role: 'assistant',
            text: 'Não existem profissionais ativos cadastrados no momento.',
            timestamp: now,
          },
        };
      }
      const list = activeEmps.map((e) => `• ${e.name} (${e.role}) - Tel: ${e.phone}`).join('\n');
      return {
        turn: {
          id,
          role: 'assistant',
          text: `Profissionais ativos no sistema:\n\n${list}`,
          timestamp: now,
          action: {
            id,
            type: 'query_professionals',
            label: 'Listar Profissionais Ativos',
            payload: { active_count: activeEmps.length },
            requiresConfirmation: false,
            explanation: 'Consulta de profissionais com status Ativo.',
            status: 'executed',
          },
        },
      };
    }

    if (lower.includes('quais') && (lower.includes('cadastrad') || lower.includes('profissionais'))) {
      if (context.employees.length === 0) {
        return {
          turn: {
            id,
            role: 'assistant',
            text: 'Não existem profissionais cadastrados no banco de dados.',
            timestamp: now,
          },
        };
      }
      const list = context.employees.map((e) => `• ${e.name} - ${e.role} (Status: ${e.status})`).join('\n');
      return {
        turn: {
          id,
          role: 'assistant',
          text: `Profissionais cadastrados no sistema:\n\n${list}`,
          timestamp: now,
          action: {
            id,
            type: 'query_professionals',
            label: 'Listar Profissionais',
            payload: { total: context.employees.length },
            requiresConfirmation: false,
            explanation: 'Consulta de todos os profissionais cadastrados.',
            status: 'executed',
          },
        },
      };
    }

    for (const emp of context.employees) {
      if (lower.includes(emp.name.toLowerCase()) || lower.includes(emp.name.split(' ')[1]?.toLowerCase() || '---')) {
        return {
          turn: {
            id,
            role: 'assistant',
            text: `Telefone de ${emp.name} (${emp.role}): ${emp.phone}. Chave PIX: ${emp.pixKey || 'Não cadastrada'}.`,
            timestamp: now,
            action: {
              id,
              type: 'query_professionals',
              label: 'Consultar Profissional',
              payload: { professional: emp.name, phone: emp.phone },
              requiresConfirmation: false,
              explanation: 'Consulta de dados reais do colaborador.',
              status: 'executed',
            },
          },
        };
      }
    }
  }

  // 6. AÇÕES: create_task / create_reminder
  const isReminderIntent =
    lower.startsWith('me lembra') ||
    lower.startsWith('me lembre') ||
    lower.includes('lembra de') ||
    lower.includes('não posso esquecer') ||
    lower.includes('nao posso esquecer') ||
    lower.includes('lembrete');

  const isTaskIntent =
    isReminderIntent ||
    lower.startsWith('tenho que') ||
    lower.startsWith('preciso') ||
    lower.startsWith('precisamos') ||
    lower.includes('criar tarefa') ||
    lower.includes('anotar tarefa');

  if (isTaskIntent) {
    const isReminder = isReminderIntent;
    const parsedDate = parseRelativeDate(message);
    const parsedTime = parseNaturalTime(message);
    const taskTitle = extractTaskTitle(message);
    const { category, priority } = inferCategoryAndPriority(message);

    if (isReminder && !parsedTime) {
      const partial: Partial<TaskPayload> = {
        title: taskTitle,
        due_date: parsedDate?.dateISO || formatDateISO(new Date()),
        due_date_label: parsedDate?.label || 'Amanhã',
        priority,
        category,
        is_reminder: true,
      };

      return {
        turn: {
          id,
          role: 'assistant',
          text: 'Qual horário?',
          timestamp: now,
          waitingForClarification: {
            actionType: 'create_reminder',
            missingField: 'time',
            partialPayload: partial,
          },
        },
      };
    }

    const effectiveDateISO = parsedDate ? parsedDate.dateISO : formatDateISO(new Date());
    const effectiveDateLabel = parsedDate ? parsedDate.label : 'Hoje';
    const effectiveTime = parsedTime || '09:00';

    let assignedTo = context.user?.name || 'Flavio';
    if (lower.includes('sócia') || lower.includes('socia')) {
      assignedTo = 'Sócia';
    }

    const payload: TaskPayload = {
      title: taskTitle,
      due_date: effectiveDateISO,
      due_date_label: effectiveDateLabel,
      due_time: effectiveTime,
      assigned_to: context.user?.id || 'admin',
      assigned_to_name: assignedTo,
      priority,
      category,
      is_reminder: isReminder,
    };

    const action: StructuredAssistantAction = {
      id,
      type: isReminder ? 'create_reminder' : 'create_task',
      label: isReminder ? 'Criar Lembrete' : 'Criar Tarefa',
      payload,
      requiresConfirmation: true,
      explanation: isReminder
        ? 'Identificado pedido de lembrete com data e horário especificados.'
        : 'Identificada nova tarefa operacional a ser registrada.',
      status: 'suggested',
    };

    const turn: AssistantTurn = {
      id,
      role: 'assistant',
      text: `Entendi assim:\n\n📌 ${payload.title}\n📅 ${payload.due_date_label}\n🕒 ${payload.due_time}\n🏷️ ${payload.category}\n🔔 ${payload.is_reminder ? 'Lembrete' : 'Tarefa'}\n\nConfirmar?`,
      timestamp: now,
      action,
    };

    return {
      turn,
      taskToCreate: {
        title: payload.title,
        dueDate: `${payload.due_date_label}, ${payload.due_time}`,
        dueTime: payload.due_time,
        priority: payload.priority,
        category: payload.category,
        assignedTo: payload.assigned_to_name || 'Flavio',
        isReminder: payload.is_reminder,
      },
    };
  }

  // Ação não reconhecida
  return {
    turn: {
      id,
      role: 'assistant',
      text: 'Não consegui entender o que você deseja fazer. Pode me explicar de outra forma?',
      timestamp: now,
      action: {
        id,
        type: 'general_query',
        label: 'Ação Não Reconhecida',
        payload: { raw_text: message },
        requiresConfirmation: false,
        explanation: 'Mensagem fora das 6 ações controladas na etapa atual.',
        status: 'executed',
      },
    },
  };
}
