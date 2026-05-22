'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  ArrowLeft,
  Users,
  Dumbbell,
  Calendar,
  MessageSquare,
  Trash2,
  Send,
  Search,
  Loader2,
  RefreshCw,
  AlertTriangle,
  User,
  ExternalLink
} from 'lucide-react';

interface UserData {
  id: string;
  username: string;
  email: string;
  avatar_color: string;
  created_at: string;
  exercise_count: number;
  session_count: number;
}

interface ExerciseData {
  id: string;
  name: string;
  target_reps: number;
  created_at: string;
  user_id: string;
  creator_name: string;
  creator_email: string;
}

interface SessionData {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  reps: number;
  physical: string;
  emotional: string;
  weather: string;
  moon: string;
  notes: string;
  created_at: string;
  practitioner_name: string;
  practitioner_email: string;
  exercise_name: string;
}

interface ChatRoomData {
  room_name: string;
  message_count: number;
}

interface ChatMessageData {
  id: string;
  room_name: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
  avatar_color?: string;
  email?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; username: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'exercises' | 'sessions' | 'chats'>('users');
  
  // Data States
  const [users, setUsers] = useState<UserData[]>([]);
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [rooms, setRooms] = useState<ChatRoomData[]>([]);
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  
  // Selection and Search States
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [roomSearch, setRoomSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [sessionSearch, setSessionSearch] = useState('');
  const [newMessage, setNewMessage] = useState('');
  
  // UI Status States
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [submittingMessage, setSubmittingMessage] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Delete Confirmation Modal State
  const [confirmDelete, setConfirmDelete] = useState<{
    type: 'user' | 'exercise' | 'session' | 'message';
    id: string;
    label: string;
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Authenticate Admin
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        
        if (res.ok && data.user && data.user.email === 'rwaguimaraes@gmail.com') {
          setIsAdmin(true);
          setCurrentUser(data.user);
        } else {
          setIsAdmin(false);
          router.push('/');
        }
      } catch (err) {
        console.error('Admin auth check failed:', err);
        setIsAdmin(false);
        router.push('/');
      }
    }
    checkAuth();
  }, [router]);

  // Load Admin Data on mount
  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  // Handle Poll for messages in moderation view
  useEffect(() => {
    if (activeTab === 'chats' && selectedRoom) {
      fetchMessages(selectedRoom, true);
      pollingRef.current = setInterval(() => {
        fetchMessages(selectedRoom, true);
      }, 3000);
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [activeTab, selectedRoom]);

  // Scroll to bottom on new chat messages
  useEffect(() => {
    if (activeTab === 'chats') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, exercisesRes, sessionsRes, roomsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/exercises'),
        fetch('/api/admin/sessions'),
        fetch('/api/admin/chat/rooms')
      ]);

      const [usersData, exercisesData, sessionsData, roomsData] = await Promise.all([
        usersRes.json(),
        exercisesRes.json(),
        sessionsRes.json(),
        roomsRes.json()
      ]);

      if (usersRes.ok) setUsers(usersData.users || []);
      else throw new Error(usersData.error || 'Falha ao buscar usuários');

      if (exercisesRes.ok) setExercises(exercisesData.exercises || []);
      else throw new Error(exercisesData.error || 'Falha ao buscar exercícios');

      if (sessionsRes.ok) setSessions(sessionsData.sessions || []);
      else throw new Error(sessionsData.error || 'Falha ao buscar sessões');

      if (roomsRes.ok) {
        const roomsList = roomsData.rooms || [];
        setRooms(roomsList);
        if (roomsList.length > 0) {
          // Keep current selection if valid, otherwise select first room
          const hasSelectedRoom = roomsList.some((r: ChatRoomData) => r.room_name === selectedRoom);
          if (!hasSelectedRoom || !selectedRoom) {
            setSelectedRoom(roomsList[0].room_name);
            fetchMessages(roomsList[0].room_name);
          }
        }
      } else throw new Error(roomsData.error || 'Falha ao buscar salas de chat');
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do painel.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (roomName: string, isPoll = false) => {
    if (!isPoll) setMessagesLoading(true);
    try {
      const res = await fetch(`/api/admin/chat/messages?room=${encodeURIComponent(roomName)}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (!isPoll) setMessagesLoading(false);
    }
  };

  // Perform Delete Actions
  const handleDeleteConfirm = async () => {
    if (!confirmDelete) return;
    const { type, id } = confirmDelete;
    setActionLoading(id);
    setError('');
    setSuccessMsg('');
    setConfirmDelete(null);

    try {
      let url = '';
      if (type === 'user') url = `/api/admin/users?id=${id}`;
      else if (type === 'exercise') url = `/api/admin/exercises?id=${id}`;
      else if (type === 'session') url = `/api/admin/sessions?id=${id}`;
      else if (type === 'message') url = `/api/admin/chat/messages?id=${id}`;

      const res = await fetch(url, { method: 'DELETE' });
      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(`${type === 'user' ? 'Usuário' : type === 'exercise' ? 'Exercício' : type === 'session' ? 'Sessão' : 'Mensagem'} deletado com sucesso.`);
        
        // Refresh local data
        if (type === 'user') {
          setUsers(prev => prev.filter(u => u.id !== id));
        } else if (type === 'exercise') {
          setExercises(prev => prev.filter(e => e.id !== id));
        } else if (type === 'session') {
          setSessions(prev => prev.filter(s => s.id !== id));
        } else if (type === 'message') {
          setMessages(prev => prev.filter(m => m.id !== id));
          // Refresh room counts if moderating
          if (selectedRoom) {
            setRooms(prev => prev.map(r => r.room_name === selectedRoom ? { ...r, message_count: Math.max(0, r.message_count - 1) } : r));
          }
        }
      } else {
        throw new Error(data.error || 'Erro ao processar exclusão.');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir item.');
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  // Admin posts message to chat room
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedRoom || !currentUser) return;

    setSubmittingMessage(true);
    const textToSend = newMessage.trim();
    setNewMessage('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: selectedRoom, message: textToSend }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar.');
      }
      
      setMessages((prev) => [...prev, data.message]);
      // Update message counts on room list
      setRooms(prev => prev.map(r => r.room_name === selectedRoom ? { ...r, message_count: r.message_count + 1 } : r));
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar mensagem.');
      setNewMessage(textToSend);
    } finally {
      setSubmittingMessage(false);
    }
  };

  const handleRoomSelect = (roomName: string) => {
    setSelectedRoom(roomName);
    setMessages([]);
    fetchMessages(roomName);
  };

  const formatDateTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50/50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
          <p className="mt-2 text-sm font-semibold text-gray-500">Verificando autorização...</p>
        </div>
      </div>
    );
  }

  // Filter lists based on search
  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredExercises = exercises.filter(e => 
    e.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
    e.creator_name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
    e.creator_email.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  const filteredSessions = sessions.filter(s => 
    s.exercise_name.toLowerCase().includes(sessionSearch.toLowerCase()) ||
    s.practitioner_name.toLowerCase().includes(sessionSearch.toLowerCase()) ||
    s.practitioner_email.toLowerCase().includes(sessionSearch.toLowerCase()) ||
    (s.notes && s.notes.toLowerCase().includes(sessionSearch.toLowerCase()))
  );

  const filteredRooms = rooms.filter(r => 
    r.room_name.toLowerCase().includes(roomSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50/30 pb-12 flex flex-col font-sans">
      {/* Admin Header */}
      <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Shield size={20} />
            </div>
            <div>
              <span className="text-base font-bold text-gray-800 tracking-tight block">
                Painel Administrativo
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider block -mt-1">
                Acesso Total
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.8 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none cursor-pointer disabled:opacity-50"
              title="Atualizar dados"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Atualizar</span>
            </button>

            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-1.8 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Voltar ao Painel</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Grid */}
      <main className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 pt-8 flex-1 flex flex-col">
        {/* Status Alerts */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex items-start gap-2 animate-in fade-in duration-150">
            <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
            <div>
              <span className="font-bold">Erro: </span>
              {error}
            </div>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 border border-emerald-100 animate-in fade-in duration-150">
            <span className="font-bold">Sucesso: </span>
            {successMsg}
          </div>
        )}

        {/* Top Cards Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1 */}
          <div 
            onClick={() => setActiveTab('users')}
            className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 shadow-sm hover:shadow-md ${
              activeTab === 'users' ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-white border-gray-100 hover:border-gray-200 text-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${activeTab === 'users' ? 'text-emerald-100' : 'text-gray-400'}`}>
                Total Usuários
              </span>
              <Users size={18} className={activeTab === 'users' ? 'text-emerald-100' : 'text-emerald-600'} />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold tracking-tight">{users.length}</span>
              <span className={`text-[10px] font-semibold ${activeTab === 'users' ? 'text-emerald-200' : 'text-gray-400'}`}>registrados</span>
            </div>
          </div>

          {/* Card 2 */}
          <div 
            onClick={() => setActiveTab('exercises')}
            className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 shadow-sm hover:shadow-md ${
              activeTab === 'exercises' ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-white border-gray-100 hover:border-gray-200 text-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${activeTab === 'exercises' ? 'text-emerald-100' : 'text-gray-400'}`}>
                Total Exercícios
              </span>
              <Dumbbell size={18} className={activeTab === 'exercises' ? 'text-emerald-100' : 'text-emerald-600'} />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold tracking-tight">{exercises.length}</span>
              <span className={`text-[10px] font-semibold ${activeTab === 'exercises' ? 'text-emerald-200' : 'text-gray-400'}`}>criados</span>
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={() => setActiveTab('sessions')}
            className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 shadow-sm hover:shadow-md ${
              activeTab === 'sessions' ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-white border-gray-100 hover:border-gray-200 text-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${activeTab === 'sessions' ? 'text-emerald-100' : 'text-gray-400'}`}>
                Total Sessões
              </span>
              <Calendar size={18} className={activeTab === 'sessions' ? 'text-emerald-100' : 'text-emerald-600'} />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold tracking-tight">{sessions.length}</span>
              <span className={`text-[10px] font-semibold ${activeTab === 'sessions' ? 'text-emerald-200' : 'text-gray-400'}`}>praticadas</span>
            </div>
          </div>

          {/* Card 4 */}
          <div 
            onClick={() => setActiveTab('chats')}
            className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 shadow-sm hover:shadow-md ${
              activeTab === 'chats' ? 'bg-emerald-600 border-emerald-700 text-white' : 'bg-white border-gray-100 hover:border-gray-200 text-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold ${activeTab === 'chats' ? 'text-emerald-100' : 'text-gray-400'}`}>
                Salas de Chat
              </span>
              <MessageSquare size={18} className={activeTab === 'chats' ? 'text-emerald-100' : 'text-emerald-600'} />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold tracking-tight">{rooms.length}</span>
              <span className={`text-[10px] font-semibold ${activeTab === 'chats' ? 'text-emerald-200' : 'text-gray-400'}`}>ativas</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (shadcn styled) */}
        <div className="flex border-b border-gray-200 space-x-1.5 p-1 bg-gray-100/50 rounded-xl max-w-md mb-6">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all focus:outline-none cursor-pointer ${
              activeTab === 'users' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Users size={14} />
            <span>Usuários</span>
          </button>
          <button
            onClick={() => setActiveTab('exercises')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all focus:outline-none cursor-pointer ${
              activeTab === 'exercises' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Dumbbell size={14} />
            <span>Exercícios</span>
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all focus:outline-none cursor-pointer ${
              activeTab === 'sessions' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Calendar size={14} />
            <span>Sessões</span>
          </button>
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-lg transition-all focus:outline-none cursor-pointer ${
              activeTab === 'chats' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <MessageSquare size={14} />
            <span>Chats</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 flex flex-col min-h-0 bg-white border border-gray-150 rounded-2xl shadow-sm overflow-hidden p-4 md:p-6 mb-4">
          
          {/* TAB 1: USERS */}
          {activeTab === 'users' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Controle de Usuários</h2>
                  <p className="text-xs text-gray-400 font-medium">Visualize todos os praticantes registrados e gerencie suas contas</p>
                </div>
                {/* Search */}
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Buscar por nome ou e-mail..."
                    className="w-full rounded-lg border border-gray-200 pl-9 pr-4 py-2 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-gray-500">
                  <Users size={40} className="text-gray-300 mb-2" />
                  <p className="text-sm font-semibold">Nenhum usuário encontrado</p>
                  <p className="text-xs text-gray-400 mt-1">Verifique o termo pesquisado ou limpe o filtro.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto min-h-0">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider bg-gray-50/50">
                          <th className="py-3 px-4">Avatar</th>
                          <th className="py-3 px-4">Nome</th>
                          <th className="py-3 px-4">E-mail</th>
                          <th className="py-3 px-4">Registrado Em</th>
                          <th className="py-3 px-4 text-center">Exercícios</th>
                          <th className="py-3 px-4 text-center">Sessões</th>
                          <th className="py-3 px-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map((u) => (
                          <tr key={u.id} className="hover:bg-gray-50/40 transition-colors">
                            <td className="py-3 px-4">
                              <div
                                style={{ backgroundColor: u.avatar_color || '#10b981' }}
                                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white uppercase shadow-sm"
                              >
                                {u.username.substring(0, 2).toUpperCase()}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-bold text-gray-800">{u.username}</td>
                            <td className="py-3 px-4 text-gray-500 font-medium">{u.email}</td>
                            <td className="py-3 px-4 text-gray-400">{formatDateTime(u.created_at)}</td>
                            <td className="py-3 px-4 text-center font-semibold text-gray-600">{u.exercise_count}</td>
                            <td className="py-3 px-4 text-center font-semibold text-gray-600">{u.session_count}</td>
                            <td className="py-3 px-4 text-right">
                              {u.email === 'rwaguimaraes@gmail.com' ? (
                                <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                                  Administrador
                                </span>
                              ) : (
                                <button
                                  onClick={() => setConfirmDelete({
                                    type: 'user',
                                    id: u.id,
                                    label: `Usuário "${u.username}" (${u.email})`
                                  })}
                                  disabled={actionLoading !== null}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors inline-flex cursor-pointer disabled:opacity-50"
                                  title="Deletar Usuário"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile List Cards */}
                  <div className="md:hidden space-y-4">
                    {filteredUsers.map((u) => (
                      <div key={u.id} className="border border-gray-100 rounded-xl p-4 bg-white/70 shadow-sm relative">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            style={{ backgroundColor: u.avatar_color || '#10b981' }}
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white uppercase shadow-sm"
                          >
                            {u.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-sm">{u.username}</h3>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs border-t border-gray-50 pt-3 text-gray-500 mb-2">
                          <div>
                            <span className="text-[10px] text-gray-400 block font-semibold uppercase">Registrado</span>
                            {formatDateTime(u.created_at)}
                          </div>
                          <div className="flex gap-4">
                            <div>
                              <span className="text-[10px] text-gray-400 block font-semibold uppercase">Exerc.</span>
                              <span className="font-bold text-gray-700">{u.exercise_count}</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-gray-400 block font-semibold uppercase">Sessões</span>
                              <span className="font-bold text-gray-700">{u.session_count}</span>
                            </div>
                          </div>
                        </div>

                        {u.email === 'rwaguimaraes@gmail.com' ? (
                          <div className="mt-3 text-center rounded-md bg-emerald-50 py-1 text-[10px] font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                            Administrador
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete({
                              type: 'user',
                              id: u.id,
                              label: `Usuário "${u.username}" (${u.email})`
                            })}
                            disabled={actionLoading !== null}
                            className="mt-3 w-full inline-flex items-center justify-center space-x-1 py-1.8 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                          >
                            <Trash2 size={13} />
                            <span>Excluir Usuário e Dados</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXERCISES */}
          {activeTab === 'exercises' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Exercícios Cadastrados</h2>
                  <p className="text-xs text-gray-400 font-medium">Veja todos os exercícios criados no aplicativo e modere os conteúdos</p>
                </div>
                {/* Search */}
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={exerciseSearch}
                    onChange={(e) => setExerciseSearch(e.target.value)}
                    placeholder="Buscar exercício ou criador..."
                    className="w-full rounded-lg border border-gray-200 pl-9 pr-4 py-2 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : filteredExercises.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-gray-500">
                  <Dumbbell size={40} className="text-gray-300 mb-2" />
                  <p className="text-sm font-semibold">Nenhum exercício encontrado</p>
                  <p className="text-xs text-gray-400 mt-1">Nenhum registro coincide com sua busca.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto min-h-0">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider bg-gray-50/50">
                          <th className="py-3 px-4">Nome do Exercício</th>
                          <th className="py-3 px-4">Criado por</th>
                          <th className="py-3 px-4">E-mail do Criador</th>
                          <th className="py-3 px-4 text-center">Meta Repetições</th>
                          <th className="py-3 px-4">Data Criação</th>
                          <th className="py-3 px-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredExercises.map((e) => (
                          <tr key={e.id} className="hover:bg-gray-50/40 transition-colors">
                            <td className="py-3 px-4 font-bold text-gray-800">{e.name}</td>
                            <td className="py-3 px-4 text-gray-600 font-medium">{e.creator_name}</td>
                            <td className="py-3 px-4 text-gray-500">{e.creator_email}</td>
                            <td className="py-3 px-4 text-center font-semibold text-gray-600">{e.target_reps}</td>
                            <td className="py-3 px-4 text-gray-400">{formatDateTime(e.created_at)}</td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setConfirmDelete({
                                  type: 'exercise',
                                  id: e.id,
                                  label: `Exercício "${e.name}" (Criado por: ${e.creator_name})`
                                })}
                                disabled={actionLoading !== null}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors inline-flex cursor-pointer disabled:opacity-50"
                                title="Deletar Exercício"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card Layout */}
                  <div className="md:hidden space-y-4">
                    {filteredExercises.map((e) => (
                      <div key={e.id} className="border border-gray-100 rounded-xl p-4 bg-white/70 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-gray-800 text-sm">{e.name}</h3>
                          <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">
                            Meta: {e.target_reps} reps
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1 mb-3">
                          <p><span className="text-[10px] text-gray-400 font-semibold uppercase mr-1">Criador:</span> {e.creator_name} ({e.creator_email})</p>
                          <p><span className="text-[10px] text-gray-400 font-semibold uppercase mr-1">Criado em:</span> {formatDateTime(e.created_at)}</p>
                        </div>
                        <button
                          onClick={() => setConfirmDelete({
                            type: 'exercise',
                            id: e.id,
                            label: `Exercício "${e.name}"`
                          })}
                          disabled={actionLoading !== null}
                          className="w-full inline-flex items-center justify-center space-x-1 py-1.8 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Excluir Exercício</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SESSIONS */}
          {activeTab === 'sessions' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Sessões Realizadas</h2>
                  <p className="text-xs text-gray-400 font-medium">Veja todos os logs e anotações de sensibilidade inseridos pelos praticantes</p>
                </div>
                {/* Search */}
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={sessionSearch}
                    onChange={(e) => setSessionSearch(e.target.value)}
                    placeholder="Buscar sessão, praticante ou notas..."
                    className="w-full rounded-lg border border-gray-200 pl-9 pr-4 py-2 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : filteredSessions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-16 text-center text-gray-500">
                  <Calendar size={40} className="text-gray-300 mb-2" />
                  <p className="text-sm font-semibold">Nenhuma sessão encontrada</p>
                  <p className="text-xs text-gray-400 mt-1">Nenhum log corresponde aos filtros.</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto min-h-0">
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider bg-gray-50/50">
                          <th className="py-3 px-4">Data</th>
                          <th className="py-3 px-4">Praticante</th>
                          <th className="py-3 px-4">Exercício</th>
                          <th className="py-3 px-4 text-center">Reps</th>
                          <th className="py-3 px-4">Físico/Emocional</th>
                          <th className="py-3 px-4">Clima/Lua</th>
                          <th className="py-3 px-4 max-w-xs">Notas</th>
                          <th className="py-3 px-4 text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredSessions.map((s) => (
                          <tr key={s.id} className="hover:bg-gray-50/40 transition-colors">
                            <td className="py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">
                              {s.date} <span className="text-[10px] text-gray-400 font-normal">{s.start_time} - {s.end_time}</span>
                            </td>
                            <td className="py-3 px-4 font-bold text-gray-800">{s.practitioner_name}</td>
                            <td className="py-3 px-4 text-emerald-600 font-semibold">{s.exercise_name}</td>
                            <td className="py-3 px-4 text-center font-bold text-gray-700">{s.reps}</td>
                            <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{s.physical} / {s.emotional}</td>
                            <td className="py-3 px-4 text-gray-500 whitespace-nowrap">{s.weather} / {s.moon}</td>
                            <td className="py-3 px-4 text-gray-400 italic truncate max-w-xs" title={s.notes || ''}>
                              {s.notes || '-'}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => setConfirmDelete({
                                  type: 'session',
                                  id: s.id,
                                  label: `Sessão do exercício "${s.exercise_name}" praticado por ${s.practitioner_name} em ${s.date}`
                                })}
                                disabled={actionLoading !== null}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors inline-flex cursor-pointer disabled:opacity-50"
                                title="Deletar Sessão"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden space-y-4">
                    {filteredSessions.map((s) => (
                      <div key={s.id} className="border border-gray-100 rounded-xl p-4 bg-white/70 shadow-sm text-xs">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-emerald-600">{s.exercise_name}</h4>
                            <p className="text-[10px] text-gray-450 font-medium">Por: {s.practitioner_name}</p>
                          </div>
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold text-[10px]">
                            {s.reps} reps
                          </span>
                        </div>

                        <div className="space-y-1 text-gray-500 border-t border-gray-50 pt-2 mb-2">
                          <p><span className="text-[9px] font-bold text-gray-400 uppercase">Horário:</span> {s.date} ({s.start_time} - {s.end_time})</p>
                          <p><span className="text-[9px] font-bold text-gray-400 uppercase">Energia:</span> {s.physical} / {s.emotional}</p>
                          <p><span className="text-[9px] font-bold text-gray-400 uppercase">Clima/Lua:</span> {s.weather} / {s.moon}</p>
                          {s.notes && (
                            <p className="italic bg-gray-50 p-2 rounded text-gray-400 mt-1 border-l-2 border-gray-200">
                              "{s.notes}"
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => setConfirmDelete({
                            type: 'session',
                            id: s.id,
                            label: `Sessão do exercício "${s.exercise_name}" praticado por ${s.practitioner_name}`
                          })}
                          disabled={actionLoading !== null}
                          className="w-full inline-flex items-center justify-center space-x-1 py-1.8 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Excluir Sessão</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CHATS */}
          {activeTab === 'chats' && (
            <div className="flex-1 flex flex-col min-h-0">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-800">Moderação de Chat</h2>
                <p className="text-xs text-gray-400 font-medium">Selecione uma sala de chat de exercício para visualizar mensagens, moderar conteúdo ou enviar alertas</p>
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
              ) : (
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 border border-gray-100 rounded-2xl overflow-hidden min-h-0 bg-gray-50/20">
                  {/* Left Column: Rooms Switcher */}
                  <div className="lg:col-span-4 border-r border-gray-150 flex flex-col bg-white min-h-[220px] lg:min-h-0 overflow-y-auto">
                    <div className="p-3 border-b border-gray-100">
                      <div className="relative">
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-gray-400" />
                        <input
                          type="text"
                          value={roomSearch}
                          onChange={(e) => setRoomSearch(e.target.value)}
                          placeholder="Buscar sala..."
                          className="w-full rounded-lg border border-gray-200 pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex-1 divide-y divide-gray-100">
                      {filteredRooms.length === 0 ? (
                        <div className="p-6 text-center text-xs text-gray-400">Nenhuma sala encontrada.</div>
                      ) : (
                        filteredRooms.map((room) => {
                          const isActive = selectedRoom === room.room_name;
                          return (
                            <button
                              key={room.room_name}
                              onClick={() => handleRoomSelect(room.room_name)}
                              className={`w-full text-left px-4 py-3 text-xs font-semibold flex items-center justify-between transition-colors focus:outline-none cursor-pointer ${
                                isActive ? 'bg-emerald-50/50 text-emerald-700 border-l-3 border-emerald-600' : 'text-gray-650 hover:bg-gray-50'
                              }`}
                            >
                              <span className="truncate pr-2 capitalize">{room.room_name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                isActive ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {room.message_count}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Right Column: Messages list & Moderation actions */}
                  <div className="lg:col-span-8 flex flex-col bg-white min-h-[350px] lg:min-h-0">
                    {selectedRoom ? (
                      <div className="flex-1 flex flex-col min-h-0">
                        {/* Selected Room Header */}
                        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/40 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Sala sob moderação</span>
                            <h3 className="text-xs font-bold text-gray-800 capitalize -mt-0.5">{selectedRoom}</h3>
                          </div>
                          <button
                            onClick={() => fetchMessages(selectedRoom)}
                            className="text-gray-400 hover:text-emerald-600 p-1 rounded transition-colors cursor-pointer"
                            title="Atualizar Mensagens"
                          >
                            <RefreshCw size={14} className={messagesLoading ? 'animate-spin' : ''} />
                          </button>
                        </div>

                        {/* Message Log */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 bg-gray-50/30">
                          {messagesLoading && messages.length === 0 ? (
                            <div className="flex h-full items-center justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                            </div>
                          ) : messages.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-center text-gray-400">
                              <MessageSquare size={28} className="text-gray-300 mb-1" />
                              <p className="text-xs font-semibold">Nenhuma mensagem registrada nesta sala.</p>
                              <p className="text-[10px] text-gray-400 max-w-[220px] mt-0.5">Use o formulário abaixo para enviar um aviso oficial de administrador.</p>
                            </div>
                          ) : (
                            messages.map((msg) => {
                              const isSystemAdmin = msg.email === 'rwaguimaraes@gmail.com' || msg.username.toLowerCase().includes('admin');
                              const initials = msg.username ? msg.username.substring(0, 2).toUpperCase() : 'U';
                              return (
                                <div key={msg.id} className="flex items-start justify-between bg-white border border-gray-100 rounded-xl p-3 shadow-xs hover:shadow-sm transition-shadow">
                                  <div className="flex gap-2.5 min-w-0 pr-4">
                                    <div
                                      style={{ backgroundColor: msg.avatar_color || '#10b981' }}
                                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white uppercase mt-0.5"
                                    >
                                      {initials}
                                    </div>
                                    <div className="min-w-0 text-xs">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="font-bold text-gray-800">{msg.username}</span>
                                        {msg.user_id === currentUser?.id && (
                                          <span className="bg-emerald-50 text-emerald-700 font-bold text-[8px] uppercase px-1 rounded border border-emerald-200">
                                            Você (Admin)
                                          </span>
                                        )}
                                        <span className="text-[10px] text-gray-400 font-medium">({formatDateTime(msg.created_at)})</span>
                                      </div>
                                      <p className="text-gray-700 mt-1 break-words leading-normal whitespace-pre-wrap">{msg.message}</p>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => setConfirmDelete({
                                      type: 'message',
                                      id: msg.id,
                                      label: `Mensagem de "${msg.username}": "${msg.message.length > 30 ? msg.message.substring(0, 30) + '...' : msg.message}"`
                                    })}
                                    disabled={actionLoading !== null}
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer shrink-0"
                                    title="Remover Mensagem"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              );
                            })
                          )}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* Admin Posting box */}
                        <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-150 bg-white">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              placeholder="Postar no chat como Administrador..."
                              disabled={submittingMessage}
                              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none transition-colors disabled:opacity-50"
                            />
                            <button
                              type="submit"
                              disabled={submittingMessage || !newMessage.trim()}
                              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg px-4 py-2 text-xs font-semibold transition-colors flex items-center justify-center cursor-pointer shrink-0"
                            >
                              {submittingMessage ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send size={14} />
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400">
                        <MessageSquare size={36} className="text-gray-300 mb-2" />
                        <p className="text-sm font-semibold">Nenhuma sala selecionada</p>
                        <p className="text-xs text-gray-400 mt-1">Selecione uma sala de chat à esquerda para carregar as mensagens.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Confirmation Modal (shadcn style) */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <div className="bg-red-50 p-2.5 rounded-full">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">Confirmar Exclusão</h3>
              </div>

              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Tem certeza que deseja excluir permanentemente o item selecionado?
              </p>

              <div className="bg-gray-50 border border-gray-150 rounded-xl p-3.5 text-xs text-gray-700 font-semibold mb-2 leading-normal">
                {confirmDelete.label}
              </div>

              {confirmDelete.type === 'user' && (
                <p className="text-[10px] font-bold text-red-500 mt-1 mb-4 flex items-center gap-1">
                  <span>*</span> Atenção: Esta exclusão removerá todas as sessões e exercícios cadastrados por este usuário.
                </p>
              )}

              <div className="flex items-center justify-end space-x-2.5 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm focus:outline-none cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors shadow-sm focus:outline-none cursor-pointer"
                >
                  Excluir Permanentemente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
