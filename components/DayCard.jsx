'use client'

import { useState } from 'react'
import {
  Sun, Utensils, Sunset, Moon, MapPin, Car, Clock,
  Landmark, UtensilsCrossed, TreePine, Navigation, ChevronDown
} from 'lucide-react'

const getActivityIcon = (text) => {
  const t = (text || '').toLowerCase()
  if (/museo|catedral|palacio|iglesia|alcázar|monasterio|castillo/.test(t)) return <Landmark size={14} className="text-violet-500" />
  if (/restaurante|tapas|gastro|mercado|comida|bodega/.test(t)) return <UtensilsCrossed size={14} className="text-orange-500" />
  if (/parque|jardín|sierra|natural|monte|mirador|playa|lago/.test(t)) return <TreePine size={14} className="text-emerald-500" />
  return <MapPin size={14} className="text-blue-500" />
}

const getPriceLabel = (priceRange) => {
  const p = (priceRange || '').toLowerCase()
  if (p.includes('alto') || p.includes('high')) return { label: '€€€', color: 'text-amber-600 bg-amber-50' }
  if (p.includes('bajo') || p.includes('low')) return { label: '€', color: 'text-emerald-600 bg-emerald-50' }
  return { label: '€€', color: 'text-blue-600 bg-blue-50' }
}

