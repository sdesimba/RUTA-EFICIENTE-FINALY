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
      zone: `Zona ${i + 1} de ${destination}`,
      total_km: kmPerDay,
      total_time: '8h',
      plan: {
        morning: [
          { place: `Lugar turístico 1 - Día ${i+1}`, description: 'Configura GEMINI_API_KEY para obtener lugares reales', distance_km: 0, time_estimated: '2h0m', transport_mode: 'walking', coordinates: { lat: 40.0, lng: -3.5 } },
        ],
        lunch: {
          area: `Zona de restaurantes`,
          suggestion: 'Gastronomía local',
          time_estimated: '1h30m', transport_mode: 'walking', coordinates: { lat: 40.01, lng: -3.51 },
          restaurants: [
            { name: `Restaurante caro`, price_range: 'alto', coordinates: { lat: 40.01, lng: -3.51 } },
            { name: `Restaurante medio`, price_range: 'medio', coordinates: { lat: 40.011, lng: -3.511 } },
            { name: `Restaurante barato`, price_range: 'bajo', coordinates: { lat: 40.012, lng: -3.512 } }
          ]
        },
        afternoon: [
          { place: `Lugar turístico tarde - Día ${i+1}`, description: 'Configura GEMINI_API_KEY para obtener lugares reales', distance_km: 1.0, time_estimated: '2h0m', transport_mode: 'walking', coordinates: { lat: 40.02, lng: -3.52 } }
        ],
        evening: [
          { place: `Zona nocturna`, description: 'Ambiente local', distance_km: 0.8, time_estimated: '2h0m', transport_mode: 'walking', coordinates: { lat: 40.03, lng: -3.53 },
            restaurants: [
              { name: `Cena cara`, price_range: 'alto', coordinates: { lat: 40.03, lng: -3.53 } },
              { name: `Cena media`, price_range: 'medio', coordinates: { lat: 40.031, lng: -3.531 } },
              { name: `Cena barata`, price_range: 'bajo', coordinates: { lat: 40.032, lng: -3.532 } }
            ]
          }
        ]
      }
    }))
  }
}

