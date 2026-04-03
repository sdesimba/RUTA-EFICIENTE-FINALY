'use client'

import { useState } from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ItinerariesProvider } from '@/contexts/ItinerariesContext'
import Navbar from '@/components/Navbar'
import ItineraryForm from '@/components/ItineraryForm'
import ItineraryResults from '@/components/ItineraryResults'
import LoadingScreen from '@/components/LoadingScreen'
import { Sparkles, MapPin, Clock, Shield } from 'lucide-react'

function HomePage() {
  const [itinerary, setItinerary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState(null)

  const handleSubmit = async (data) => {
    setLoading(true)
    setError(null)
    setItinerary(null)
    setFormData(data)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/generate`
        : '/api/generate'

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 70000)

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal,
      })
      clearTimeout(timeoutId)

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || `Error ${response.status}`)
      }

      const result = await response.json()
      setItinerary(result)
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('La generación tardó demasiado. Por favor, inténtalo de nuevo.')
      } else {
        setError(err.message || 'Error inesperado. Inténtalo de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setItinerary(null)
    setError(null)
    setFormData(null)
  }

  const handleLoadItinerary = ({ itinerary: it, formData: fd }) => {
    setItinerary(it)
    setFormData(fd)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-[#f8f5f0]">
      <Navbar onLoadItinerary={handleLoadItinerary} />

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {!itinerary && !loading && (
          <div className="text-center mb-10" className="animate-fade-up-slow">
            <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold px-4 py-2 rounded-full mb-5 uppercase tracking-widest">
              <Sparkles size={12} />
              Planificador IA para España
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 mb-4 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Tu escapada perfecta,<br />
              <span className="text-rose-500">en minutos</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">
              Itinerarios optimizados para España con rutas reales, restaurantes y todo listo para abrir en Google Maps.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-5 mt-6 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-rose-400" />
                <span>+500 destinos en España</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-blue-400" />
                <span>Listo en 30 segundos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield size={14} className="text-emerald-400" />
                <span>Gratis</span>
              </div>
            </div>
          </div>
        )}

        {loading && <LoadingScreen destination={formData?.destination} />}
        {!loading && !itinerary && (
          <ItineraryForm onSubmit={handleSubmit} loading={loading} error={error} />
        )}
        {!loading && itinerary && (
          <ItineraryResults itinerary={itinerary} formData={formData} onReset={handleReset} />
        )}
      </main>
    </div>
  )
}

export default function Page() {
  return (
    <AuthProvider>
      <ItinerariesProvider>
        <HomePage />
      </ItinerariesProvider>
    </AuthProvider>
  )
}
