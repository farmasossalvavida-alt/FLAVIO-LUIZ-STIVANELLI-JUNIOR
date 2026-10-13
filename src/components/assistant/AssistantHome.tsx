import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Send,
  AlertCircle,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Check,
  X,
  Edit2,
  Volume2,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { processAssistantMessage } from '../../services/assistantEngine';
import { AssistantTurn, StructuredAssistantAction, TaskPayload } from '../../types/actions';
import { Patient, Employee } from '../../types';
import { TaskItem } from '../../types/tasks';

type VoiceState = 'IDLE' | 'LISTENING' | 'PROCESSING' | 'ERROR';

interface AssistantHomeProps {
  onNavigate: (view: string) => void;
  onAddAuditLog: (action: string, entityType: string, details: any) => void;
  patients: Patient[];
  employees: Employee[];
  tasks: TaskItem[];
  onAddTask: (task: Omit<TaskItem, 'id'>) => void;
}

export const AssistantHome: React.FC<AssistantHomeProps> = ({
  onNavigate,
  onAddAuditLog,
  patients,
  employees,
  tasks,
  onAddTask,
}) => {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const speechTranscriptRef = useRef<string>('');
  const speechProcessedRef = useRef<boolean>(false);
  const errorTimerRef = useRef<any>(null);
  const [editingActionId, setEditingActionId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<TaskPayload>>({});

  const [turns, setTurns] = useState<AssistantTurn[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Olá! Sou o Assistente Privilege. Você pode criar tarefas, lembretes e consultar pacientes, profissionais ou pendências.',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const handleSend = (textToSend?: string) => {
    const message = (textToSend || inputText).trim();
    if (!message) return;

    const userTurn: AssistantTurn = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    const result = processAssistantMessage(message, {
      user: user ? { id: user.id, name: user.name } : null,
      patients,
      employees,
      tasks,
      recentTurns: turns,
    });

    setTurns((prev) => [...prev, userTurn, result.turn]);
    setInputText('');

    if (onAddAuditLog) {
      onAddAuditLog(
        `Interação no assistente: "${message.slice(0, 40)}"`,
        'conversations',
        { text: message, intent: result.turn.action?.type }
      );
    }
  };

  const handleConfirmAction = (turn: AssistantTurn) => {
    if (!turn.action) return;
    const action = turn.action;
    const payload = action.payload as TaskPayload;

    // Se a ação for de criação, persiste na lista de tarefas
    if (action.type === 'create_task' || action.type === 'create_reminder') {
      onAddTask({
        title: payload.title,
        category: payload.category || 'Geral',
        dueDate: `${payload.due_date_label || 'Data'}, ${payload.due_time || '09:00'}`,
        priority: payload.priority || 'medium',
        assignedTo: payload.assigned_to_name || user?.name || 'Flavio',
        status: 'pending',
        isReminder: action.type === 'create_reminder' || payload.is_reminder,
      });

      if (onAddAuditLog) {
        onAddAuditLog(
          `${action.type === 'create_reminder' ? 'Lembrete' : 'Tarefa'} criada: ${payload.title}`,
          'tasks',
          payload
        );
      }
    }

    setTurns((prev) =>
      prev.map((t) => {
        if (t.id === turn.id && t.action) {
          return {
            ...t,
            action: { ...t.action, status: 'executed' },
            text: `Certo. ${action.type === 'create_reminder' ? 'Lembrete criado' : 'Tarefa criada'} para ${payload.due_date_label} às ${payload.due_time}.`,
          };
        }
        return t;
      })
    );
    setEditingActionId(null);
  };

  const handleCancelAction = (turn: AssistantTurn) => {
    setTurns((prev) =>
      prev.map((t) => {
        if (t.id === turn.id && t.action) {
          return {
            ...t,
            action: { ...t.action, status: 'cancelled' },
            text: 'Ação cancelada. Nenhuma informação foi alterada.',
          };
        }
        return t;
      })
    );
    setEditingActionId(null);
  };

  const handleStartEdit = (action: StructuredAssistantAction) => {
    setEditingActionId(action.id);
    setEditFormData(action.payload as TaskPayload);
  };

  const handleSaveEdit = (turn: AssistantTurn) => {
    if (!turn.action) return;
    const updatedPayload = { ...turn.action.payload, ...editFormData };
    setTurns((prev) =>
      prev.map((t) => {
        if (t.id === turn.id && t.action) {
          return {
            ...t,
            action: {
              ...t.action,
              payload: updatedPayload,
            },
            text: `Entendi assim:\n\n📌 ${updatedPayload.title}\n📅 ${updatedPayload.due_date_label || updatedPayload.due_date}\n🕒 ${updatedPayload.due_time}\n🏷️ ${updatedPayload.category}\n🔔 ${updatedPayload.is_reminder ? 'Lembrete' : 'Tarefa'}\n\nConfirmar?`,
          };
        }
        return t;
      })
    );
    setEditingActionId(null);
  };

  const clearErrorTimer = () => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  };

  const showVoiceError = (errorMessage: string) => {
    clearErrorTimer();
    setVoiceState('ERROR');
    setVoiceError(errorMessage);
    errorTimerRef.current = setTimeout(() => {
      setVoiceState('IDLE');
      setVoiceError(null);
    }, 4500);
  };

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignora se já estiver parado
      }
      recognitionRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearErrorTimer();
      stopRecognition();
    };
  }, []);

  const handleVoiceClick = async () => {
    clearErrorTimer();

    // Se já estiver ouvindo, encerra a captura manualmente
    if (voiceState === 'LISTENING') {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // fallback
        }
      }
      return;
    }

    // Se estiver em processamento, não faz nada
    if (voiceState === 'PROCESSING') return;

    setVoiceError(null);

    // 1. Verifica compatibilidade do navegador com SpeechRecognition
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      showVoiceError('Seu navegador não oferece suporte à entrada por voz. Você pode continuar digitando.');
      return;
    }

    // 2. Solicitar permissão para microfone se necessário
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Encerra imediatamente as tracks de teste para liberar o canal
        stream.getTracks().forEach((track) => track.stop());
      } catch (err: any) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          showVoiceError('Para usar o assistente por voz, permita o acesso ao microfone.');
          return;
        } else {
          showVoiceError('Permita o acesso ao microfone para usar o assistente por voz.');
          return;
        }
      }
    }

    // 3. Inicializa SpeechRecognition em pt-BR
    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'pt-BR';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      speechTranscriptRef.current = '';
      speechProcessedRef.current = false;
      recognitionRef.current = recognition;

      recognition.onstart = () => {
        setVoiceState('LISTENING');
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const transcript = result[0]?.transcript || '';
          if (result.isFinal) {
            final += transcript;
          } else {
            interim += transcript;
          }
        }

        const recognizedText = (final || interim).trim();
        if (recognizedText) {
          speechTranscriptRef.current = recognizedText;
          setInputText(recognizedText);
        }
      };

      recognition.onerror = (event: any) => {
        const errorType = event?.error;
        stopRecognition();

        if (errorType === 'no-speech') {
          showVoiceError('Não consegui ouvir nada. Tente novamente.');
        } else if (errorType === 'not-allowed' || errorType === 'service-not-allowed') {
          showVoiceError('Para usar o assistente por voz, permita o acesso ao microfone.');
        } else if (errorType === 'audio-capture') {
          showVoiceError('Permita o acesso ao microfone para usar o assistente por voz.');
        } else if (errorType === 'network' || errorType === 'bad-grammar') {
          showVoiceError('Não consegui processar sua voz agora. Você pode continuar digitando.');
        } else {
          showVoiceError('Não consegui entender o áudio. Tente novamente.');
        }
      };

      recognition.onend = () => {
        recognitionRef.current = null;
        const capturedText = speechTranscriptRef.current.trim();

        if (speechProcessedRef.current) return;
        speechProcessedRef.current = true;

        if (!capturedText) {
          // Se não capturou texto e não está em estado de erro
          setVoiceState((current) => {
            if (current === 'LISTENING') {
              showVoiceError('Não consegui ouvir nada. Tente novamente.');
              return 'ERROR';
            }
            return current;
          });
          return;
        }

        // Coloca o texto transcrito no campo de mensagem
        setInputText(capturedText);
        setVoiceState('PROCESSING');

        // Envia o texto para o MESMO fluxo de IA já existente
        setTimeout(() => {
          handleSend(capturedText);
          setVoiceState('IDLE');
          speechTranscriptRef.current = '';
        }, 300);
      };

      recognition.start();
    } catch {
      showVoiceError('Não consegui processar sua voz agora. Você pode continuar digitando.');
    }
  };

  // Contadores para os cards do bloco "PRECISA DA SUA ATENÇÃO"
  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const todayTasks = tasks.filter((t) => t.dueDate.toLowerCase().includes('hoje') && t.status === 'pending');
  const lateTasks = tasks.filter((t) => t.dueDate.toLowerCase().includes('atrasad') && t.status === 'pending');

  const samplePrompts = [
    'Me lembra amanhã às 15h de ligar para a família da Maria.',
    'O que tenho para hoje?',
    'Quais tarefas estão atrasadas?',
    'Tenho que conferir o contrato da Maria sexta às 10.',
    'Qual o telefone da Maria?',
    'Quais profissionais estão ativos?',
    'Me lembra amanhã de ligar para Maria.',
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* CABEÇALHO COM SAUDAÇÃO DINÂMICA */}
      <div className="text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Assistente Administrativo Inteligente
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white font-tech">
          ASSISTENTE PRIVILEGE
        </h1>
        <p className="text-slate-400 mt-1 text-lg">
          {getGreeting()}, <span className="text-pastel-pink font-semibold">{user?.name || 'Administrador'}</span>. O que você gostaria de resolver agora?
        </p>
      </div>

      {/* ÁREA CENTRAL DE COMANDO: BOTÃO FALAR + INPUT */}
      <div className="neon-card p-6 md:p-8 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
        <div className="flex flex-col items-center justify-center py-4">
          <button
            onClick={handleVoiceClick}
            type="button"
            className={`group relative flex items-center justify-center gap-3 px-8 py-5 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-2xl ${
              isListening
                ? 'bg-rose-500 text-white shadow-rose-500/40 animate-pulse scale-105'
                : 'bg-gradient-to-r from-pastel-pink to-pink-500 text-slate-950 hover:brightness-110 shadow-pink-500/30 hover:scale-105'
            }`}
          >
            <Mic className={`w-7 h-7 ${isListening ? 'animate-bounce' : ''}`} />
            <span className="tracking-wide">{isListening ? 'OUVINDO...' : 'FALAR'}</span>
          </button>
          <p className="text-xs text-slate-400 mt-3">
            {isListening
              ? 'Reconhecimento de voz em preparação para próxima etapa'
              : 'Clique para falar ou digite sua solicitação no campo abaixo'}
          </p>
        </div>

        {/* Campo de texto e Enviar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="w-full px-5 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-pastel-blue text-sm md:text-base"
            />
          </div>
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-pastel-blue text-slate-950 font-semibold hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
          >
            <span>Enviar</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Sugestões rápidas das ações solicitadas */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-left">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-2">
            Exemplos de testes:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(prompt)}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-all text-left"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ÁREA DE CONVERSA DO ASSISTENTE PRIVILEGE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-pastel-pink" />
            Conversa com o Assistente Privilege
          </h2>
          <span className="text-xs text-slate-400">
            Ações estruturadas validadas antes de gravar no banco
          </span>
        </div>

        <div className="space-y-3">
          {turns.map((turn) => (
            <div
              key={turn.id}
              className={`p-4 md:p-5 rounded-2xl border transition-all ${
                turn.role === 'user'
                  ? 'bg-slate-900/60 border-slate-800 ml-8 text-right'
                  : 'bg-slate-900/90 border-slate-700/80 mr-4'
              }`}
            >
              <div className="flex items-center justify-between mb-2 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">
                  {turn.role === 'user' ? (user?.name || 'Você') : 'Assistente Privilege'}
                </span>
                <span>{turn.timestamp}</span>
              </div>
              <p className="text-slate-200 text-sm md:text-base leading-relaxed text-left whitespace-pre-line">
                {turn.text}
              </p>

              {/* CARD DE CONFIRMAÇÃO / AÇÃO ESTRUTURADA */}
              {turn.action && turn.action.requiresConfirmation && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-pastel-pink/30 text-left">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-pastel-pink uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {turn.action.label}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                        turn.action.status === 'executed'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : turn.action.status === 'cancelled'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {turn.action.status === 'executed'
                        ? 'Registrado no Banco'
                        : turn.action.status === 'cancelled'
                        ? 'Cancelado'
                        : 'Aguardando Confirmação'}
                    </span>
                  </div>

                  {editingActionId === turn.action.id ? (
                    <div className="space-y-3 mb-4 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Título</label>
                        <input
                          type="text"
                          value={editFormData.title || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs rounded bg-slate-950 border border-slate-700 text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Horário</label>
                          <input
                            type="text"
                            value={editFormData.due_time || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, due_time: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs rounded bg-slate-950 border border-slate-700 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1">Categoria</label>
                          <input
                            type="text"
                            value={editFormData.category || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                            className="w-full px-3 py-1.5 text-xs rounded bg-slate-950 border border-slate-700 text-white"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingActionId(null)}
                          className="px-2.5 py-1 text-xs rounded bg-slate-800 text-slate-300"
                        >
                          Fechar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(turn)}
                          className="px-2.5 py-1 text-xs rounded bg-pastel-blue text-slate-950 font-semibold"
                        >
                          Salvar Alteração
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {turn.action.status === 'suggested' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                      <button
                        onClick={() => handleConfirmAction(turn)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-emerald-900/30"
                      >
                        <Check className="w-3.5 h-3.5" />
                        CONFIRMAR
                      </button>
                      <button
                        onClick={() => handleStartEdit(turn.action!)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        EDITAR
                      </button>
                      <button
                        onClick={() => handleCancelAction(turn)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-300 text-xs font-semibold transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        CANCELAR
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ÁREA: "PRECISA DA SUA ATENÇÃO" */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white tracking-wide uppercase font-tech flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-pastel-pink" />
            PRECISA DA SUA ATENÇÃO
          </h2>
          <span className="text-xs text-slate-400">Resumo operacional sincronizado</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigate('tasks')}
            className="neon-card p-5 rounded-xl border border-slate-800 cursor-pointer hover:border-pastel-pink/50 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-semibold text-slate-400">Pendências</span>
              <AlertCircle className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{pendingTasks.length}</div>
            <p className="text-xs text-slate-400">Demandas abertas para os sócios</p>
            <div className="mt-3 text-xs text-pastel-pink flex items-center gap-1 font-semibold">
              Ver detalhes <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('tasks')}
            className="neon-card p-5 rounded-xl border border-slate-800 cursor-pointer hover:border-pastel-blue/50 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-semibold text-slate-400">Tarefas de Hoje</span>
              <CheckCircle2 className="w-5 h-5 text-pastel-blue group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">{todayTasks.length}</div>
            <p className="text-xs text-slate-400">Atividades com prazo para hoje</p>
            <div className="mt-3 text-xs text-pastel-blue flex items-center gap-1 font-semibold">
              Abrir lista <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('tasks')}
            className="neon-card p-5 rounded-xl border border-slate-800 cursor-pointer hover:border-rose-500/50 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-semibold text-slate-400">Tarefas Atrasadas</span>
              <AlertTriangle className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-rose-400 mb-1">{lateTasks.length}</div>
            <p className="text-xs text-slate-400">Pendências que demandam atenção imediata</p>
            <div className="mt-3 text-xs text-rose-400 flex items-center gap-1 font-semibold">
              Resolver agora <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          <div
            onClick={() => onNavigate('agenda')}
            className="neon-card p-5 rounded-xl border border-slate-800 cursor-pointer hover:border-emerald-500/50 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-semibold text-slate-400">Próximo Compromisso</span>
              <Calendar className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-lg font-bold text-white mb-1">Hoje, 14:00</div>
            <p className="text-xs text-slate-400">Alinhamento familiar • Maria Silva</p>
            <div className="mt-3 text-xs text-emerald-400 flex items-center gap-1 font-semibold">
              Ver agenda <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