const PlaceItem = ({ place, accentColor }) => (
  <div className={`p-3.5 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group`}>
    <div className="flex gap-3">
      <div className="mt-0.5 w-6 h-6 flex items-center justify-center flex-shrink-0">
        {getActivityIcon(place.place)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-sm text-gray-900 leading-snug">{place.place}</p>
          <div className="flex gap-1 flex-shrink-0">
            {place.time_estimated && (
              <span className="flex items-center gap-1 text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                <Clock size={10} />
                {place.time_estimated}
              </span>
            )}
            {place.transport_mode && (
              <span className={`flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                place.transport_mode === 'walking' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {place.transport_mode === 'walking' ? '🚶' : <Car size={10} />}
                {place.transport_mode === 'walking' ? 'A pie' : 'Coche'}
              </span>
            )}
          </div>
        </div>
        {place.description && (
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{place.description}</p>
        )}
        {place.distance_km > 0 && (
          <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <MapPin size={9} /> {place.distance_km} km
          </p>
        )}
      </div>
    </div>
  </div>
)

const Section = ({ icon, label, colorScheme, children }) => {
  const schemes = {
    morning: { bg: 'bg-amber-50', border: 'border-amber-100', icon: 'bg-amber-500', text: 'text-amber-900' },
    lunch: { bg: 'bg-orange-50', border: 'border-orange-100', icon: 'bg-orange-500', text: 'text-orange-900' },
    afternoon: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'bg-emerald-500', text: 'text-emerald-900' },
    evening: { bg: 'bg-violet-50', border: 'border-violet-100', icon: 'bg-violet-500', text: 'text-violet-900' },
  }
  const s = schemes[colorScheme]
  return (
    <div className={`${s.bg} rounded-2xl p-4 border ${s.border}`}>
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`${s.icon} p-2 rounded-xl shadow-sm`}>{icon}</div>
        <h4 className={`font-bold text-sm uppercase tracking-wide ${s.text}`}>{label}</h4>
      </div>
      {children}
    </div>
  )
}

export default function DayCard({ dayData, destination, index }) {
  const [expanded, setExpanded] = useState(true)

  const handleOpenMaps = () => {
    const city = destination || ''
    const places = []
    if (Array.isArray(dayData.plan.morning)) dayData.plan.morning.forEach(p => places.push(p.place))
    if (dayData.plan.lunch?.area) places.push(dayData.plan.lunch.area)
    else if (dayData.plan.lunch_area) places.push(dayData.plan.lunch_area)
    if (Array.isArray(dayData.plan.afternoon)) dayData.plan.afternoon.forEach(p => places.push(p.place))
    if (Array.isArray(dayData.plan.evening)) dayData.plan.evening.forEach(p => places.push(p.place))

    if (places.length === 0) return

    const encode = p => encodeURIComponent(`${p}, ${city}, España`)
    const origin = encode(places[0])
    const dest = encode(places[places.length - 1])
    const waypoints = places.slice(1, -1).slice(0, 9).map(encode).join('|')
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=walking`
    if (waypoints) url += `&waypoints=${waypoints}`
    window.open(url, '_blank')
  }

  // Get evening restaurants (nested in last evening item or legacy field)
  const lastEvening = Array.isArray(dayData.plan.evening) && dayData.plan.evening.length > 0
    ? dayData.plan.evening[dayData.plan.evening.length - 1] : null
  const eveningRestaurants = lastEvening?.restaurants || dayData.plan.evening_restaurants || []

  return (
    <div
      className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
      style={{ animationDelay: `${index * 0.08}s`, animation: 'fadeUp 0.5s ease both' }}
    >
      {/* Day header */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <span className="font-black text-lg">{dayData.day}</span>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-white/70">Día {dayData.day}</p>
                {dayData.zone && <p className="font-bold text-lg leading-tight">{dayData.zone}</p>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right bg-white/15 rounded-2xl px-4 py-2.5 backdrop-blur-sm">
              <p className="text-2xl font-black">{dayData.total_km}</p>
              <p className="text-xs text-white/70 font-medium">km</p>
            </div>
            {dayData.total_time && (
              <div className="text-right bg-white/15 rounded-2xl px-4 py-2.5 backdrop-blur-sm">
                <p className="text-2xl font-black">{dayData.total_time}</p>
                <p className="text-xs text-white/70 font-medium">horas</p>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleOpenMaps}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all border border-white/30 hover:border-white/50 backdrop-blur-sm"
        >
          <Navigation size={14} />
          Ver ruta en Google Maps
        </button>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors border-b border-gray-100"
      >
        <span>{expanded ? 'Ocultar detalle' : 'Ver detalle'}</span>
        <ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="p-5 space-y-4">
          {/* Morning */}
          <Section icon={<Sun size={14} className="text-white" />} label="Mañana" colorScheme="morning">
            {Array.isArray(dayData.plan.morning) ? (
              <div className="space-y-2">
                {dayData.plan.morning.map((p, i) => <PlaceItem key={i} place={p} />)}
              </div>
            ) : <p className="text-sm text-gray-600">{dayData.plan.morning}</p>}
          </Section>

          {/* Lunch */}
          <Section icon={<Utensils size={14} className="text-white" />} label="Comida" colorScheme="lunch">
            {dayData.plan.lunch?.area ? (
              <div className="space-y-2">
                <div className="p-3.5 bg-white rounded-2xl border border-orange-100">
                  <div className="flex items-start justify-between">
                    <p className="font-semibold text-sm text-gray-900">{dayData.plan.lunch.area}</p>
                    {dayData.plan.lunch.time_estimated && (
                      <span className="text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium ml-2 whitespace-nowrap">
                        ⏱️ {dayData.plan.lunch.time_estimated}
                      </span>
                    )}
                  </div>
                  {dayData.plan.lunch.suggestion && (
                    <p className="text-xs text-gray-500 mt-1">{dayData.plan.lunch.suggestion}</p>
                  )}
                </div>
                {Array.isArray(dayData.plan.lunch.restaurants) && dayData.plan.lunch.restaurants.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1">
                      <UtensilsCrossed size={11} /> Restaurantes recomendados
                    </p>
                    {dayData.plan.lunch.restaurants.map((r, i) => {
                      const price = getPriceLabel(r.price_range)
                      return (
                        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-orange-100 mb-1.5 last:mb-0">
                          <p className="text-sm font-medium text-gray-800">{r.name}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${price.color}`}>{price.label}</span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">{dayData.plan.lunch_area || dayData.plan.lunch}</p>
            )}
          </Section>

          {/* Afternoon */}
          <Section icon={<Sunset size={14} className="text-white" />} label="Tarde" colorScheme="afternoon">
            {Array.isArray(dayData.plan.afternoon) ? (
              <div className="space-y-2">
                {dayData.plan.afternoon.map((p, i) => <PlaceItem key={i} place={p} />)}
              </div>
            ) : <p className="text-sm text-gray-600">{dayData.plan.afternoon}</p>}
          </Section>

          {/* Evening */}
          <Section icon={<Moon size={14} className="text-white" />} label="Noche" colorScheme="evening">
            <div className="space-y-2">
              {Array.isArray(dayData.plan.evening)
                ? dayData.plan.evening.map((p, i) => <PlaceItem key={i} place={p} />)
                : <p className="text-sm text-gray-600">{dayData.plan.evening}</p>
              }
              {Array.isArray(eveningRestaurants) && eveningRestaurants.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-bold text-violet-700 mb-2 flex items-center gap-1">
                    <UtensilsCrossed size={11} /> Cena recomendada
                  </p>
                  {eveningRestaurants.map((r, i) => {
                    const price = getPriceLabel(r.price_range)
                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-violet-100 mb-1.5 last:mb-0">
                        <p className="text-sm font-medium text-gray-800">{r.name}</p>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${price.color}`}>{price.label}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </Section>
        </div>
      )}
    </div>
  )
}
