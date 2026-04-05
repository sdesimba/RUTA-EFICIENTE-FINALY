import { NextResponse } from 'next/server'

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
          { place: `Monumento principal día ${i+1}`, description: 'Configura GROQ_API_KEY para obtener lugares reales', distance_km: 0, time_estimated: '2h', transport_mode: 'walking', coordinates: { lat: 40.0, lng: -3.5 } },
        ],
        lunch: {
          area: `Zona restaurantes`, suggestion: 'Gastronomía local', time_estimated: '1h30m', transport_mode: 'walking', coordinates: { lat: 40.01, lng: -3.51 },
          restaurants: [
            { name: 'Restaurante caro', price_range: 'alto', coordinates: { lat: 40.01, lng: -3.51 } },
            { name: 'Restaurante medio', price_range: 'medio', coordinates: { lat: 40.011, lng: -3.511 } },
            { name: 'Restaurante barato', price_range: 'bajo', coordinates: { lat: 40.012, lng: -3.512 } }
          ]
        },
        afternoon: [
          { place: `Lugar tarde día ${i+1}`, description: 'Configura GROQ_API_KEY para obtener lugares reales', distance_km: 1.0, time_estimated: '2h', transport_mode: 'walking', coordinates: { lat: 40.02, lng: -3.52 } }
        ],
        evening: [
          { place: `Zona nocturna`, description: 'Ambiente local', distance_km: 0.8, time_estimated: '2h', transport_mode: 'walking', coordinates: { lat: 40.03, lng: -3.53 },
            restaurants: [
              { name: 'Cena cara', price_range: 'alto', coordinates: { lat: 40.03, lng: -3.53 } },
              { name: 'Cena media', price_range: 'medio', coordinates: { lat: 40.031, lng: -3.531 } },
              { name: 'Cena barata', price_range: 'bajo', coordinates: { lat: 40.032, lng: -3.532 } }
            ]
          }
        ]
      }
    }))
  }
}

function buildPrompt(destination, days, hasCar, intensity, preferences, startingAddress) {
  const car = hasCar === 'si' ? 'con coche' : 'sin coche'
  const priority = { natural: 'naturaleza', gastronomica: 'gastronomia', cultural: 'cultura' }[preferences?.priority] || 'cultura'
  const filters = []
  if (preferences?.with_dogs) filters.push('pet-friendly')
  if (preferences?.with_children) filters.push('apto ninos')
  if (preferences?.with_elderly) filters.push('accesible mayores')
  if (preferences?.with_couple) filters.push('romantico pareja')
  if (preferences?.with_friends) filters.push('grupo amigos')
  const filterText = filters.length ? ` Requisitos: ${filters.join(', ')}.` : ''
  const startText = startingAddress ? ` Inicio: ${startingAddress}.` : ''

  return `Planifica ${days} dias en ${destination}, ${car}, intensidad ${intensity}, prioridad ${priority}.${startText}${filterText}

REGLAS:
- Cada dia en zona/barrio DIFERENTE, nunca repetir lugares
- Lugares turisticos REALES con nombres exactos
- Ordenar por cercania geografica
- 3 restaurantes reales por comida y cena (alto/medio/bajo precio)
- coordinates reales y precisas
- transport_mode: walking<2km, driving>2km

Responde SOLO con este JSON (sin texto extra):
{"destination":"${destination}","total_km":0,"total_time":"0h","days":[{"day":1,"zone":"zona dia 1","total_km":0,"total_time":"8h","google_maps_url":"https://www.google.com/maps/dir/?api=1&origin=Lugar1,${destination}&destination=UltimoLugar,${destination}&travelmode=walking","plan":{"morning":[{"place":"nombre lugar real","description":"que ver aqui","distance_km":0,"time_estimated":"1h30m","transport_mode":"walking","coordinates":{"lat":0.0,"lng":0.0}},{"place":"nombre lugar real 2","description":"que ver aqui","distance_km":0.5,"time_estimated":"1h","transport_mode":"walking","coordinates":{"lat":0.0,"lng":0.0}}],"lunch":{"area":"zona real comer","suggestion":"plato tipico","time_estimated":"1h30m","transport_mode":"walking","coordinates":{"lat":0.0,"lng":0.0},"restaurants":[{"name":"restaurante real caro","price_range":"alto","coordinates":{"lat":0.0,"lng":0.0}},{"name":"restaurante real medio","price_range":"medio","coordinates":{"lat":0.0,"lng":0.0}},{"name":"restaurante real barato","price_range":"bajo","coordinates":{"lat":0.0,"lng":0.0}}]},"afternoon":[{"place":"lugar real tarde","description":"que ver","distance_km":1.0,"time_estimated":"2h","transport_mode":"walking","coordinates":{"lat":0.0,"lng":0.0}},{"place":"lugar real tarde 2","description":"que ver","distance_km":0.5,"time_estimated":"1h","transport_mode":"walking","coordinates":{"lat":0.0,"lng":0.0}}],"evening":[{"place":"zona nocturna real","description":"que hacer noche","distance_km":0.5,"time_estimated":"2h","transport_mode":"walking","coordinates":{"lat":0.0,"lng":0.0},"restaurants":[{"name":"cena real cara","price_range":"alto","coordinates":{"lat":0.0,"lng":0.0}},{"name":"cena real media","price_range":"medio","coordinates":{"lat":0.0,"lng":0.0}},{"name":"cena real barata","price_range":"bajo","coordinates":{"lat":0.0,"lng":0.0}}]}]}}]}`
}

async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY no configurada')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: 'Eres un experto en turismo por Espana. Respondes UNICAMENTE con JSON valido y completo, sin texto adicional.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 6000,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Groq error ${res.status}: ${err?.error?.message || 'Error'}`)
  }

  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content
  if (!text) throw new Error('Groq no devolvio contenido')
  const clean = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim()
  return JSON.parse(clean)
}

export async function GET() {
  return NextResponse.json({
    message: 'RutaEficiente API',
    groq: process.env.GROQ_API_KEY ? 'configurada ✓' : 'no configurada (modo demo)',
    status: 'ok',
  })
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { destination, city, days, hasCar, intensity, preferences, starting_address } = body
    const finalDestination = (destination || city || '').trim()

    if (!finalDestination || !days) {
      return NextResponse.json({ error: 'Faltan destination y days' }, { status: 400 })
    }
    const daysNum = parseInt(days)
    if (isNaN(daysNum) || daysNum < 2 || daysNum > 5) {
      return NextResponse.json({ error: 'Dias debe ser entre 2 y 5' }, { status: 400 })
    }

    if (process.env.GROQ_API_KEY) {
      try {
        console.log(`[Groq] ${finalDestination} ${days} dias`)
        const prompt = buildPrompt(finalDestination, days, hasCar, intensity, preferences || {}, starting_address || '')
        const itinerary = await callGroq(prompt)
        return NextResponse.json(itinerary)
      } catch (err) {
        console.error('[Groq] Error:', err.message)
        return NextResponse.json({
          ...getMockForCity(finalDestination, days, intensity),
          _note: `Error: ${err.message}`,
        })
      }
    }

    return NextResponse.json({
      ...getMockForCity(finalDestination, days, intensity),
      _note: 'Modo demo - configura GROQ_API_KEY',
    })

  } catch (error) {
    console.error('[API] Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT() { return NextResponse.json({ error: 'No permitido' }, { status: 405 }) }
export async function DELETE() { return NextResponse.json({ error: 'No permitido' }, { status: 405 }) }
