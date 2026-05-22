'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface NewExerciseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exerciseToEdit: { id: string; name: string; target_reps: number } | null;
}

export default function NewExerciseDialog({
  isOpen,
  onClose,
  onSuccess,
  exerciseToEdit,
}: NewExerciseDialogProps) {
  const [name, setName] = useState('');
  const [targetReps, setTargetReps] = useState('100');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (exerciseToEdit) {
      setName(exerciseToEdit.name);
      setTargetReps(exerciseToEdit.target_reps.toString());
    } else {
      setName('');
      setTargetReps('100');
    }
    setError('');
  }, [exerciseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome do exercício é obrigatório.');
      return;
    }
    if (isNaN(Number(targetReps)) || Number(targetReps) <= 0) {
      setError('A meta de repetições (PTR) deve ser maior que 0.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const url = '/api/exercises';
      const method = exerciseToEdit ? 'PUT' : 'POST';
      const body = exerciseToEdit
        ? { id: exerciseToEdit.id, name, target_reps: Number(targetReps) }
        : { name, target_reps: Number(targetReps) };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar exercício.');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all duration-200">
      <div className="w-full max-w-md rounded-xl border border-gray-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-xl font-semibold text-gray-800">
            {exerciseToEdit ? 'Editar Exercício' : 'Novo Exercício'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome do Exercício
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Sintonia 1, Giro do Pêndulo..."
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Repetições Programadas (PTR)
            </label>
            <input
              type="number"
              value={targetReps}
              onChange={(e) => setTargetReps(e.target.value)}
              min="1"
              placeholder="Ex: 200"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              required
            />
          </div>

          <div className="flex justify-end space-x-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              {loading ? 'Salvando...' : 'Salvar Exercício'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
