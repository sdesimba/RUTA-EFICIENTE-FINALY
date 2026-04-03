import { NextResponse } from 'next/server'

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
          { place: `Catedral de ${destination}`, description: 'Patrimonio histórico y arquitectónico local', distance_km: 0.5, time_estimated: '1h0m', transport_mode: 'walking', coordinates: { lat: 40.005, lng: -3.505 } }
        ],
        lunch: {
          area: `Zona de tapas de ${destination}`,
          suggestion: 'Gastronomía local con productos de temporada',
          time_estimated: '1h30m', transport_mode: 'walking', coordinates: { lat: 40.01, lng: -3.51 },
          restaurants: [
            { name: `Restaurante tradicional`, price_range: 'alto', coordinates: { lat: 40.01, lng: -3.51 } },
            { name: `Mesón local`, price_range: 'medio', coordinates: { lat: 40.011, lng: -3.511 } },
            { name: `Bar de tapas`, price_range: 'bajo', coordinates: { lat: 40.012, lng: -3.512 } }
          ]
        },
        afternoon: [
          { place: `Museo de ${destination}`, description: 'Arte y cultura local', distance_km: 1.0, time_estimated: '2h0m', transport_mode: 'walking', coordinates: { lat: 40.02, lng: -3.52 } }
        ],
        evening: [
          { place: `Zona nocturna de ${destination}`, description: 'Ambiente local y gastronomía nocturna', distance_km: 0.8, time_estimated: '2h0m', transport_mode: 'walking', coordinates: { lat: 40.03, lng: -3.53 },
            restaurants: [
              { name: `Restaurante de noche`, price_range: 'alto', coordinates: { lat: 40.03, lng: -3.53 } },
              { name: `Taberna local`, price_range: 'medio', coordinates: { lat: 40.031, lng: -3.531 } },
              { name: `Bar económico`, price_range: 'bajo', coordinates: { lat: 40.032, lng: -3.532 } }
            ]
          }
        ]
      }
    }))
  }
}

