'use client'

import { useState } from 'react'
import {
  Sun, Utensils, Sunset, Moon, MapPin, Car, Clock,
  Landmark, UtensilsCrossed, TreePine, Navigation, ChevronDown
} from 'lucide-react'

const getActivityIcon = (text) => {
  const t = (text || '').toLowerCase()
  if (/museo|catedral|palacio|iglesia|alcázar|monasterio|castillo|basílica/.test(t)) return <Landmark size={14} className="text-violet-500" />
  if (/restaurante|tapas|gastro|mercado|comida|bodega|taberna/.test(t)) return <UtensilsCrossed size={14} className="text-orange-500" />
  if (/parque|jardín|sierra|natural|monte|mirador|playa|lago|bosque|rías/.test(t)) return <TreePine size={14} className="text-emerald-500" />
  return <MapPin size={14} className="text-blue-500" />
}

const getPriceLabel = (priceRange) => {
  const p = (priceRange || '').toLowerCase()
  if (p.includes('alto') || p.includes('high'))  return { label: '€€€', color: 'text-amber-700 bg-amber-50 border-amber-200' }
  if (p.includes('bajo') || p.includes('low'))   return { label: '€',   color: 'text-emerald-700 bg-emerald-50 border-emerald-200' }
  return                                                 { label: '€€',  color: 'text-blue-700 bg-blue-50 border-blue-200' }
}

