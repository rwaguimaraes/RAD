'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
}

interface RegisterSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  exercises: Exercise[];
}

const PHYSICAL_OPTIONS = ['Bom', 'Excelente', 'Cansado', 'Disposto', 'Neutro'];
const EMOTIONAL_OPTIONS = ['Alegre', 'Calmo', 'Focado', 'Ansioso', 'Neutro', 'Estressado'];
const WEATHER_OPTIONS = ['Quente', 'Frio', 'Agradável', 'Chuvoso', 'Seco', 'Úmido'];
const MOON_OPTIONS = ['Lua Nova', 'Lua Crescente', 'Lua Cheia', 'Lua Minguante'];

export default function RegisterSessionDialog({
  isOpen,
  onClose,
  onSuccess,
  exercises,
}: RegisterSessionDialogProps) {
  const [exerciseId, setExerciseId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reps, setReps] = useState('50');
  const [physical, setPhysical] = useState('Bom');
  const [emotional, setEmotional] = useState('Calmo');
  const [weather, setWeather] = useState('Agradável');
  const [moon, setMoon] = useState('Lua Crescente');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Set default times and values when opening
  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      // YYYY-MM-DD
      const localDate = now.toLocaleDateString('en-CA'); // CA outputs YYYY-MM-DD
      setDate(localDate);

      // Start time: 30 minutes ago
      const start = new Date(now.getTime() - 30 * 60 * 1000);
      setStartTime(start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
      setEndTime(now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));

      if (exercises.length > 0) {
        setExerciseId(exercises[0].id);
      } else {
        setExerciseId('');
      }

      setReps('50');
      setPhysical('Bom');
      setEmotional('Calmo');
      setWeather('Agradável');
      setMoon('Lua Crescente');
      setNotes('');
      setError('');
    }
  }, [isOpen, exercises]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!exerciseId) {
      setError('Por favor, selecione um exercício.');
      return;
    }
    if (!date || !startTime || !endTime) {
      setError('Data, início e fim são campos obrigatórios.');
      return;
    }
    if (isNaN(Number(reps)) || Number(reps) <= 0) {
      setError('As repetições devem ser maiores que 0.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise_id: exerciseId,
          date,
          start_time: startTime,
          end_time: endTime,
          reps: Number(reps),
          physical,
          emotional,
          weather,
          moon,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao registrar sessão.');
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
      <div className="w-full max-w-lg rounded-xl border border-gray-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Registrar Sessão</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {exercises.length === 0 ? (
          <div className="mt-6 text-center py-6">
            <p className="text-gray-500 mb-4">Você precisa criar um exercício primeiro.</p>
            <button
              onClick={onClose}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Exercício</label>
              <select
                value={exerciseId}
                onChange={(e) => setExerciseId(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {exercises.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Início</label>
                <input
                  type="text"
                  placeholder="HH:MM"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fim</label>
                <input
                  type="text"
                  placeholder="HH:MM"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Repetições Feitas</label>
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  min="1"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fase da Lua</label>
                <select
                  value={moon}
                  onChange={(e) => setMoon(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {MOON_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado Físico</label>
                <select
                  value={physical}
                  onChange={(e) => setPhysical(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {PHYSICAL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Estado Emocional</label>
                <select
                  value={emotional}
                  onChange={(e) => setEmotional(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {EMOTIONAL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Clima</label>
                <select
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {WEATHER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Observações (OBS)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: O pêndulo se moveu no sentido horário..."
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                {loading ? 'Salvando...' : 'Registrar Sessão'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
