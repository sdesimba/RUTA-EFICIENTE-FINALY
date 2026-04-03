'use client'

import { useState } from 'react'
import { MapPin, Calendar, Car, Zap, Navigation, Users, Star } from 'lucide-react'

const INTENSITY = [
  { value: 'relax', label: 'Relax', desc: 'Ritmo tranquilo', emoji: '😌', color: 'from-sky-400 to-blue-500' },
  { value: 'equilibrado', label: 'Equilibrado', desc: 'Mix perfecto', emoji: '⚖️', color: 'from-violet-400 to-purple-500' },
  { value: 'atope', label: 'A tope', desc: 'Máxima actividad', emoji: '🔥', color: 'from-orange-400 to-rose-500' },
]

const COMPANIONS = [
  { key: 'with_dogs', label: 'Con perros', emoji: '🐕' },
  { key: 'with_children', label: 'Con niños', emoji: '👨‍👩‍👧‍👦' },
  { key: 'with_elderly', label: 'Mayores', emoji: '👴' },
  { key: 'with_couple', label: 'En pareja', emoji: '💑' },
  { key: 'with_friends', label: 'Amigos', emoji: '👥' },
]

const PRIORITIES = [
  { value: 'cultural', label: 'Cultural', emoji: '🏛️' },
  { value: 'natural', label: 'Natural', emoji: '🌲' },
  { value: 'gastronomica', label: 'Gastronómica', emoji: '🍽️' },
]

export default function ItineraryForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState({
    destination: '',
    starting_address: '',
    days: '2',
    hasCar: true,
    intensity: 'equilibrado',
    preferences: {
      with_dogs: false, with_children: false, with_elderly: false,
      with_couple: false, with_friends: false, priority: 'cultural'
    }
  })
  const [step, setStep] = useState(1)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  const setPref = (k, v) => setForm(f => ({ ...f, preferences: { ...f.preferences, [k]: v } }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ ...form, hasCar: form.hasCar ? 'si' : 'no' })
  }

  const canNext = form.destination.trim().length >= 2

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Hero search bar */}
      <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/80 overflow-hidden border border-gray-100">
        {/* Top gradient bar */}
        <div className="h-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400" />

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">

          {/* Destination */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">¿A dónde vais?</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-rose-50 rounded-xl flex items-center justify-center">
                <MapPin size={16} className="text-rose-500" />
              </div>
              <input
                type="text"
                placeholder="Madrid, Cuenca, Cabo de Gata..."
                value={form.destination}
                onChange={e => set('destination', e.target.value)}
                required
                className="w-full pl-14 pr-4 py-4 text-lg font-medium border-2 border-gray-100 rounded-2xl focus:border-rose-400 focus:outline-none transition-colors placeholder:text-gray-300 bg-gray-50/50 hover:bg-white focus:bg-white"
              />
            </div>
          </div>

          {/* Hotel / origin (optional) */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Punto de salida (opcional)</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Navigation size={16} className="text-emerald-500" />
              </div>
              <input
                type="text"
                placeholder="Hotel, dirección de inicio..."
                value={form.starting_address}
                onChange={e => set('starting_address', e.target.value)}
                className="w-full pl-14 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-emerald-400 focus:outline-none transition-colors placeholder:text-gray-300 bg-gray-50/50 hover:bg-white focus:bg-white text-base"
              />
            </div>
          </div>

          {/* Days + Car row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Días</label>
              <div className="grid grid-cols-4 gap-1.5">
                {['2', '3', '4', '5'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => set('days', d)}
                    className={`py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                      form.days === d
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200'
                        : 'bg-white text-gray-600 border-gray-100 hover:border-rose-200'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Transporte</label>
              <button
                type="button"
                onClick={() => set('hasCar', !form.hasCar)}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-all border-2 flex items-center justify-center gap-2 ${
                  form.hasCar
                    ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-200'
                    : 'bg-white text-gray-500 border-gray-100 hover:border-blue-200'
                }`}
              >
                <Car size={16} />
                {form.hasCar ? 'Con coche' : 'Sin coche'}
              </button>
            </div>
          </div>

          {/* Intensity */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400">Intensidad</label>
            <div className="grid grid-cols-3 gap-3">
              {INTENSITY.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('intensity', opt.value)}
                  className={`relative py-4 px-3 rounded-2xl text-center transition-all border-2 overflow-hidden ${
                    form.intensity === opt.value
                      ? 'border-transparent shadow-lg scale-[1.02]'
                      : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                  }`}
                >
                  {form.intensity === opt.value && (
                    <div className={`absolute inset-0 bg-gradient-to-br ${opt.color} opacity-10`} />
                  )}
                  <div className="text-2xl mb-1">{opt.emoji}</div>
                  <div className={`text-xs font-bold ${form.intensity === opt.value ? 'text-gray-900' : 'text-gray-600'}`}>{opt.label}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{opt.desc}</div>
                  {form.intensity === opt.value && (
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${opt.color}`} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4 p-4 bg-gray-50/80 rounded-2xl">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
              <Users size={12} />
              Preferencias
            </label>

            {/* Companions */}
            <div className="flex flex-wrap gap-2">
              {COMPANIONS.map(c => (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setPref(c.key, !form.preferences[c.key])}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                    form.preferences[c.key]
                      ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-rose-200'
                  }`}
                >
                  <span>{c.emoji}</span> {c.label}
                </button>
              ))}
            </div>

            {/* Priority */}
            <div className="flex gap-2">
              {PRIORITIES.map(p => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPref('priority', p.value)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all border ${
                    form.preferences.priority === p.value
                      ? 'bg-violet-500 text-white border-violet-500 shadow-sm'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-violet-200'
                  }`}
                >
                  <span>{p.emoji}</span>
                  <span className="hidden sm:inline">{p.label}</span>
                  <span className="sm:hidden">{p.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-100 rounded-2xl text-red-600 text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !canNext}
            className="w-full py-4 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400 text-white font-bold text-base rounded-2xl shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99]"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generando tu escapada...
              </>
            ) : (
              <>
                <Navigation size={18} />
                Generar itinerario
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
