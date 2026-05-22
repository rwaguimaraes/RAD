'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface ProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedUser: { id: string; username: string; email: string; avatar_color: string }) => void;
  currentUser: { id: string; username: string; email: string; avatar_color: string } | null;
}

const AVATAR_COLORS = [
  { name: 'Verde Esmeralda', value: '#10b981' },
  { name: 'Azul Oceano', value: '#3b82f6' },
  { name: 'Roxo Real', value: '#8b5cf6' },
  { name: 'Laranja Sunset', value: '#f97316' },
  { name: 'Rosa Choque', value: '#ec4899' },
  { name: 'Amarelo Âmbar', value: '#f59e0b' },
  { name: 'Cinza Escuro', value: '#374151' },
];

export default function ProfileDialog({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
}: ProfileDialogProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [avatarColor, setAvatarColor] = useState('#10b981');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser && isOpen) {
      setUsername(currentUser.username);
      setEmail(currentUser.email || '');
      setAvatarColor(currentUser.avatar_color || '#10b981');
      setPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'U';
    const clean = nameStr.trim();
    if (clean.length === 1) return clean.toUpperCase();
    return clean.substring(0, 2).toUpperCase();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setError('O nome de usuário é obrigatório.');
      return;
    }
    if (username.trim().length < 3) {
      setError('O usuário deve ter no mínimo 3 caracteres.');
      return;
    }

    if (!email.trim()) {
      setError('O e-mail é obrigatório.');
      return;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (password && password.length < 6) {
      setError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim().toLowerCase(),
          avatar_color: avatarColor,
          password: password || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao atualizar perfil.');
      }

      onSuccess(data.user);
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
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-xl font-semibold text-gray-800">Alterar Perfil</h2>
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

          {/* Avatar Preview */}
          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            <div
              style={{ backgroundColor: avatarColor }}
              className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white shadow-md transition-all duration-300 ease-out"
            >
              {getInitials(username)}
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Visualização do Avatar
            </span>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome de Usuário</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cor do Avatar</label>
            <div className="flex flex-wrap gap-3">
              {AVATAR_COLORS.map((col) => (
                <button
                  key={col.value}
                  type="button"
                  onClick={() => setAvatarColor(col.value)}
                  style={{ backgroundColor: col.value }}
                  title={col.name}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white shadow-sm ring-2 ring-transparent hover:scale-105 active:scale-95 transition-all focus:outline-none"
                >
                  {avatarColor === col.value && (
                    <Check size={14} className="text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Passwords */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Alterar Senha (Opcional)
            </h4>
            <div>
              <label className="block text-xs font-medium text-gray-500">Nova Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Deixe em branco para manter a atual"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a nova senha"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Action buttons */}
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
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
