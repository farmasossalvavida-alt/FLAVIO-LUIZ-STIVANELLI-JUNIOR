# Assistente Privilege Care - Fundação Técnica & Arquitetura

## 1. Banco de Dados PostgreSQL & Supabase (10 Tabelas)
A migração completa está versionada em `supabase/migrations/20261013000000_init_privilege_care.sql`:
1. `profiles`: dados dos usuários vinculados a `auth.users` com papéis `admin` e `partner`.
2. `patients`: dados dos pacientes em Home Care.
3. `professionals`: equipe assistencial (médicos, enfermeiros, técnicos).
4. `tasks`: pendências, lembretes e tarefas com prioridades e recorrência.
5. `scales`: escalas planejadas para pacientes.
6. `shifts`: plantões reais realizados com identificação de cobertura (`scheduled_professional_id`).
7. `extras`: gastos/receitas extras (coberturas, materiais, procedimentos, ambulâncias).
8. `payments`: contas a pagar e a receber com status.
9. `conversations`: histórico conversacional (texto e voz).
10. `audit_logs`: trilha imutável de auditoria.

## 2. Segurança & Row Level Security (RLS)
- Supabase Auth integrado via `src/lib/supabaseClient.ts` e `src/context/AuthContext.tsx`.
- Políticas RLS ativas em todas as tabelas: acesso restrito aos administradores autenticados e ativos.
- Dados unificados e compartilhados entre o administrador e sua sócia.
- Nenhum acesso público aos dados sensíveis de saúde ou financeiros.
- Supabase Storage bucket `documents` configurado como privado.

## 3. Interface Responsiva - Assistente Privilege
- **Identidade**: Assistente Privilege (estilo minimalista e moderno).
- **Tela Principal**:
  - Saudação dinâmica por horário do dia.
  - Botão central **🎙️ FALAR**.
  - Campo de mensagem ("Digite uma mensagem...") e botão "Enviar".
  - Área visual de respostas do assistente com cartões de validação antes de alterar dados.
  - Bloco **"PRECISA DA SUA ATENÇÃO"** com cartões para Pendências, Tarefas de Hoje, Tarefas Atrasadas e Próximo Compromisso.
- **Navegação Principal**: Início (Assistente), Agenda, Pessoas, Tarefas e Mais (com suporte mobile inferior e desktop lateral).
- **Camada de IA**: Princípio de ações estruturadas implementado em `src/services/assistantEngine.ts` e tipagens em `src/types/actions.ts`.
