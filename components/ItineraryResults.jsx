'use client'

import { useState } from 'react'
import { MapPin, Navigation, FileDown, Edit3, Bookmark, BookmarkCheck, TrendingUp, Calendar, Route } from 'lucide-react'
import DayCard from './DayCard'
import { useAuth } from '@/contexts/AuthContext'
import { useItineraries } from '@/contexts/ItinerariesContext'
import AuthModal from './AuthModal'

export default function ItineraryResults({ itinerary, formData, onReset }) {
  const { user } = useAuth()
  const { save } = useItineraries()
  const [saved, setSaved] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)

  const destination = itinerary.destination || itinerary.city
  const avgKm = Math.round(itinerary.total_km / itinerary.days.length)

  const optimizationScore = () => {
    if (avgKm < 50) return 97
    if (avgKm < 80) return 92
    if (avgKm < 120) return 85
    if (avgKm < 160) return 76
    return 68
  }

  const handleSave = () => {
    if (!user) { setShowAuth(true); return }
    if (saved) return
    save(itinerary, formData)
    setSaved(true)
  }

  const handleOpenMaps = () => {
    const allPlaces = []
    itinerary.days.forEach(day => {
      if (Array.isArray(day.plan.morning)) day.plan.morning.forEach(p => allPlaces.push(p.place))
      if (day.plan.lunch?.area) allPlaces.push(day.plan.lunch.area)
      else if (day.plan.lunch_area) allPlaces.push(day.plan.lunch_area)
      if (Array.isArray(day.plan.afternoon)) day.plan.afternoon.forEach(p => allPlaces.push(p.place))
      if (Array.isArray(day.plan.evening)) day.plan.evening.forEach(p => allPlaces.push(p.place))
    })
    if (!allPlaces.length) return

    const encode = p => encodeURIComponent(`${p}, ${destination}, España`)
    const origin = encode(allPlaces[0])
    const dest = encode(allPlaces[allPlaces.length - 1])
    const waypoints = allPlaces.slice(1, -1).slice(0, 9).map(encode).join('|')
    let url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`
    if (waypoints) url += `&waypoints=${waypoints}`
    window.open(url, '_blank')
  }

  const handleExportPDF = async () => {
    setPdfLoading(true)
    try {
      const pdfMake = (await import('pdfmake/build/pdfmake')).default
      const pdfFonts = await import('pdfmake/build/vfs_fonts')
      if (pdfFonts.default?.pdfMake) pdfMake.vfs = pdfFonts.default.pdfMake.vfs
      else if (pdfFonts.pdfMake) pdfMake.vfs = pdfFonts.pdfMake.vfs

      const content = [
        { text: 'RutaEficiente', style: 'brand', alignment: 'center', margin: [0, 0, 0, 5] },
        { text: destination, style: 'title', alignment: 'center', margin: [0, 0, 0, 5] },
        {
          text: `${formData.days} días · Intensidad ${formData.intensity} · ${itinerary.total_km} km totales`,
          style: 'subtitle', alignment: 'center', margin: [0, 0, 0, 30]
        },
        ...itinerary.days.flatMap((day, i) => {
          const items = []
          if (i > 0) items.push({ text: '', pageBreak: 'before' })
          items.push({
            table: { widths: ['*'], body: [[{
              stack: [
                { columns: [
                  { text: `DÍA ${day.day}${day.zone ? ' · ' + day.zone : ''}`, style: 'dayHeader', width: '*' },
                  { text: `${day.total_km} km`, style: 'dayHeader', width: 'auto' }
                ]}
              ],
              fillColor: '#E11D48', color: '#fff', margin: [14, 14, 14, 14]
            }]] },
            layout: 'noBorders', margin: [0, 0, 0, 12]
          })

          const addSection = (label, items_data) => {
            if (!items_data) return
            const rows = Array.isArray(items_data)
              ? items_data.map(p => ({ stack: [{ text: p.place, bold: true, fontSize: 10 }, { text: p.description || '', fontSize: 9, color: '#6b7280' }], margin: [0, 3, 0, 3] }))
              : [{ text: typeof items_data === 'string' ? items_data : items_data.area || '', fontSize: 10, color: '#374151' }]

            items.push({
              table: { widths: ['*'], body: [[{
                stack: [{ text: label, bold: true, fontSize: 10, color: '#374151', margin: [0, 0, 0, 6] }, ...rows],
                fillColor: '#f9fafb', margin: [12, 10, 12, 10]
              }]] },
              layout: 'noBorders', margin: [0, 0, 0, 8]
            })
          }

          addSection('☀️ MAÑANA', day.plan.morning)
          addSection('🍴 COMIDA', day.plan.lunch)
          addSection('🌅 TARDE', day.plan.afternoon)
          addSection('🌙 NOCHE', day.plan.evening)

          return items
        })
      ]

      pdfMake.createPdf({
        pageSize: 'A4', pageMargins: [40, 50, 40, 50],
        content,
        styles: {
          brand: { fontSize: 10, color: '#E11D48', bold: true, letterSpacing: 2 },
          title: { fontSize: 32, bold: true, color: '#111827' },
          subtitle: { fontSize: 12, color: '#6b7280' },
          dayHeader: { fontSize: 16, bold: true }
        }
      }).download(`Itinerario_${destination}_${formData.days}dias.pdf`)
    } catch (e) {
      console.error('PDF error:', e)
      alert('Error al generar PDF. Inténtalo de nuevo.')
    }
    setPdfLoading(false)
  }

  const score = optimizationScore()

  return (
    <>
      <div className="space-y-6" className="animate-fade-up">
        {/* Results header */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Gradient top */}
          <div className="h-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-orange-400" />

          <div className="p-6 sm:p-8">
            {/* Title row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={20} className="text-rose-500" />
                  <h2 className="text-3xl sm:text-4xl font-black text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {destination}
                  </h2>
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  {formData.days} días · <span className="capitalize">{formData.intensity}</span>
                  {formData.hasCar === 'si' ? ' · Con coche' : ' · Sin coche'}
                </p>
              </div>
              {/* Score badge */}
              <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl self-start">
                <TrendingUp size={16} className="text-emerald-500" />
                <div>
                  <p className="text-xs text-emerald-600 font-medium leading-none">Optimización</p>
                  <p className="text-xl font-black text-emerald-700 leading-none mt-0.5">{score}%</p>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-rose-50 rounded-2xl p-4 text-center border border-rose-100">
                <p className="text-3xl font-black text-rose-600">{itinerary.total_km}</p>
                <p className="text-xs text-rose-500 font-semibold mt-0.5">km totales</p>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 text-center border border-purple-100">
                <p className="text-3xl font-black text-purple-600">{avgKm}</p>
                <p className="text-xs text-purple-500 font-semibold mt-0.5">km/día</p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
                <p className="text-3xl font-black text-blue-600">{itinerary.days.length}</p>
                <p className="text-xs text-blue-500 font-semibold mt-0.5">días</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${
                  saved
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-rose-300 hover:text-rose-600'
                }`}
              >
                {saved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                {saved ? 'Guardado' : 'Guardar viaje'}
              </button>
              <button
                onClick={handleOpenMaps}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-200"
              >
                <Navigation size={15} />
                Google Maps
              </button>
              <button
                onClick={handleExportPDF}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                <FileDown size={15} />
                {pdfLoading ? 'Generando...' : 'PDF'}
              </button>
              <button
                onClick={onReset}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                <Edit3 size={15} />
                Nuevo viaje
              </button>
            </div>
          </div>
        </div>

        {/* Day cards */}
        <div className="space-y-4">
          {itinerary.days?.map((day, i) => (
            <DayCard key={day.day} dayData={day} destination={destination} index={i} />
          ))}
        </div>
      </div>

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} />
      )}
    </>
  )
}
