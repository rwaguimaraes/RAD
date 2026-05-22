'use client';

import React from 'react';
import { MessageSquare, Pencil, Trash2 } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  target_reps: number;
  reps_completed: number;
}

interface ExercisesTableProps {
  exercises: Exercise[];
  onOpenChat: (name: string) => void;
  onEdit: (exercise: Exercise) => void;
  onDelete: (id: string) => void;
}

export default function ExercisesTable({
  exercises,
  onOpenChat,
  onEdit,
  onDelete,
}: ExercisesTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Meus Exercícios</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th className="py-4 px-6">Exercício</th>
              <th className="py-4 px-6 text-center">Repetições (PTR)</th>
              <th className="py-4 px-6 text-center">Repetições Feitas</th>
              <th className="py-4 px-6 text-center">Status</th>
              <th className="py-4 px-6 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {exercises.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                  Nenhum exercício cadastrado. Clique em "+ Novo Exercício" ou "+ Restaurar Exercícios Padrão".
                </td>
              </tr>
            ) : (
              exercises.map((ex) => {
                const isCompleted = ex.reps_completed >= ex.target_reps;
                return (
                  <tr
                    key={ex.id}
                    className={`text-sm transition-colors hover:bg-gray-50/50 ${
                      isCompleted ? 'bg-emerald-50/40 text-emerald-900' : 'text-gray-700'
                    }`}
                  >
                    <td className="py-4 px-6 font-medium">{ex.name}</td>
                    <td className="py-4 px-6 text-center font-semibold">{ex.target_reps}</td>
                    <td className="py-4 px-6 text-center font-semibold">{ex.reps_completed}</td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isCompleted ? 'Concluído' : 'Em Andamento'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          onClick={() => onOpenChat(ex.name)}
                          title="Abrir Chat de Exercício"
                          className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-100/50 transition-colors"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button
                          onClick={() => onEdit(ex)}
                          title="Editar"
                          className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-100/50 transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir o exercício "${ex.name}" e todas as suas sessões?`)) {
                              onDelete(ex.id);
                            }
                          }}
                          title="Excluir"
                          className="rounded-lg p-1.5 text-red-600 hover:bg-red-100/50 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
