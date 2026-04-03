import { NextResponse } from 'next/server'

// ─── Mock fallback ────────────────────────────────────────────────────────────
function getMockForCity(destination, days, intensity) {
  const kmPerDay = intensity === 'atope' ? 180 : intensity === 'relax' ? 90 : 130
  return {
    destination,
    total_km: parseInt(days) * kmPerDay,
    total_time: `${parseInt(days) * 8}h`,
    days: Array.from({ length: parseInt(days) }, (_, i) => ({
      day: i + 1,
      zone: i === 0 ? `Centro de ${destination}` : `Alrededores de ${destination}`,
      total_km: kmPerDay,
      total_time: '8h',
      plan: {
        morning: [
          { place: `Casco histórico de ${destination}`, description: 'Principales monumentos y calles peatonales del centro', distance_km: 0, time_estimated: '2h0m', transport_mode: 'walking', coordinates: { lat: 40.0, lng: -3.5 } },
          { place: `Catedral / Iglesia principal de ${destination}`, description: 'Patrimonio histórico y arquitectónico local', distance_km: 0.5, time_estimated: '1h0m', transport_mode: 'walking', coordinates: { lat: 40.005, lng: -3.505 } }
        ],
        lunch: {
          area: `Mercado o zona de tapas de ${destination}`,
          suggestion: 'Gastronomía local con productos de temporada',
          time_estimated: '1h30m', transport_mode: 'walking', coordinates: { lat: 40.01, lng: -3.51 },
          restaurants: [
            { name: `Restaurante tradicional de ${destination}`, price_range: 'medio', coordinates: { lat: 40.01, lng: -3.51 } },
            { name: `Bar de tapas local`, price_range: 'bajo', coordinates: { lat: 40.011, lng: -3.511 } }
          ]
        },
        afternoon: [
          { place: `Museo o galería de ${destination}`, description: 'Arte y cultura local', distance_km: 1.0, time_estimated: '2h0m', transport_mode: 'walking', coordinates: { lat: 40.02, lng: -3.52 } }
        ],
        evening: [
          { place: `Zona de tapeo nocturno de ${destination}`, description: 'Ambiente local y gastronomía nocturna', distance_km: 0.8, time_estimated: '2h0m', transport_mode: 'walking', coordinates: { lat: 40.03, lng: -3.53 },
            restaurants: [
              { name: `Restaurante con encanto de ${destination}`, price_range: 'medio', coordinates: { lat: 40.03, lng: -3.53 } },
              { name: `Bodega o taberna local`, price_range: 'bajo', coordinates: { lat: 40.031, lng: -3.531 } }
            ]
          }
        ]
      }
    }))
  }
}

