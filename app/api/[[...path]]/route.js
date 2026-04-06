import { NextResponse } from 'next/server'

/**
 * PROMPT OPTIMIZADO
 */
function buildPrompt(destination, days, hasCar, intensity, preferences) {
  const car = hasCar === 'si' ? 'con coche' : 'sin coche'

  return `
Devuelve un itinerario de viaje en JSON válido.

Destino: ${destination}
Días: ${days}
${car}
Intensidad: ${intensity}

Reglas:
- Usa lugares reales
- No inventes coordenadas
- Máximo 4 lugares por día
- Cada día en una zona distinta

Formato:

{
  "destination": "${destination}",
  "days": [
    {
      "day": 1,
      "zone": "zona real",
      "places": [
        { "name": "lugar real", "type": "turismo" }
      ],
      "food_area": "zona para comer"
    }
  ]
}

No añadas texto fuera del JSON.
`
}

/**
 * LLAMADA A GROQ (ROBUSTA)
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
      model: 'llama-3.1-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Devuelve SOLO un JSON válido. Sin texto adicional.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 2000,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq error: ${err}`)
  }

  const data = await res.json()
  let text = data?.choices?.[0]?.message?.content

  if (!text) throw new Error('Sin respuesta de IA')

  // 🔥 LIMPIEZA PRO
  text = text.trim()

  // quitar markdown
  text = text.replace(/```json/gi, '').replace(/```/g, '').trim()

  // 🔥 EXTRAER SOLO EL JSON (CLAVE)
  const firstBrace = text.indexOf('{')
  const lastBrace = text.lastIndexOf('}')

  if (firstBrace === -1 || lastBrace === -1) {
    console.error('Respuesta IA rara:', text)
    throw new Error('No se encontró JSON válido')
  }

  const jsonString = text.substring(firstBrace, lastBrace + 1)

  try {
    return JSON.parse(jsonString)
  } catch (e) {
    console.error('JSON limpio falló:', jsonString)
    throw new Error('JSON inválido tras limpieza')
  }
}

/**
 * ENRIQUECIMIENTO (TU LÓGICA)
 */
function enrichItinerary(data) {
  if (!data.days || !Array.isArray(data.days)) {
    throw new Error('Estructura IA incorrecta')
  }

  return {
    ...data,
    days: data.days.map((day) => ({
      ...day,
      total_time: '6-8h',
      plan: {
        morning: day.places.slice(0, 2),
        afternoon: day.places.slice(2),
        lunch: {
          area: day.food_area,
          suggestion: 'Comida local típica'
        }
      }
    }))
  }
}

/**
 * GET
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    ai: process.env.GROQ_API_KEY ? 'activa' : 'no configurada'
  })
}

/**
 * POST
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
        error: 'Configura GROQ_API_KEY'
      }, { status: 500 })
    }

    console.log(`[IA] Generando viaje a ${destination}`)

    // 1. IA genera estructura
    const prompt = buildPrompt(destination, days, hasCar, intensity, preferences || {})
    const rawData = await callGroq(prompt)

    // 2. TU BACKEND ORGANIZA
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

export async function PUT() {
  return NextResponse.json({ error: 'No permitido' }, { status: 405 })
}

export async function DELETE() {
  return NextResponse.json({ error: 'No permitido' }, { status: 405 })
}