function buildPrompt(destination, days, hasCar, intensity, preferences, startingAddress) {
  const carText = hasCar === 'si' ? 'sí' : 'no'
  const strictFilters = []
  if (preferences.with_dogs) strictFilters.push('SOLO lugares dog-friendly')
  if (preferences.with_children) strictFilters.push('SOLO actividades seguras para niños')
  if (preferences.with_elderly) strictFilters.push('SOLO lugares accesibles, ritmo tranquilo')
  if (preferences.with_couple) strictFilters.push('SOLO planes románticos')
  if (preferences.with_friends) strictFilters.push('SOLO planes en grupo')
  const priorityMap = {
    natural: 'NATURAL: 70% naturaleza',
    gastronomica: 'GASTRONÓMICA: 70% gastronomía',
    cultural: 'CULTURAL: 70% patrimonio',
  }
  const priorityText = priorityMap[preferences.priority] || priorityMap.cultural
  const startText = startingAddress ? `\n- Punto de partida: ${startingAddress}` : ''
  const filtersText = strictFilters.length ? '\nREQUISITOS:\n' + strictFilters.map(f => `- ${f}`).join('\n') : ''
  const dayCount = parseInt(days)
  const dayHints = Array.from({ length: dayCount }, (_, i) => `- Dia ${i + 1}: zona DIFERENTE a los demas dias`).join('\n')

  return `Eres un experto en turismo por Espana con conocimiento profundo de todas sus regiones.

Genera un itinerario de ${days} dias para: ${destination}${startText}
Coche: ${carText} | Intensidad: ${intensity} | Prioridad ${priorityText}${filtersText}

REGLA CRITICA: CADA DIA DEBE SER COMPLETAMENTE DIFERENTE.
- NUNCA repitas el mismo lugar, zona o monumento en distintos dias
- Cada dia tiene su propia zone (barrio, pueblo o comarca distinta)
- Si es una region: usa pueblos o zonas distintas cada dia
- Ejemplo Galicia: Dia 1 Santiago de Compostela, Dia 2 Rias Baixas, Dia 3 Costa da Morte
- Ejemplo Madrid: Dia 1 Centro, Dia 2 Toledo excursion, Dia 3 Retiro y Salamanca

Zonas obligatorias distintas:
${dayHints}

REGLAS TECNICAS:
- transport_mode: walking menos de 2km, driving mas de 2km
- Nombres REALES de lugares y restaurantes
- price_range: exactamente alto, medio o bajo
- coordinates: lat y lng reales y precisas
- Minimo 2 lugares manana, 2 tarde, restaurantes en comida y cena
- total_km y total_time realistas

Devuelve UNICAMENTE JSON con ${days} dias, sin texto antes ni despues:

{"destination":"${destination}","total_km":0,"total_time":"0h","days":[{"day":1,"zone":"Nombre zona dia 1","total_km":0,"total_time":"8h","google_maps_url":"https://www.google.com/maps/dir/?api=1&origin=Lugar1,${destination}&destination=UltimoLugar,${destination}&travelmode=walking","plan":{"morning":[{"place":"Nombre real lugar","description":"Por que merece la pena","distance_km":0,"time_estimated":"1h30m","transport_mode":"walking","coordinates":{"lat":40.4168,"lng":-3.7038}}],"lunch":{"area":"Zona real para comer","suggestion":"Plato tipico","time_estimated":"1h30m","transport_mode":"walking","coordinates":{"lat":40.4168,"lng":-3.7038},"restaurants":[{"name":"Restaurante real 1","price_range":"alto","coordinates":{"lat":40.4168,"lng":-3.7038}},{"name":"Restaurante real 2","price_range":"medio","coordinates":{"lat":40.4169,"lng":-3.7039}},{"name":"Restaurante real 3","price_range":"bajo","coordinates":{"lat":40.417,"lng":-3.704}}]},"afternoon":[{"place":"Nombre real lugar tarde","description":"Por que merece la pena","distance_km":1.2,"time_estimated":"2h0m","transport_mode":"walking","coordinates":{"lat":40.418,"lng":-3.705}}],"evening":[{"place":"Zona nocturna real","description":"Ambiente de noche","distance_km":0.5,"time_estimated":"2h0m","transport_mode":"walking","coordinates":{"lat":40.419,"lng":-3.706},"restaurants":[{"name":"Cena real 1","price_range":"alto","coordinates":{"lat":40.419,"lng":-3.706}},{"name":"Cena real 2","price_range":"medio","coordinates":{"lat":40.4191,"lng":-3.7061}},{"name":"Cena real 3","price_range":"bajo","coordinates":{"lat":40.4192,"lng":-3.7062}}]}]}}]}`
}

async function callGemini(prompt) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY no configurada')
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192, responseMimeType: 'application/json' },
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Gemini error ${res.status}: ${err?.error?.message || 'Error desconocido'}`)
  }
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini no devolvio contenido')
  const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
  return JSON.parse(clean)
}

export async function GET() {
  return NextResponse.json({
    message: 'RutaEficiente API',
    gemini: process.env.GEMINI_API_KEY ? 'configurada' : 'no configurada',
    status: 'ok',
  })
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { destination, city, days, hasCar, intensity, preferences, starting_address } = body
    const finalDestination = (destination || city || '').trim()
    if (!finalDestination || !days) {
      return NextResponse.json({ error: 'Faltan campos: destination y days' }, { status: 400 })
    }
    const daysNum = parseInt(days)
    if (isNaN(daysNum) || daysNum < 2 || daysNum > 5) {
      return NextResponse.json({ error: 'Dias debe ser entre 2 y 5' }, { status: 400 })
    }
    if (process.env.GEMINI_API_KEY) {
      try {
        const prompt = buildPrompt(finalDestination, days, hasCar, intensity, preferences || {}, starting_address || '')
        const itinerary = await callGemini(prompt)
        return NextResponse.json(itinerary)
      } catch (err) {
        console.error('[Gemini] Error:', err.message)
        return NextResponse.json({ ...getMockForCity(finalDestination, days, intensity), _note: 'Fallback' })
      }
    }
    return NextResponse.json({ ...getMockForCity(finalDestination, days, intensity), _note: 'Modo demo' })
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT() { return NextResponse.json({ error: 'No permitido' }, { status: 405 }) }
export async function DELETE() { return NextResponse.json({ error: 'No permitido' }, { status: 405 }) }