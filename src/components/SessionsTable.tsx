'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';

interface Session {
  id: string;
  exercise_name: string;
  date: string;
  start_time: string;
  end_time: string;
  reps: number;
  physical: string;
  emotional: string;
  weather: string;
  moon: string;
  notes: string;
}

interface SessionsTableProps {
  sessions: Session[];
  onDelete: (id: string) => void;
}

export default function SessionsTable({ sessions, onDelete }: SessionsTableProps) {
  // Convert YYYY-MM-DD to DD/MM/YYYY for display
  const formatDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm mt-8">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Registro de Sessões</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th className="py-4 px-6">Data</th>
              <th className="py-4 px-6">Exercício</th>
              <th className="py-4 px-6 text-center">Início</th>
              <th className="py-4 px-6 text-center">Fim</th>
              <th className="py-4 px-6 text-center">Reps</th>
              <th className="py-4 px-6 text-center">Físico</th>
              <th className="py-4 px-6 text-center">Emocional</th>
              <th className="py-4 px-6 text-center">Clima</th>
              <th className="py-4 px-6 text-center">Lua</th>
              <th className="py-4 px-6">Obs</th>
              <th className="py-4 px-6 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-10 text-center text-sm text-gray-500">
                  Nenhuma sessão registrada ainda. Clique em "Registrar Sessão" para iniciar.
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr key={session.id} className="text-sm text-gray-700 hover:bg-gray-50/40 transition-colors">
                  <td className="py-4 px-6 whitespace-nowrap">{formatDate(session.date)}</td>
                  <td className="py-4 px-6 font-medium whitespace-nowrap">{session.exercise_name}</td>
                  <td className="py-4 px-6 text-center whitespace-nowrap">{session.start_time}</td>
                  <td className="py-4 px-6 text-center whitespace-nowrap">{session.end_time}</td>
                  <td className="py-4 px-6 text-center font-semibold">{session.reps}</td>
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                      {session.physical}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
                      {session.emotional}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <span className="inline-flex items-center rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
                      {session.weather}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center whitespace-nowrap text-xs font-medium text-indigo-700">
                    {session.moon}
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-500 max-w-[200px] truncate" title={session.notes}>
                    {session.notes || '-'}
                  </td>
                  <td className="py-4 px-6 text-center whitespace-nowrap">
                    <button
                      onClick={() => {
                        if (confirm('Excluir este registro de sessão?')) {
                          onDelete(session.id);
                        }
                      }}
                      title="Excluir"
                      className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition-colors focus:outline-none"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
