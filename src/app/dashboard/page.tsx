'use client';

import React, { useState, useEffect } from 'react';
import DashboardHeader from '@/components/DashboardHeader';
import MetricCards from '@/components/MetricCards';
import ExercisesTable from '@/components/ExercisesTable';
import SessionsTable from '@/components/SessionsTable';
import ChatPanel from '@/components/ChatPanel';
import NewExerciseDialog from '@/components/NewExerciseDialog';
import RegisterSessionDialog from '@/components/RegisterSessionDialog';
import ProfileDialog from '@/components/ProfileDialog';
import { Plus, RefreshCw, CalendarDays, Loader2 } from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_color: string;
}

interface Exercise {
  id: string;
  name: string;
  target_reps: number;
  reps_completed: number;
}

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

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  // Dialog & Slide-out Panel states
  const [isExerciseOpen, setIsExerciseOpen] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<Exercise | null>(null);
  const [activeChatRoom, setActiveChatRoom] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch user profile
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      if (userRes.ok && userData.user) {
        setUser(userData.user);
      }

      // Fetch exercises and sessions
      await fetchUserData();
    } catch (err) {
      setError('Erro ao carregar dados iniciais.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const [exRes, sessRes] = await Promise.all([
        fetch('/api/exercises'),
        fetch('/api/sessions'),
      ]);

      const exData = await exRes.json();
      const sessData = await sessRes.json();

      if (exRes.ok) setExercises(exData.exercises || []);
      if (sessRes.ok) setSessions(sessData.sessions || []);
    } catch (err) {
      console.error('Fetch user data error:', err);
    }
  };

  const handleRestoreDefaults = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/exercises/restore-defaults', { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao restaurar padrões.');
      }
      await fetchUserData();
    } catch (err: any) {
      alert(err.message || 'Erro ao restaurar.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteExercise = async (id: string) => {
    try {
      const res = await fetch(`/api/exercises?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao deletar.');
      }
      await fetchUserData();
    } catch (err: any) {
      alert(err.message || 'Erro ao deletar exercício.');
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      const res = await fetch(`/api/sessions?id=${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erro ao deletar.');
      }
      await fetchUserData();
    } catch (err: any) {
      alert(err.message || 'Erro ao deletar sessão.');
    }
  };

  const handleOpenEditExercise = (exercise: Exercise) => {
    setExerciseToEdit(exercise);
    setIsExerciseOpen(true);
  };

  const handleOpenNewExercise = () => {
    setExerciseToEdit(null);
    setIsExerciseOpen(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
          <p className="mt-2 text-sm font-semibold text-gray-500">Carregando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pb-12">
      {/* Header */}
      <DashboardHeader
        username={user?.username || 'Usuário'}
        avatarColor={user?.avatar_color}
        email={user?.email}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
            {error}
          </div>
        )}

        {/* Dashboard Title & Action Row */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
              Meu Painel de Exercícios
            </h1>
            <p className="text-xs text-gray-400 font-medium mt-0.5">
              Monitore sua sensibilidade radiestésica e consulte registros de sessões
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenNewExercise}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none"
            >
              <Plus size={16} />
              <span>Novo Exercício</span>
            </button>

            <button
              onClick={handleRestoreDefaults}
              disabled={actionLoading}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm focus:outline-none"
            >
              <RefreshCw size={14} className={actionLoading ? 'animate-spin' : ''} />
              <span>Restaurar Exercícios Padrão</span>
            </button>

            <button
              onClick={() => setIsSessionOpen(true)}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <CalendarDays size={16} />
              <span>Registrar Sessão</span>
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="mt-8">
          <MetricCards exercises={exercises} />
        </div>

        {/* Exercises Table Row */}
        <div className="mt-8">
          <ExercisesTable
            exercises={exercises}
            onOpenChat={(name) => setActiveChatRoom(name)}
            onEdit={handleOpenEditExercise}
            onDelete={handleDeleteExercise}
          />
        </div>

        {/* Sessions Table Row */}
        <SessionsTable sessions={sessions} onDelete={handleDeleteSession} />
      </main>

      {/* Modals and Sidebar Drawer */}
      <NewExerciseDialog
        isOpen={isExerciseOpen}
        onClose={() => setIsExerciseOpen(false)}
        onSuccess={fetchUserData}
        exerciseToEdit={exerciseToEdit}
      />

      <RegisterSessionDialog
        isOpen={isSessionOpen}
        onClose={() => setIsSessionOpen(false)}
        onSuccess={fetchUserData}
        exercises={exercises}
      />

      <ChatPanel
        isOpen={activeChatRoom !== null}
        onClose={() => setActiveChatRoom(null)}
        roomName={activeChatRoom || ''}
        currentUser={user}
      />

      <ProfileDialog
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onSuccess={(updatedUser) => {
          setUser(updatedUser);
        }}
        currentUser={user}
      />
    </div>
  );
}
