import React, { useState } from 'react';
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
  Volume2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { interpretNaturalLanguage } from '../../services/assistantEngine';
import { AssistantTurn, StructuredAssistantAction } from '../../types/actions';

interface AssistantHomeProps {
  onNavigate: (view: string) => void;
  onAddAuditLog: (action: string, entityType: string, details: any) => void;
}

export const AssistantHome: React.FC<AssistantHomeProps> = ({ onNavigate, onAddAuditLog }) => {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [turns, setTurns] = useState<AssistantTurn[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Olá! Sou o Assistente Privilege. Você pode falar ou digitar naturalmente sobre escalas, pagamentos, plantões e tarefas.',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Saudação dinâmica baseada no horário
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

    const assistantTurn = interpretNaturalLanguage(message);

    setTurns((prev) => [...prev, userTurn, assistantTurn]);
    setInputText('');

    if (onAddAuditLog) {
      onAddAuditLog(
        `Interação com assistente: "${message.slice(0, 40)}..."`,
        'conversations',
        { text: message, intent: assistantTurn.action?.type }
      );
    }
  };

  const handleConfirmAction = (action: StructuredAssistantAction) => {
    action.status = 'executed';
    setTurns((prev) => [...prev]);
    if (onAddAuditLog) {
      onAddAuditLog(
        `Ação confirmada via assistente: ${action.label}`,
        action.type,
        action.payload
      );
    }
  };

  const handleCancelAction = (action: StructuredAssistantAction) => {
    action.status = 'cancelled';
    setTurns((prev) => [...prev]);
  };

  const handleVoiceClick = () => {
    // Preparação visual/estrutural para entrada de voz
    setIsListening((prev) => !prev);
    if (!isListening) {
      setTimeout(() => {
        setIsListening(false);
        handleSend('Me lembra amanhã às 9h de ligar para a família da Maria.');
      }, 1600);
    }
  };

  const samplePrompts = [
    'Me lembra amanhã às 9h de ligar para a família da Maria.',
    'A Camila fez a cobertura da Solange na Maria ontem.',
    'Quanto tenho para pagar para a Camila?',
    'Quais são minhas pendências hoje?',
    'Vamos fechar outubro.',
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
              ? 'Gravando áudio para transcrição...'
              : 'Clique para falar por voz ou digite no campo abaixo'}
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

        {/* Sugestões rápidas de uso futuro */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 text-left">
          <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block mb-2">
            Exemplos de linguagem natural suportados:
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

      {/* ÁREA DE RESPOSTAS E AÇÕES ESTRUTURADAS DO ASSISTENTE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-pastel-pink" />
            Respostas do Assistente & Ações Propostas
          </h2>
          <span className="text-xs text-slate-400">
            Princípio: A IA propõe, o banco armazena, você valida
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
              <p className="text-slate-200 text-sm md:text-base leading-relaxed text-left">
                {turn.text}
              </p>

              {/* CARD DE AÇÃO ESTRUTURADA COM VALIDAÇÃO */}
              {turn.action && (
                <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-pastel-pink/30 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-pastel-pink uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      {turn.action.label}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
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

                  <p className="text-xs text-slate-400 mb-3">{turn.action.explanation}</p>

                  {/* DADOS ESTRUTURADOS EXTRAÍDOS PELA INTENÇÃO */}
                  <div className="bg-slate-900/90 rounded-lg p-3 text-xs text-slate-300 space-y-1 font-mono border border-slate-800">
                    {Object.entries(turn.action.payload).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-400">{k}:</span>
                        <span className="font-semibold text-pastel-blue">
                          {typeof v === 'number'
                            ? v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                            : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* BOTÕES DE CONFIRMAÇÃO / VALIDAÇÃO ANTES DE ALTERAR O BANCO */}
                  {turn.action.requiresConfirmation && turn.action.status === 'suggested' && (
                    <div className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800">
                      <button
                        onClick={() => handleConfirmAction(turn.action!)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Confirmar e Gravar
                      </button>
                      <button
                        onClick={() => handleCancelAction(turn.action!)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        Descartar
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
          <span className="text-xs text-slate-400">Resumo operacional</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card: Pendências */}
          <div
            onClick={() => onNavigate('tasks')}
            className="neon-card p-5 rounded-xl border border-slate-800 cursor-pointer hover:border-pastel-pink/50 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-semibold text-slate-400">Pendências</span>
              <AlertCircle className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">3</div>
            <p className="text-xs text-slate-400">Demandas abertas para os sócios</p>
            <div className="mt-3 text-xs text-pastel-pink flex items-center gap-1 font-semibold">
              Ver detalhes <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card: Tarefas de Hoje */}
          <div
            onClick={() => onNavigate('tasks')}
            className="neon-card p-5 rounded-xl border border-slate-800 cursor-pointer hover:border-pastel-blue/50 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-semibold text-slate-400">Tarefas de Hoje</span>
              <CheckCircle2 className="w-5 h-5 text-pastel-blue group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-white mb-1">5</div>
            <p className="text-xs text-slate-400">2 concluídas, 3 a realizar</p>
            <div className="mt-3 text-xs text-pastel-blue flex items-center gap-1 font-semibold">
              Abrir lista <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card: Tarefas Atrasadas */}
          <div
            onClick={() => onNavigate('tasks')}
            className="neon-card p-5 rounded-xl border border-slate-800 cursor-pointer hover:border-rose-500/50 group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-semibold text-slate-400">Tarefas Atrasadas</span>
              <AlertTriangle className="w-5 h-5 text-rose-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-bold text-rose-400 mb-1">1</div>
            <p className="text-xs text-slate-400">Contrato de renovação pendente</p>
            <div className="mt-3 text-xs text-rose-400 flex items-center gap-1 font-semibold">
              Resolver agora <ArrowRight className="w-3 h-3" />
            </div>
          </div>

          {/* Card: Próximo Compromisso */}
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
