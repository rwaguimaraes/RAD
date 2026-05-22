'use client';

import React from 'react';
import { Sparkles, Bell, HelpCircle, User, LogOut, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
  username: string;
  avatarColor?: string;
  onOpenProfile?: () => void;
  email?: string;
}

export default function DashboardHeader({ username, avatarColor, onOpenProfile, email }: DashboardHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getInitials = (nameStr: string) => {
    if (!nameStr) return 'U';
    const clean = nameStr.trim();
    if (clean.length === 1) return clean.toUpperCase();
    return clean.substring(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-2">
          {/* Brand Icon (pendulum / energy symbol representation) */}
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Sparkles size={20} className="animate-spin-slow" />
          </div>
          <span className="text-lg font-bold text-gray-800 tracking-tight">
            Radiestesia <span className="text-emerald-600">APP</span>
          </span>
        </div>

        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Admin panel button if authorized */}
          {email === 'rwaguimaraes@gmail.com' && (
            <button
              onClick={() => router.push('/admin')}
              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-1 font-semibold border border-emerald-100 bg-emerald-50/30"
              title="Painel de Administração"
            >
              <Shield size={18} />
              <span className="hidden sm:inline text-xs">Admin</span>
            </button>
          )}

          {/* Profile Badge */}
          <button 
            onClick={onOpenProfile}
            className="flex items-center space-x-2 rounded-full bg-gray-50 py-1.5 px-3 border border-gray-100 hover:bg-gray-100 transition-colors text-left"
          >
            <div 
              style={{ backgroundColor: avatarColor || '#10b981' }}
              className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white uppercase transition-colors duration-300"
            >
              {getInitials(username)}
            </div>
            <span className="hidden text-xs font-semibold text-gray-700 sm:inline">
              {username}
            </span>
          </button>

          {/* Interactive icons */}
          <button className="relative rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            </span>
          </button>

          <button className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors" title="Informações">
            <HelpCircle size={18} />
          </button>

          <button 
            onClick={onOpenProfile}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors" 
            title="Perfil"
          >
            <User size={18} />
          </button>

          {/* Logout Action */}
          <button
            onClick={handleLogout}
            title="Sair"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