// ─── Build Gemini prompt ──────────────────────────────────────────────────────
function buildPrompt(destination, days, hasCar, intensity, preferences, startingAddress) {
  const carText = hasCar === 'si' ? 'sí' : 'no'

  const strictFilters = []
  if (preferences.with_dogs) strictFilters.push('SOLO lugares dog-friendly (playas, parques, restaurantes con terraza)')
  if (preferences.with_children) strictFilters.push('SOLO actividades seguras para niños, museos interactivos, parques de juegos')
  if (preferences.with_elderly) strictFilters.push('SOLO lugares accesibles, sin escaleras largas, ritmo tranquilo')
  if (preferences.with_couple) strictFilters.push('SOLO planes románticos: miradores, cenas íntimas, rutas con encanto')
  if (preferences.with_friends) strictFilters.push('SOLO planes en grupo: bares, rutas culturales, experiencias compartidas')

  const priorityMap = {
    natural: 'NATURAL: 70% naturaleza (senderismo, miradores, playas, parques nacionales)',
    gastronomica: 'GASTRONÓMICA: 70% gastronomía (restaurantes con encanto, mercados, bodegas, rutas de tapas)',
    cultural: 'CULTURAL: 70% patrimonio (museos, catedrales, barrios históricos, arte)',
  }
  const priorityText = priorityMap[preferences.priority] || priorityMap.cultural
  const startText = startingAddress ? `\n- Punto de partida: ${startingAddress}` : ''
  const filtersText = strictFilters.length ? '\nREQUISITOS:\n' + strictFilters.map(f => `- ${f}`).join('\n') : ''

  // Force variety across days
  const dayCount = parseInt(days)
  const dayHints = Array.from({ length: dayCount }, (_, i) => `- Día ${i + 1}: zona/barrio/comarca DISTINTA a todos los demás días`).join('\n')

  return `Eres un experto en turismo por España con conocimiento profundo de todas sus regiones, ciudades y pueblos.

Genera un itinerario de ${days} días para: ${destination}${startText}
Coche: ${carText} | Intensidad: ${intensity} | Prioridad ${priorityText}${filtersText}

⚠️ REGLA CRÍTICA — CADA DÍA DEBE SER COMPLETAMENTE DIFERENTE:
- NUNCA repitas el mismo lugar, zona, barrio o monumento en distintos días
- Cada día tiene su propia "zone" (barrio, pueblo o comarca distinta)
- Distribuye inteligentemente: ciudad grande → barrios distintos; región → pueblos/zonas distintas
- Ejemplo Galicia: Día 1 Santiago de Compostela casco histórico, Día 2 Rías Baixas (Cambados/O Grove), Día 3 Costa da Morte (Muxía/Fisterra)
- Ejemplo Madrid: Día 1 Centro/Sol/Mayor, Día 2 excursión Toledo o Segovia, Día 3 Retiro/Salamanca

Distribución de zonas OBLIGATORIA para este viaje:
${dayHints}

REGLAS TÉCNICAS:
- transport_mode: "walking" <2km, "driving" >2km
- Nombres REALES de lugares y restaurantes (nunca genéricos como "restaurante local")
- price_range: exactamente "alto", "medio" o "bajo"
- coordinates: lat/lng reales y precisas
- Mínimo 2 lugares mañana, 2 tarde, 1 zona noche con restaurantes
- total_km y total_time realistas

Devuelve ÚNICAMENTE el JSON con ${days} días completos, sin texto antes ni después:

{
  "destination": "${destination}",
  "total_km": 0,
  "total_time": "0h",
  "days": [
    {
      "day": 1,
      "zone": "Nombre del barrio o zona",
      "total_km": 0,
      "total_time": "8h",
      "google_maps_url": "https://www.google.com/maps/dir/?api=1&origin=LUGAR1,${destination},España&destination=ULTIMOLUGAR,${destination},España&waypoints=LUGAR2|LUGAR3&travelmode=walking",
      "plan": {
        "morning": [
          { "place": "Nombre real del lugar", "description": "Por qué merece la pena (1 frase)", "distance_km": 0, "time_estimated": "1h30m", "transport_mode": "walking", "coordinates": {"lat": 40.4168, "lng": -3.7038} }
        ],
        "lunch": {
          "area": "Zona o mercado concreto para comer",
          "suggestion": "Plato típico o tipo de cocina",
          "time_estimated": "1h30m",
          "transport_mode": "walking",
          "coordinates": {"lat": 40.4168, "lng": -3.7038},
          "restaurants": [
            {"name": "Nombre real restaurante", "price_range": "alto", "coordinates": {"lat": 40.4168, "lng": -3.7038}},
            {"name": "Nombre real restaurante 2", "price_range": "medio", "coordinates": {"lat": 40.4169, "lng": -3.7039}},
            {"name": "Nombre real restaurante 3", "price_range": "bajo", "coordinates": {"lat": 40.4170, "lng": -3.7040}}
          ]
        },
        "afternoon": [
          { "place": "Nombre real del lugar", "description": "Por qué merece la pena", "distance_km": 1.2, "time_estimated": "2h0m", "transport_mode": "walking", "coordinates": {"lat": 40.4180, "lng": -3.7050} }
        ],
        "evening": [
          {
            "place": "Nombre real de zona nocturna",
            "description": "Ambiente y propuesta de noche",
            "distance_km": 0.5,
            "time_estimated": "2h0m",
            "transport_mode": "walking",
            "coordinates": {"lat": 40.4190, "lng": -3.7060},
            "restaurants": [
              {"name": "Nombre real cena 1", "price_range": "alto", "coordinates": {"lat": 40.4190, "lng": -3.7060}},
              {"name": "Nombre real cena 2", "price_range": "medio", "coordinates": {"lat": 40.4191, "lng": -3.7061}},
              {"name": "Nombre real cena 3", "price_range": "bajo", "coordinates": {"lat": 40.4192, "lng": -3.7062}}
            ]
          }
        ]
      }
    }
  ]
}`
}

// ─── Call Gemini ──────────────────────────────────────────────────────────────
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY no configurada')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Gemini error ${res.status}: ${err?.error?.message || 'Error desconocido'}`)
  }

  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini no devolvió contenido')

  // Limpiar posibles markdown fences
  const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
  return JSON.parse(clean)
}

// ─── Handlers ─────────────────────────────────────────────────────────────────
export async function GET() {
  return NextResponse.json({
    message: 'RutaEficiente API — POST /api/generate',
    gemini: process.env.GEMINI_API_KEY ? 'configurada ✓' : 'no configurada (modo demo)',
    status: 'ok',
  })
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { destination, city, days, hasCar, intensity, preferences, starting_address } = body
    const finalDestination = (destination || city || '').trim()

    if (!finalDestination || !days) {
      return NextResponse.json({ error: 'Faltan campos: destination y days son obligatorios' }, { status: 400 })
    }

    const daysNum = parseInt(days)
    if (isNaN(daysNum) || daysNum < 2 || daysNum > 5) {
      return NextResponse.json({ error: 'El número de días debe ser entre 2 y 5' }, { status: 400 })
    }

    // Con API key → Gemini real
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log(`[Gemini] ${finalDestination} · ${days} días · ${intensity}`)
        const prompt = buildPrompt(finalDestination, days, hasCar, intensity, preferences || {}, starting_address || '')
        const itinerary = await callGemini(prompt)
        return NextResponse.json(itinerary)
      } catch (err) {
        console.error('[Gemini] Error:', err.message, '— usando fallback')
        return NextResponse.json({
          ...getMockForCity(finalDestination, days, intensity),
          _note: 'Datos de respaldo (Gemini no disponible temporalmente)',
        })
      }
    }

    // Sin API key → mock con aviso
    console.log('[Demo] Sin GEMINI_API_KEY — devolviendo mock')
    return NextResponse.json({
      ...getMockForCity(finalDestination, days, intensity),
      _note: 'Modo demo — añade GEMINI_API_KEY en Vercel para itinerarios reales con IA',
    })

  } catch (error) {
    console.error('[API] Error interno:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT() { return NextResponse.json({ error: 'Método no permitido' }, { status: 405 }) }
export async function DELETE() { return NextResponse.json({ error: 'Método no permitido' }, { status: 405 }) }
