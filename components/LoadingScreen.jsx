'use client'

import { useEffect, useState } from 'react'

const STEPS = [
  { icon: '🗺️', text: 'Analizando el destino...' },
  { icon: '📍', text: 'Seleccionando los mejores lugares...' },
  { icon: '🛣️', text: 'Optimizando rutas y distancias...' },
  { icon: '🍽️', text: 'Buscando gastronomía local...' },
  { icon: '✨', text: 'Dando los últimos retoques...' },
]

export default function LoadingScreen({ destination }) {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setStep(s => (s < STEPS.length - 1 ? s + 1 : s))
    }, 2200)
    const progressInterval = setInterval(() => {
      setProgress(p => (p < 92 ? p + Math.random() * 8 : p))
    }, 600)
    return () => { clearInterval(stepInterval); clearInterval(progressInterval) }
  }, [])

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl shadow-gray-200/80 border border-gray-100 p-8 text-center overflow-hidden relative">
        {/* Animated gradient bg */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-500 to-orange-400 animate-pulse" />
        </div>

        {/* Main icon */}
        <div className="relative mx-auto w-20 h-20 mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-100 to-orange-100 rounded-3xl flex items-center justify-center">
            <span className="text-4xl" className="animate-bounce-soft">{STEPS[step].icon}</span>
          </div>
          {/* Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="#f1f5f9" strokeWidth="3" />
            <circle
              cx="40" cy="40" r="36" fill="none"
              stroke="url(#grad)" strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 36}`}
              strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
              style={{ transition: 'stroke-dashoffset 0.6s ease' }}
            />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#E11D48" />
                <stop offset="100%" stopColor="#FB923C" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <h3 className="text-xl font-black text-gray-900 mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          Creando tu escapada{destination ? ` a ${destination}` : ''}
        </h3>

        <p className="text-gray-500 text-sm mb-6 min-h-[20px] transition-all" key={step}>
          {STEPS[step].text}
        </p>

        {/* Progress bar */}
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-rose-500 to-orange-400 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 font-medium">{Math.round(progress)}% completado</p>

        {/* Step dots */}
        <div className="flex justify-center gap-2 mt-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-rose-500' : i < step ? 'w-3 bg-rose-300' : 'w-3 bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
