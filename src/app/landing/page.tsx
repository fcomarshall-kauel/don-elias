import Link from 'next/link';
import {
  Smartphone,
  Package,
  Users,
  BookOpen,
  MessageSquare,
  RefreshCw,
  Shield,
  Star,
  ArrowRight,
  CheckCircle,
  Building2,
} from 'lucide-react';

const features = [
  {
    icon: Smartphone,
    title: 'Diseñado para pantallas táctiles',
    desc: 'Interfaz simple con botones grandes. Pensado para todo el equipo de portería, de cualquier edad.',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Users,
    title: 'Registro de visitas',
    desc: 'Controla el ingreso y salida de visitantes, empleadas domésticas y personal de mantención.',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50',
  },
  {
    icon: Package,
    title: 'Control inteligente de paquetes',
    desc: 'Recibe paquetes, prioriza comida delivery y lleva un historial completo de entregas.',
    color: 'text-amber-500',
    bg: 'bg-amber-50',
  },
  {
    icon: MessageSquare,
    title: 'Notificaciones WhatsApp',
    desc: 'Avisa automáticamente al residente cuando llega un paquete, directo a su WhatsApp.',
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
  {
    icon: BookOpen,
    title: 'Libro de Novedades digital',
    desc: 'Reemplaza el cuaderno físico. Registra novedades del turno con categorías y timestamps.',
    color: 'text-slate-500',
    bg: 'bg-slate-50',
  },
  {
    icon: RefreshCw,
    title: 'Cambio de turno simplificado',
    desc: 'Resumen automático al cambiar turno: visitas activas, paquetes y tareas pendientes.',
    color: 'text-teal-500',
    bg: 'bg-teal-50',
  },
];

const benefits = [
  'Sin capacitación extensa — listo en minutos',
  'No requiere internet permanente',
  'Funciona en cualquier tablet o PC de recepción',
  'Pantalla de lobby elegante para los residentes',
  'Historial completo de eventos del edificio',
  'Cero papeles, cero cuadernos perdidos',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <Building2 className="w-7 h-7 text-[#1e3a5f]" />
          <span className="text-xl font-black text-[#1e3a5f]">Porter<span className="text-amber-500">OS</span></span>
        </div>
        <Link href="/">
          <button className="bg-[#1e3a5f] text-white px-5 py-2.5 rounded-xl font-semibold text-base hover:bg-[#2d5a8e] transition-colors flex items-center gap-2">
            Abrir demo <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0f2040] via-[#1e3a5f] to-[#2d5a8e] text-white">
        <div className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm font-medium mb-6">
            <Shield className="w-4 h-4 text-amber-400" />
            Sistema de gestión para edificios residenciales
          </div>
          <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
            La portería del
            <span className="text-amber-400"> siglo XXI</span>
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
            PorterOS digitaliza el trabajo diario de los conserjes: visitas, paquetes, novedades y cambios de turno — todo en una pantalla táctil, sin complicaciones.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <button className="bg-amber-400 text-slate-900 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-amber-300 transition-colors flex items-center gap-2 shadow-lg">
                Ver demo en vivo <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-slate-50 py-10">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          {[
            { num: '< 2 min', label: 'Para aprender a usarlo' },
            { num: '100%', label: 'Touch-friendly' },
            { num: '0', label: 'Papeles necesarios' },
          ].map(({ num, label }) => (
            <div key={label}>
              <p className="text-3xl md:text-4xl font-black text-[#1e3a5f]">{num}</p>
              <p className="text-slate-500 mt-1 text-sm md:text-base">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-slate-800">Todo lo que necesita su portería</h2>
          <p className="text-xl text-slate-500 mt-3">Funciones diseñadas para el día a día real de un edificio</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`${bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-4`}>
                <Icon className={`w-7 h-7 ${color}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
              <p className="text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Lobby preview callout */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h2 className="text-4xl font-black text-white mb-4">Pantalla del lobby para residentes</h2>
            <p className="text-slate-300 text-xl leading-relaxed mb-6">
              Muestra en tiempo real qué departamentos tienen paquetes pendientes. Los residentes lo ven al entrar al edificio, elegante y claro.
            </p>
            <Link href="/lobby" target="_blank">
              <button className="border-2 border-white text-white px-6 py-3 rounded-xl font-semibold hover:bg-white hover:text-slate-900 transition-colors flex items-center gap-2">
                Ver pantalla lobby <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
          <div className="flex-1 bg-slate-800 rounded-3xl p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400 text-sm">Edificio · 14:32</span>
            </div>
            {['504', '1102', '203'].map((apt, i) => (
              <div key={apt} className={`rounded-2xl p-4 flex items-center justify-between mb-3 ${i === 0 ? 'bg-red-950 border border-red-700' : 'bg-slate-700'}`}>
                <div>
                  <p className="text-slate-400 text-xs">Depto.</p>
                  <p className={`text-4xl font-black ${i === 0 ? 'text-red-400' : 'text-white'}`}>{apt}</p>
                </div>
                <p className="text-slate-300 text-sm">{i === 0 ? '🍕 Comida urgente' : '1 paquete'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-4xl font-black text-slate-800 mb-4">¿Por qué PorterOS?</h2>
            <p className="text-slate-500 text-xl mb-8">Porque los conserjes merecen herramientas modernas que hagan su trabajo más fácil, no más difícil.</p>
            <ul className="flex flex-col gap-3">
              {benefits.map(b => (
                <li key={b} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-lg text-slate-700">{b}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Testimonial */}
          <div className="bg-blue-50 rounded-3xl p-8 border border-blue-100">
            <div className="flex mb-4 gap-1">
              {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-xl text-slate-700 italic leading-relaxed mb-6">
              &ldquo;Desde que implementamos PorterOS, los reclamos por paquetes no entregados bajaron a cero. El cambio de turno ahora toma 2 minutos en vez de 20. Y los conserjes lo adoptaron solos, sin capacitación.&rdquo;
            </p>
            <div>
              <p className="font-bold text-slate-800">Comité de Administración</p>
              <p className="text-slate-500">Edificio Las Lilas, Providencia</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black text-white mb-4">¿Listo para modernizar su edificio?</h2>
          <p className="text-blue-100 text-xl mb-8">Vea el sistema funcionando en vivo ahora mismo.</p>
          <Link href="/">
            <button className="bg-amber-400 text-slate-900 px-10 py-5 rounded-2xl font-black text-xl hover:bg-amber-300 transition-colors shadow-xl flex items-center gap-3 mx-auto">
              Abrir PorterOS <ArrowRight className="w-6 h-6" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm border-t border-slate-100">
        <p>PorterOS © {new Date().getFullYear()} · Sistema de Portería para Edificios Residenciales</p>
      </footer>
    </div>
  );
}
