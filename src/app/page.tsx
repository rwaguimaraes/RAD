'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  ChevronRight, 
  Zap, 
  Check, 
  TrendingUp, 
  Target, 
  CalendarDays, 
  MessageSquare, 
  Moon, 
  Activity, 
  Send, 
  Loader2, 
  Menu, 
  X,
  Star,
  Compass,
  Award
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  avatar_color: string;
}

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  // Contact Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const checkUser = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.error('Erro ao verificar sessão:', err);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkUser();

    // Scroll listener for sticky header styling
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setFormLoading(true);
    
    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setFormLoading(false);
    setFormSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 antialiased font-sans selection:bg-emerald-500 selection:text-white scroll-smooth">
      {/* Navigation Bar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-lg shadow-slate-100/40 border-b border-slate-200/50 py-3' 
          : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => router.push('/')}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-md shadow-emerald-200/50 animate-pulse">
                <Sparkles size={20} />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tight">
                Radiestesia <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">APP</span>
              </span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#problemas" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Problemas</a>
              <a href="#solucao" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Solução</a>
              <a href="#recursos" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Recursos</a>
              <a href="#depoimentos" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Depoimentos</a>
              <a href="#contato" className="text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors">Contato</a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {checkingAuth ? (
                <div className="h-9 w-20 flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin text-slate-400" />
                </div>
              ) : user ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-500/20 hover:opacity-95 hover:scale-[1.02] hover:shadow-lg transition-all"
                >
                  <span>Acessar Painel</span>
                  <ChevronRight size={16} />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-bold text-slate-700 hover:text-emerald-600 transition-colors"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/login?register=true"
                    className="inline-flex items-center space-x-1 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 hover:scale-[1.02] transition-all shadow-md shadow-slate-900/10"
                  >
                    <span>Criar Conta</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-xl">
            <a 
              href="#problemas" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition-all"
            >
              Problemas
            </a>
            <a 
              href="#solucao" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition-all"
            >
              Solução
            </a>
            <a 
              href="#recursos" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition-all"
            >
              Recursos
            </a>
            <a 
              href="#depoimentos" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition-all"
            >
              Depoimentos
            </a>
            <a 
              href="#contato" 
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-semibold text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition-all"
            >
              Contato
            </a>
            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
              {user ? (
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-md transition-all"
                >
                  Acessar Painel
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                  >
                    Entrar
                  </Link>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-3 text-sm font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 transition-all"
                  >
                    Criar Conta
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 bg-gradient-to-b from-emerald-50/40 via-white to-slate-50 overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-100/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[0%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-100/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* Tagline */}
            <div className="inline-flex items-center space-x-1.5 bg-emerald-50 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6 border border-emerald-100 shadow-sm shadow-emerald-50">
              <Sparkles size={12} className="animate-spin-slow" />
              <span>Plataforma Oficial de Prática</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-8">
              Domine a Arte da <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent drop-shadow-sm">
                Radiestesia
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed mb-10">
              Acompanhe sua evolução nos exercícios, registre sessões, e conecte-se com praticantes do mundo todo.
            </p>

            {/* Hero Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href={user ? '/dashboard' : '/login'}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-500/20 hover:scale-[1.01] hover:shadow-2xl transition-all"
              >
                <span>Acessar Plataforma</span>
                <ChevronRight size={18} />
              </Link>
              <a
                href="#recursos"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-xl bg-white border border-slate-200 px-8 py-4 text-base font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all"
              >
                Ver Recursos
              </a>
            </div>
          </div>

          {/* Hero Image / Mockup Area */}
          <div className="mt-16 md:mt-20 max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white p-2 md:p-3 relative group">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden relative bg-slate-900">
              <img 
                src="/images/radiestesia_hero.png" 
                alt="Radiestesia e Meditação"
                className="object-cover w-full h-full transform group-hover:scale-[1.02] transition-transform duration-700 opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Hook Section (Pain Points) */}
      <section id="problemas" className="py-20 md:py-28 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Text side */}
            <div className="lg:col-span-5 space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Você sente que sua prática está <br />
                <span className="text-rose-500 border-b-2 border-rose-100 pb-0.5">estagnada?</span>
              </h2>
              <p className="text-slate-500 font-medium text-base">
                Muitos praticantes enfrentam as mesmas dificuldades:
              </p>

              {/* Bullet list */}
              <ul className="space-y-4 pt-2">
                {[
                  'Dificuldade em manter consistência nos treinos.',
                  'Falta de histórico para ver a evolução.',
                  'Prática solitária, sem feedback ou incentivo.',
                  'Sem saber se fatores ambientais influenciam.'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-slate-700">
                    <div className="flex-shrink-0 mt-1 h-5 w-5 flex items-center justify-center rounded-full bg-rose-50 text-rose-500">
                      <Zap size={14} className="fill-rose-500" />
                    </div>
                    <span className="font-semibold text-sm sm:text-base">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Image side */}
            <div className="lg:col-span-7 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 p-2 bg-slate-50 group">
                <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-900">
                  <img 
                    src="/images/radiestesia_problems.png" 
                    alt="Uso de pêndulo radiestésico"
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-all duration-700"
                  />
                </div>
                {/* Floating badge */}
                <div className="absolute bottom-6 right-6 bg-emerald-500 text-white font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg border border-emerald-400 flex items-center space-x-2 animate-bounce">
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                  <span>+500 Praticantes ativos</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solucao" className="py-20 md:py-28 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Image side */}
            <div className="lg:col-span-6 order-2 lg:order-1 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 p-2 bg-white group">
                <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-slate-900">
                  <img 
                    src="/images/radiestesia_community.png" 
                    alt="Alinhamento e discussão na comunidade"
                    className="object-cover w-full h-full transform group-hover:scale-105 transition-all duration-700"
                  />
                </div>
              </div>
            </div>

            {/* Text side */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Compass size={12} />
                <span>Nova Abordagem</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                A Solução que Você Precisa
              </h2>
              <p className="text-slate-500 font-medium text-base sm:text-lg leading-relaxed">
                Uma plataforma pensada por radiestesistas, para radiestesistas. Tudo o que você precisa para elevar sua sensibilidade ao próximo nível.
              </p>

              {/* Benefits list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-4">
                {[
                  {
                    title: 'Histórico Completo',
                    desc: 'Monitore sua evolução com gráficos interativos e dados consolidados.'
                  },
                  {
                    title: 'Exercícios Direcionados',
                    desc: 'Pratique com treinos estruturados para ganho de foco e sensibilidade.'
                  },
                  {
                    title: 'Comunidade Integrada',
                    desc: 'Compartilhe experiências, troque aprendizados e tire dúvidas.'
                  },
                  {
                    title: 'Fatores de Sensibilidade',
                    desc: 'Registre clima, fase da lua, estado físico e emocional para entender sua sintonia.'
                  }
                ].map((benefit, idx) => (
                  <div key={idx} className="flex space-x-3">
                    <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
                      <Check size={14} className="stroke-[3]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">{benefit.title}</h4>
                      <p className="text-xs sm:text-sm text-slate-500 mt-0.5 leading-relaxed">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="recursos" className="py-20 md:py-28 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Recursos Poderosos
            </h2>
            <p className="text-slate-500 font-medium text-sm sm:text-base mt-4">
              Tudo o que você precisa para evoluir na sua prática diária e monitorar resultados.
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <TrendingUp size={22} />,
                title: 'Acompanhar Progresso',
                desc: 'Gráficos dinâmicos de assertividade para monitorar sua curva de aprendizado detalhadamente.'
              },
              {
                icon: <Activity size={22} />,
                title: 'Treinamentos Diários',
                desc: 'Sessões rápidas e dinâmicas desenvolvidas para desafiar e apurar sua sensibilidade radiestésica.'
              },
              {
                icon: <Target size={22} />,
                title: 'Métricas Personalizadas',
                desc: 'Defina metas de treinamento individuais e acompanhe o desenvolvimento de suas habilidades.'
              },
              {
                icon: <CalendarDays size={22} />,
                title: 'Histórico Completo',
                desc: 'Armazene planos de treinos anteriores e revise seus resultados passados a qualquer momento.'
              },
              {
                icon: <MessageSquare size={22} />,
                title: 'Comunidade Integrada',
                desc: 'Troque mensagens em salas de chat integradas por tipo de exercício, fortalecendo sua jornada.'
              },
              {
                icon: <Moon size={22} />,
                title: 'Sincronia Ambiental',
                desc: 'Registre estado físico, clima e fase lunar para analisar a influência de fatores externos.'
              }
            ].map((feature, idx) => (
              <div 
                key={idx} 
                className="group relative rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm hover:shadow-xl hover:border-emerald-200/50 hover:scale-[1.01] transition-all duration-300 overflow-hidden"
              >
                {/* Icon box */}
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 mb-6">
                  {feature.icon}
                </div>
                {/* Text */}
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="depoimentos" className="py-20 md:py-28 bg-slate-50/50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              O Que Dizem os Praticantes
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-4">
              Opiniões de quem já usa o aplicativo para acelerar o desenvolvimento de suas habilidades.
            </p>
          </div>

          {/* Testimonial Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: 'Finalmente um aplicativo que entende as minhas necessidades. O acompanhamento de evolução mudou minha prática.',
                author: 'Mateus S.',
                role: 'Praticante há 3 anos',
                stars: 5,
                initials: 'MS',
                color: '#10b981'
              },
              {
                quote: 'As salas de chat por exercício me ajudaram a tirar dúvidas que eu tinha há anos. A comunidade é fantástica!',
                author: 'Carla M.',
                role: 'Praticante Iniciante',
                stars: 5,
                initials: 'CM',
                color: '#06b6d4'
              },
              {
                quote: 'Os gráficos de assertividade me deram a clareza que faltava para mim. Super recomendado para todos!',
                author: 'Ana P.',
                role: 'Praticante há 5 anos',
                stars: 5,
                initials: 'AP',
                color: '#8b5cf6'
              }
            ].map((t, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-2xl border border-slate-200/50 p-8 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative"
              >
                <div>
                  {/* Stars */}
                  <div className="flex space-x-1 text-amber-400 mb-6">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} size={14} className="fill-amber-400" />
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-slate-600 text-sm sm:text-base italic leading-relaxed relative z-10">
                    "{t.quote}"
                  </p>
                </div>

                {/* Author Info */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center space-x-3">
                  <div 
                    style={{ backgroundColor: t.color }}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-extrabold text-white uppercase"
                  >
                    {t.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base">{t.author}</h4>
                    <p className="text-xs font-semibold text-slate-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section Banner */}
      <section className="relative py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white overflow-hidden shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent)] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Pronto para Elevar Sua Prática?
          </h2>
          <p className="text-base sm:text-lg text-emerald-100/90 max-w-2xl mx-auto font-medium">
            Junte-se a centenas de praticantes que já estão transformando sua jornada na radiestesia.
          </p>
          <div className="pt-4">
            <Link
              href={user ? '/dashboard' : '/login'}
              className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-base font-bold text-emerald-700 shadow-lg hover:bg-emerald-50 hover:scale-[1.02] transition-all"
            >
              <span>Começar Agora</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contato" className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Fale Conosco
            </h2>
            <p className="text-slate-500 font-medium text-sm sm:text-base mt-3">
              Tem dúvidas? Quer saber mais? Envie uma mensagem e responderemos em breve.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-xl shadow-slate-100/50">
            {formSubmitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check size={28} className="stroke-[3]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Mensagem Enviada!</h3>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Agradecemos seu contato. Nossa equipe entrará em contato com você o mais breve possível.
                </p>
                <button
                  onClick={() => setFormSubmitted(false)}
                  className="mt-4 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors focus:outline-none"
                >
                  Enviar outra mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-inner focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>

                  {/* Email field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      required
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-inner focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Message field */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Mensagem
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Como podemos ajudar?"
                    required
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-inner focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all resize-none"
                  />
                </div>

                {/* Submit button */}
                <div>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="inline-flex w-full items-center justify-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-500/10 hover:opacity-95 hover:scale-[1.005] disabled:opacity-50 transition-all focus:outline-none"
                  >
                    {formLoading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        <span>Enviar Mensagem</span>
                        <Send size={16} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            {/* Logo */}
            <div className="flex items-center space-x-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-sm">
                <Sparkles size={16} />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Radiestesia <span className="text-emerald-500">APP</span>
              </span>
            </div>

            {/* Copyright */}
            <p className="text-xs sm:text-sm text-slate-500 text-center font-medium">
              &copy; {new Date().getFullYear()} Radiestesia APP. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