// ─── Build prompt for ONE day ─────────────────────────────────────────────────
function buildDayPrompt({ destination, dayNumber, totalDays, hasCar, intensity, preferences, startingAddress, usedPlaces, usedZones }) {
  const carText = hasCar === 'si' ? 'sí, tiene coche' : 'no, va a pie o transporte público'
  
  const priorityMap = {
    natural: 'naturaleza (senderismo, miradores, playas, parques)',
    gastronomica: 'gastronomía (mercados, bodegas, restaurantes típicos)',
    cultural: 'cultura (museos, catedrales, barrios históricos, monumentos)',
  }
  const priority = priorityMap[preferences?.priority] || priorityMap.cultural

  const filters = []
  if (preferences?.with_dogs) filters.push('los viajeros van con perros — solo lugares pet-friendly')
  if (preferences?.with_children) filters.push('van con niños — actividades cortas y seguras para familias')
  if (preferences?.with_elderly) filters.push('van personas mayores — lugares accesibles, poco caminar')
  if (preferences?.with_couple) filters.push('viajan en pareja — planes románticos, miradores, cenas íntimas')
  if (preferences?.with_friends) filters.push('viajan amigos — planes dinámicos, bares, experiencias en grupo')
  const filtersText = filters.length ? '\nCONDICIONES ESPECIALES:\n' + filters.map(f => `- ${f}`).join('\n') : ''

  const usedPlacesText = usedPlaces.length > 0
    ? `\nLUGARES YA VISITADOS EN DÍAS ANTERIORES (NO REPETIR NINGUNO):\n${usedPlaces.map(p => `- ${p}`).join('\n')}`
    : ''

  const usedZonesText = usedZones.length > 0
    ? `\nZONAS YA USADAS (usa una zona/barrio/área DIFERENTE hoy):\n${usedZones.map(z => `- ${z}`).join('\n')}`
    : ''

  const startText = startingAddress ? `\nPunto de inicio del viajero: ${startingAddress}` : ''
  
  const intensityGuide = {
    relax: '2 lugares mañana + 1-2 tarde (ritmo tranquilo, con descansos)',
    equilibrado: '2-3 lugares mañana + 2 tarde (buen ritmo sin agobiar)',
    atope: '3 lugares mañana + 3 tarde (máximo aprovechamiento del día)',
  }
  const intensityText = intensityGuide[intensity] || intensityGuide.equilibrado

  return `Eres un experto guía de viajes por España. Conoces perfectamente todos los pueblos, ciudades, monumentos, restaurantes y zonas turísticas del país.

TAREA: Planifica el DÍA ${dayNumber} de ${totalDays} de una escapada a ${destination}.${startText}
Coche disponible: ${carText}
Intensidad: ${intensity} — ${intensityText}
Prioridad: ${priority}${filtersText}
${usedPlacesText}
${usedZonesText}

INSTRUCCIONES OBLIGATORIAS:
1. Elige una zona/barrio/área DIFERENTE a las ya usadas para este día
2. Selecciona lugares turísticos REALES y ESPECÍFICOS (nombres exactos, no genéricos)
3. Ordena los lugares por CERCANÍA geográfica para minimizar desplazamientos
4. Si tienen coche, puedes incluir lugares a 20-40km; si no, máximo 3km entre lugares
5. Para comida y cena: da exactamente 3 restaurantes REALES con nombre específico:
   - 1 restaurante de precio alto (€€€): cocina elaborada, con carta extensa
   - 1 restaurante de precio medio (€€): buena relación calidad-precio
   - 1 restaurante de precio bajo (€): económico, tapas, menú del día
6. Las coordenadas lat/lng deben ser REALES y precisas del lugar exacto
7. transport_mode: "walking" si menos de 2km, "driving" si más de 2km

Responde ÚNICAMENTE con este JSON (sin texto antes ni después):
{
  "day": ${dayNumber},
  "zone": "Nombre específico del barrio/zona/pueblo del día",
  "total_km": 25,
  "total_time": "8h",
  "google_maps_url": "https://www.google.com/maps/dir/?api=1&origin=PrimerLugar,${destination},España&destination=UltimoLugar,${destination},España&waypoints=Lugar2|Lugar3&travelmode=walking",
  "plan": {
    "morning": [
      {
        "place": "Nombre real y específico del lugar",
        "description": "Qué se puede ver/hacer aquí exactamente (1-2 frases concretas)",
        "distance_km": 0,
        "time_estimated": "1h30m",
        "transport_mode": "walking",
        "coordinates": {"lat": 42.8805, "lng": -8.5457}
      },
      {
        "place": "Nombre real segundo lugar mañana",
        "description": "Qué se puede ver/hacer aquí exactamente",
        "distance_km": 0.8,
        "time_estimated": "1h0m",
        "transport_mode": "walking",
        "coordinates": {"lat": 42.8810, "lng": -8.5460}
      }
    ],
    "lunch": {
      "area": "Nombre real de la calle, plaza o barrio para comer",
      "suggestion": "Plato típico concreto de la zona que deben probar",
      "time_estimated": "1h30m",
      "transport_mode": "walking",
      "coordinates": {"lat": 42.8800, "lng": -8.5450},
      "restaurants": [
        {"name": "Nombre real restaurante caro", "price_range": "alto", "coordinates": {"lat": 42.8800, "lng": -8.5450}},
        {"name": "Nombre real restaurante medio", "price_range": "medio", "coordinates": {"lat": 42.8801, "lng": -8.5451}},
        {"name": "Nombre real restaurante barato", "price_range": "bajo", "coordinates": {"lat": 42.8802, "lng": -8.5452}}
      ]
    },
    "afternoon": [
      {
        "place": "Nombre real primer lugar tarde",
        "description": "Qué se puede ver/hacer exactamente",
        "distance_km": 1.5,
        "time_estimated": "2h0m",
        "transport_mode": "walking",
        "coordinates": {"lat": 42.8815, "lng": -8.5465}
      },
      {
        "place": "Nombre real segundo lugar tarde",
        "description": "Qué se puede ver/hacer exactamente",
        "distance_km": 0.5,
        "time_estimated": "1h0m",
        "transport_mode": "walking",
        "coordinates": {"lat": 42.8820, "lng": -8.5470}
      }
    ],
    "evening": [
      {
        "place": "Nombre real zona para cenar/ambiente nocturno",
        "description": "Qué hacer por la noche aquí exactamente",
        "distance_km": 1.0,
        "time_estimated": "2h30m",
        "transport_mode": "walking",
        "coordinates": {"lat": 42.8825, "lng": -8.5475},
        "restaurants": [
          {"name": "Nombre real restaurante cena caro", "price_range": "alto", "coordinates": {"lat": 42.8825, "lng": -8.5475}},
          {"name": "Nombre real restaurante cena medio", "price_range": "medio", "coordinates": {"lat": 42.8826, "lng": -8.5476}},
          {"name": "Nombre real restaurante cena barato", "price_range": "bajo", "coordinates": {"lat": 42.8827, "lng": -8.5477}}
        ]
      }
    ]
  }
}`
}