const mapsUrl = (name, coordinates, city) => {
  if (coordinates?.lat && coordinates?.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${city}, España`)}`
}

const MapsBtn = ({ href, label = 'Ver en Maps' }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-all"
  >
    <MapPin size={10} />
    {label}
  </a>
)

const PlaceItem = ({ place, city }) => (
  <div className="p-3.5 bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
    <div className="flex gap-3">
      <div className="mt-0.5 w-6 h-6 flex items-center justify-center flex-shrink-0">
        {getActivityIcon(place.place)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <p className="font-semibold text-sm text-gray-900 leading-snug">{place.place}</p>
          <div className="flex gap-1 flex-shrink-0 flex-wrap">
            {place.time_estimated && (
              <span className="flex items-center gap-1 text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                <Clock size={10} />{place.time_estimated}
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
        <div className="flex items-center justify-between mt-2">
          {place.distance_km > 0
            ? <p className="text-[11px] text-gray-400 flex items-center gap-1"><MapPin size={9} />{place.distance_km} km</p>
            : <span />
          }
          <MapsBtn href={mapsUrl(place.place, place.coordinates, city)} />
        </div>
      </div>
    </div>
  </div>
)

const RestaurantItem = ({ restaurant, city, borderColor }) => {
  const price = getPriceLabel(restaurant.price_range)
  return (
    <div className={`flex items-center justify-between p-3 bg-white rounded-xl border ${borderColor || 'border-gray-100'} mb-1.5 last:mb-0 hover:shadow-sm transition-all`}>
      <div className="flex items-center gap-2 min-w-0">
        <UtensilsCrossed size={13} className="text-gray-400 flex-shrink-0" />
        <p className="text-sm font-medium text-gray-800 truncate">{restaurant.name}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${price.color}`}>{price.label}</span>
        <MapsBtn href={mapsUrl(restaurant.name, restaurant.coordinates, city)} label="Maps" />
      </div>
    </div>
  )
}

const Section = ({ icon, label, colorScheme, children }) => {
  const schemes = {
    morning:   { bg: 'bg-amber-50',   border: 'border-amber-100',   icon: 'bg-amber-500',   text: 'text-amber-900' },
    lunch:     { bg: 'bg-orange-50',  border: 'border-orange-100',  icon: 'bg-orange-500',  text: 'text-orange-900' },
    afternoon: { bg: 'bg-emerald-50', border: 'border-emerald-100', icon: 'bg-emerald-500', text: 'text-emerald-900' },
    evening:   { bg: 'bg-violet-50',  border: 'border-violet-100',  icon: 'bg-violet-500',  text: 'text-violet-900' },
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
    if (dayData.google_maps_url) { window.open(dayData.google_maps_url, '_blank'); return }
    const city = destination || ''
    const places = []
    if (Array.isArray(dayData.plan.morning))   dayData.plan.morning.forEach(p => places.push(p.place))
    if (dayData.plan.lunch?.area)              places.push(dayData.plan.lunch.area)
    else if (dayData.plan.lunch_area)          places.push(dayData.plan.lunch_area)
    if (Array.isArray(dayData.plan.afternoon)) dayData.plan.afternoon.forEach(p => places.push(p.place))
    if (Array.isArray(dayData.plan.evening))   dayData.plan.evening.forEach(p => places.push(p.place))
    if (!places.length) return
    const encode = p => encodeURIComponent(`${p}, ${city}, España`)
    const origin    = encode(places[0])
    const dest      = encode(places[places.length - 1])
    const waypoints = places.slice(1, -1).slice(0, 9).map(encode).join('|')
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=walking`
    if (waypoints) url += `&waypoints=${waypoints}`
    window.open(url, '_blank')
  }

  const lastEvening = Array.isArray(dayData.plan.evening) && dayData.plan.evening.length > 0
    ? dayData.plan.evening[dayData.plan.evening.length - 1] : null
  const eveningRestaurants = lastEvening?.restaurants || dayData.plan.evening_restaurants || []

  return (
    <div
      className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
      style={{ animationDelay: `${index * 0.08}s`, animation: 'fadeUp 0.5s ease both' }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="font-black text-lg">{dayData.day}</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-white/70">Día {dayData.day}</p>
              {dayData.zone && <p className="font-bold text-lg leading-tight">{dayData.zone}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right bg-white/15 rounded-2xl px-3 py-2 backdrop-blur-sm">
              <p className="text-xl font-black">{dayData.total_km}</p>
              <p className="text-xs text-white/70 font-medium">km</p>
            </div>
            {dayData.total_time && (
              <div className="text-right bg-white/15 rounded-2xl px-3 py-2 backdrop-blur-sm">
                <p className="text-xl font-black">{dayData.total_time}</p>
                <p className="text-xs text-white/70 font-medium">horas</p>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={handleOpenMaps}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all border border-white/30 hover:border-white/50"
        >
          <Navigation size={14} />
          Ver ruta completa del día en Google Maps
        </button>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-3 text-xs font-bold uppercase tracking-widest text-gray-400 hover:bg-gray-50 transition-colors border-b border-gray-100"
      >
        <span>{expanded ? 'Ocultar detalle' : 'Ver detalle del día'}</span>
        <ChevronDown size={14} className={`transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Content */}
      {expanded && (
        <div className="p-5 space-y-4">

          {/* MAÑANA */}
          <Section icon={<Sun size={14} className="text-white" />} label="Mañana" colorScheme="morning">
            {Array.isArray(dayData.plan.morning)
              ? <div className="space-y-2">{dayData.plan.morning.map((p, i) => <PlaceItem key={i} place={p} city={destination} />)}</div>
              : <p className="text-sm text-gray-600">{dayData.plan.morning}</p>
            }
          </Section>

          {/* COMIDA */}
          <Section icon={<Utensils size={14} className="text-white" />} label="Comida" colorScheme="lunch">
            {dayData.plan.lunch?.area ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-white rounded-2xl border border-orange-100">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <p className="font-semibold text-sm text-gray-900">{dayData.plan.lunch.area}</p>
                    {dayData.plan.lunch.time_estimated && (
                      <span className="text-[11px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                        ⏱️ {dayData.plan.lunch.time_estimated}
                      </span>
                    )}
                  </div>
                  {dayData.plan.lunch.suggestion && (
                    <p className="text-xs text-gray-500 mt-1">{dayData.plan.lunch.suggestion}</p>
                  )}
                  <div className="mt-2">
                    <MapsBtn href={mapsUrl(dayData.plan.lunch.area, dayData.plan.lunch.coordinates, destination)} label="Ver zona en Maps" />
                  </div>
                </div>
                {Array.isArray(dayData.plan.lunch.restaurants) && dayData.plan.lunch.restaurants.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-orange-700 mb-2 flex items-center gap-1">
                      <UtensilsCrossed size={11} /> Restaurantes recomendados
                    </p>
                    {dayData.plan.lunch.restaurants.map((r, i) => (
                      <RestaurantItem key={i} restaurant={r} city={destination} borderColor="border-orange-100" />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600">{dayData.plan.lunch_area || dayData.plan.lunch}</p>
            )}
          </Section>

          {/* TARDE */}
          <Section icon={<Sunset size={14} className="text-white" />} label="Tarde" colorScheme="afternoon">
            {Array.isArray(dayData.plan.afternoon)
              ? <div className="space-y-2">{dayData.plan.afternoon.map((p, i) => <PlaceItem key={i} place={p} city={destination} />)}</div>
              : <p className="text-sm text-gray-600">{dayData.plan.afternoon}</p>
            }
          </Section>

          {/* NOCHE */}
          <Section icon={<Moon size={14} className="text-white" />} label="Noche" colorScheme="evening">
            <div className="space-y-2">
              {Array.isArray(dayData.plan.evening)
                ? dayData.plan.evening.map((p, i) => <PlaceItem key={i} place={p} city={destination} />)
                : <p className="text-sm text-gray-600">{dayData.plan.evening}</p>
              }
              {Array.isArray(eveningRestaurants) && eveningRestaurants.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-bold text-violet-700 mb-2 flex items-center gap-1">
                    <UtensilsCrossed size={11} /> Restaurantes para cenar
                  </p>
                  {eveningRestaurants.map((r, i) => (
                    <RestaurantItem key={i} restaurant={r} city={destination} borderColor="border-violet-100" />
                  ))}
                </div>
              )}
            </div>
          </Section>

        </div>
      )}
    </div>
  )
}
