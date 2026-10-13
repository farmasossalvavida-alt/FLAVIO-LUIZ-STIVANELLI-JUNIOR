import React from 'react';
import { Clock, CheckCircle2, User, Plus } from 'lucide-react';
import { TaskItem } from '../../types/tasks';

interface TasksViewProps {
  tasks: TaskItem[];
  onToggleTask: (id: string) => void;
  onAddTask?: (task: Omit<TaskItem, 'id'>) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ tasks, onToggleTask }) => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-tech">TAREFAS & PENDÊNCIAS</h1>
          <p className="text-slate-400 text-sm">
            Gestão integrada de pendências administrativas e lembretes entre os sócios.
          </p>
        </div>
      </div>

      <div className="neon-card p-6 rounded-2xl border border-slate-800 space-y-3">
        {tasks.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">
            Nenhuma tarefa cadastrada no momento.
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              onClick={() => onToggleTask(task.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-4 ${
                task.status === 'completed'
                  ? 'bg-slate-900/40 border-slate-800/60 opacity-60'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    task.status === 'completed'
                      ? 'bg-pastel-pink border-pastel-pink text-slate-950'
                      : 'border-slate-600 hover:border-pastel-pink'
                  }`}
                >
                  {task.status === 'completed' && <CheckCircle2 className="w-4 h-4" />}
                </button>
                <div>
                  <h4
                    className={`text-sm font-medium ${
                      task.status === 'completed' ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  >
                    {task.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="text-pastel-blue">{task.category}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {task.dueDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-500" />
                      Resp: {task.assignedTo}
                    </span>
                    {task.isReminder && (
                      <span className="text-pastel-pink">🔔 Lembrete</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    task.priority === 'urgent'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : task.priority === 'high'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {task.priority === 'urgent'
                    ? 'Urgente'
                    : task.priority === 'high'
                    ? 'Alta'
                    : 'Normal'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
