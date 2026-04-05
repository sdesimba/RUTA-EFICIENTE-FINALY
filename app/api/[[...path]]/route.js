import { NextResponse } from 'next/server'

/**
 * PROMPT OPTIMIZADO (IA SOLO PROPONE LUGARES)
 */
function buildPrompt(destination, days, hasCar, intensity, preferences) {
  const car = hasCar === 'si' ? 'con coche' : 'sin coche'
  const priority = preferences?.priority || 'cultura'

  return `
Planifica un viaje de ${days} dias en ${destination}, ${car}, intensidad ${intensity}, prioridad ${priority}.

REGLAS IMPORTANTES:
- NO inventes coordenadas
- SOLO devuelve nombres de lugares reales
- NO incluyas rutas ni distancias
- Agrupa por zonas (cada dia en una zona distinta)
- Maximo 3-4 lugares por dia
- Incluye zona recomendada para comer

Formato JSON obligatorio:

{
  "destination": "${destination}",
  "days": [
    {
      "day": 1,
      "zone": "nombre zona real",
      "places": [
        { "name": "lugar real", "type": "turismo" },
        { "name": "lugar real", "type": "turismo" }
      ],
      "food_area": "zona recomendada para comer"
    }
  ]
}
`
}

/**
 * LLAMADA A GROQ
 */
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
      model: 'llama-3.1-70b-versatile', // 🔥 mejor que el 8b
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en viajes. Devuelves SOLO JSON valido.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq error: ${err}`)
  }

  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content

  if (!text) throw new Error('Sin respuesta de IA')

  try {
    return JSON.parse(text)
  } catch (e) {
    console.error('JSON inválido:', text)
    throw new Error('La IA devolvió JSON inválido')
  }
}

/**
 * ENRIQUECIMIENTO BÁSICO (TU LÓGICA)
 */
function enrichItinerary(data) {
  return {
    ...data,
    days: data.days.map((day, i) => ({
      ...day,
      total_time: '6-8h',
      plan: {
        morning: day.places.slice(0, 2),
        afternoon: day.places.slice(2),
        lunch: {
          area: day.food_area,
          suggestion: 'Comida local',
        }
      }
    }))
  }
}

/**
 * API GET
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    ai: process.env.GROQ_API_KEY ? 'activa' : 'no configurada'
  })
}

/**
 * API POST
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { destination, days, hasCar, intensity, preferences } = body

    if (!destination || !days) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({
        error: 'Configura GROQ_API_KEY',
      }, { status: 500 })
    }

    // 1. IA genera estructura
    const prompt = buildPrompt(destination, days, hasCar, intensity, preferences || {})
    const rawData = await callGroq(prompt)

    // 2. TU SISTEMA ORGANIZA
    const itinerary = enrichItinerary(rawData)

    return NextResponse.json(itinerary)

  } catch (error) {
    console.error('[ERROR]', error.message)

    return NextResponse.json({
      error: 'Error generando itinerario',
      details: error.message
    }, { status: 500 })
  }
}