// ─── Call Gemini ──────────────────────────────────────────────────────────────
async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY no configurada')

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 4096,
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

  const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
  return JSON.parse(clean)
}

// ─── Generate all days sequentially ──────────────────────────────────────────
async function generateAllDays(destination, days, hasCar, intensity, preferences, startingAddress) {
  const daysNum = parseInt(days)
  const generatedDays = []
  const usedPlaces = []
  const usedZones = []
  let totalKm = 0

  for (let dayNumber = 1; dayNumber <= daysNum; dayNumber++) {
    const prompt = buildDayPrompt({
      destination,
      dayNumber,
      totalDays: daysNum,
      hasCar,
      intensity,
      preferences,
      startingAddress,
      usedPlaces: [...usedPlaces],
      usedZones: [...usedZones],
    })

    const dayData = await callGemini(prompt)

    // Track used places and zones to avoid repetition next day
    if (dayData.zone) usedZones.push(dayData.zone)
    const plan = dayData.plan || {}
    if (Array.isArray(plan.morning)) plan.morning.forEach(p => { if (p.place) usedPlaces.push(p.place) })
    if (Array.isArray(plan.afternoon)) plan.afternoon.forEach(p => { if (p.place) usedPlaces.push(p.place) })
    if (Array.isArray(plan.evening)) plan.evening.forEach(p => { if (p.place) usedPlaces.push(p.place) })

    totalKm += dayData.total_km || 0
    generatedDays.push(dayData)
  }

  return {
    destination,
    total_km: totalKm,
    total_time: `${daysNum * 8}h`,
    days: generatedDays,
  }
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

    if (process.env.GEMINI_API_KEY) {
      try {
        console.log(`[Gemini] ${finalDestination} · ${days} días · ${intensity} — generando día a día`)
        const itinerary = await generateAllDays(
          finalDestination, days, hasCar, intensity,
          preferences || {}, starting_address || ''
        )
        return NextResponse.json(itinerary)
      } catch (err) {
        console.error('[Gemini] Error:', err.message)
        return NextResponse.json({
          ...getMockForCity(finalDestination, days, intensity),
          _note: 'Error generando con IA, mostrando datos de ejemplo',
        })
      }
    }

    return NextResponse.json({
      ...getMockForCity(finalDestination, days, intensity),
      _note: 'Modo demo — configura GEMINI_API_KEY para itinerarios reales',
    })

  } catch (error) {
    console.error('[API] Error interno:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

export async function PUT() { return NextResponse.json({ error: 'Método no permitido' }, { status: 405 }) }
export async function DELETE() { return NextResponse.json({ error: 'Método no permitido' }, { status: 405 }) }
