'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User } from 'lucide-react';

interface ChatMessage {
  id: string;
  room_name: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
  avatar_color?: string;
}

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  roomName: string;
  currentUser: { id: string; username: string; avatar_color?: string } | null;
}

export default function ChatPanel({ isOpen, onClose, roomName, currentUser }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Load messages and start polling
  useEffect(() => {
    if (isOpen && roomName) {
      fetchMessages();
      
      // Setup polling every 3 seconds
      pollingRef.current = setInterval(() => {
        fetchMessages(true);
      }, 3000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isOpen, roomName]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async (isPoll = false) => {
    if (!roomName) return;
    try {
      const res = await fetch(`/api/chat?room=${encodeURIComponent(roomName)}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages);
        setError('');
      } else {
        if (!isPoll) setError(data.error || 'Erro ao carregar mensagens.');
      }
    } catch (err) {
      if (!isPoll) setError('Falha de conexão.');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;

    setLoading(true);
    const textToSend = newMessage.trim();
    setNewMessage(''); // optimistic clear

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: roomName, message: textToSend }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao enviar.');
      }
      
      // Update local messages immediately
      setMessages((prev) => [...prev, data.message]);
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar mensagem.');
      setNewMessage(textToSend); // restore typed text
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-gray-100 bg-white shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Chat do Exercício</h2>
          <p className="text-xs font-semibold text-emerald-600 mt-0.5">Sala: {roomName}</p>
        </div>
        <button
          onClick={onClose}
          className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-100">
            {error}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-3">
              <User size={24} />
            </div>
            <p className="text-sm font-medium text-gray-500">Nenhuma mensagem nesta sala.</p>
            <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
              Envie uma mensagem abaixo para iniciar o chat com outros praticantes de "{roomName}".
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = currentUser && msg.user_id === currentUser.id;
            const initials = msg.username ? msg.username.trim().substring(0, 2).toUpperCase() : 'U';
            const color = msg.avatar_color || '#10b981';

            return (
              <div key={msg.id} className={`flex items-start space-x-2 ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                <div
                  style={{ backgroundColor: isMe ? (currentUser?.avatar_color || '#10b981') : color }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white uppercase shadow-sm mt-4 transition-all duration-300"
                  title={msg.username}
                >
                  {initials}
                </div>

                {/* Message Bubble + Meta */}
                <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center space-x-1.5 mb-1 px-1">
                    <span className="text-[10px] font-bold text-gray-500">
                      {isMe ? 'Você' : msg.username}
                    </span>
                    <span className="text-[9px] text-gray-300">•</span>
                    <span className="text-[9px] text-gray-400">{formatTime(msg.created_at)}</span>
                  </div>
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-sm break-words shadow-sm ${
                      isMe
                        ? 'bg-emerald-600 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="border-t border-gray-100 p-4 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
