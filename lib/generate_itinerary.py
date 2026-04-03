#!/usr/bin/env python3
import asyncio
import json
import sys
import os

# Leer .env manualmente
def load_env_file(filepath):
    env_vars = {}
    try:
        with open(filepath, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
                    os.environ[key.strip()] = value.strip()
    except Exception as e:
        print(f"Warning: Could not load .env file: {e}", file=sys.stderr)
    return env_vars

# Cargar variables de entorno
load_env_file('/app/.env')

from emergentintegrations.llm.chat import LlmChat, UserMessage

async def generate_itinerary(destination, days, has_car, intensity, preferences=None, starting_address=None):
    """
    Genera un itinerario detallado usando OpenAI GPT-5.2
    Soporta ciudades grandes y pueblos pequeños
    """
    
    api_key = os.getenv('EMERGENT_LLM_KEY')
    if not api_key:
        raise Exception("EMERGENT_LLM_KEY no encontrada en variables de entorno")
    
    # Valores por defecto para preferencias
    if preferences is None:
        preferences = {
            'with_dogs': False,
            'with_children': False,
            'with_elderly': False,
            'priority': 'cultural'
        }
    
    # Construir texto de preferencias para el prompt
    preferences_text = []
    strict_filters = []
    
    if preferences.get('with_dogs'):
        strict_filters.append("SOLO playas dog-friendly, restaurantes pet-friendly, espacios abiertos para perros")
    if preferences.get('with_children'):
        strict_filters.append("SOLO actividades seguras para niños, cortas (30-45min), museos interactivos, parques")
    if preferences.get('with_elderly'):
        strict_filters.append("SOLO lugares accesibles, minimizar caminatas (máx 1-2km/día), ritmo muy relajado")
    if preferences.get('with_couple'):
        strict_filters.append("SOLO actividades románticas, tranquilas, miradores con vistas, cenas íntimas")
    if preferences.get('with_friends'):
        strict_filters.append("SOLO actividades dinámicas, sociales, bares, experiencias en grupo")
    
    priority = preferences.get('priority', 'cultural')
    if priority == 'natural':
        preferences_text.append("- Prioridad NATURAL: 70% lugares en naturaleza (parques nacionales, miradores, rutas senderismo, espacios al aire libre)")
    elif priority == 'gastronomica':
        preferences_text.append("- Prioridad GASTRONÓMICA: 70% experiencias culinarias (restaurantes destacados, mercados, bodegas, rutas de tapas)")
    else:
        preferences_text.append("- Prioridad CULTURAL: 70% museos, monumentos, patrimonio histórico")
    
    strict_requirements = "\n".join([f"⚠️ REQUISITO OBLIGATORIO: {f}" for f in strict_filters]) if strict_filters else ""
    preferences_prompt = "\n".join(preferences_text) if preferences_text else ""
    
    # System message con las instrucciones detalladas
    system_message = f"""Eres un experto en planificación de viajes por España con profundo conocimiento geográfico y cultural de TODAS las regiones, incluyendo ciudades grandes y pueblos pequeños.

Tu trabajo es generar itinerarios detallados y optimizados geográficamente para escapadas en España, incluyendo tiempos estimados realistas, modos de transporte, coordenadas GPS precisas y opciones de restaurantes.

REGLAS OBLIGATORIAS:

1. ADAPTACIÓN AL DESTINO:
   - Si es CIUDAD GRANDE (Madrid, Barcelona, Valencia, Sevilla, etc.): concentrar actividades dentro de la ciudad
   - Si es PUEBLO PEQUEÑO o zona rural: buscar actividades en la ZONA CERCANA (hasta 20-30 km de radio)
   - Para pueblos, incluir lugares turísticos, naturaleza y gastronomía de la comarca/provincia

2. El itinerario debe estar optimizado por zonas para evitar desplazamientos innecesarios
3. Agrupa actividades cercanas el mismo día
4. Incluye lugares concretos con nombre propio (no descripciones genéricas)
5. Indica brevemente por qué merece la pena cada lugar (máximo 1 frase)
6. Calcula kilómetros aproximados por día y POR ACTIVIDAD
7. Calcula tiempos estimados REALISTAS para cada actividad y tramo:
   - Tramos en coche: 50 km/h en ciudad, 80 km/h en carretera
   - Museos/catedrales grandes: 1h30-2h
   - Museos pequeños: 45min-1h
   - Paseos urbanos: 30-45min
   - Miradores/parques: 15-30min
   - Comida: 1h-1h30
8. Asigna modo de transporte RECOMENDADO para cada tramo
9. Incluye coordenadas GPS PRECISAS (lat, lng) para cada lugar específico
10. Para cada comida y cena, proporciona 3 SUGERENCIAS DE RESTAURANTES reales:
   - 1 de precio ALTO (alto)
   - 1 de precio MEDIO (medio)
   - 1 de precio BAJO (bajo)
   - DEBEN estar cerca (<500m para ciudades, <5km para pueblos) de la actividad anterior
   - Incluir nombre específico del restaurante y sus coordenadas GPS exactas
11. Genera URL de Google Maps para CADA DÍA con los lugares de ese día
12. Evita repetir zonas en distintos días
13. Si intensidad es "relax", máximo 3-4 actividades por día
14. Si intensidad es "equilibrado", 4-5 actividades por día
15. Si intensidad es "atope", hasta 6 actividades por día
16. Calcula tiempo TOTAL del día sumando todos los tiempos
17. Si el usuario proporciona dirección de hotel/inicio, úsala como punto de partida para el primer día

{strict_requirements if strict_requirements else ""}

{"PREFERENCIAS DEL VIAJERO:" if preferences_prompt else ""}
{preferences_prompt}

⚠️ IMPORTANTE: Si hay requisitos obligatorios arriba, SOLO incluir actividades que cumplan TODAS las condiciones simultáneamente.

Devuelve EXCLUSIVAMENTE un JSON válido sin texto adicional."""

    # Crear el chat con OpenAI
    chat = LlmChat(
        api_key=api_key,
        session_id=f"itinerary_{destination}_{days}",
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    
    # Construir el mensaje del usuario
    car_text = "sí" if has_car == "si" else "no"
    starting_point = f"\n- Punto de inicio: {starting_address}" if starting_address else ""
    user_prompt = f"""Genera un itinerario detallado y optimizado geográficamente para una escapada en España, con tiempos estimados realistas, modos de transporte recomendados y coordenadas GPS precisas.

Datos del usuario:
- Destino: {destination}{starting_point}
- Número de días: {days}
- Viaja en coche: {car_text}
- Intensidad: {intensity}

Devuelve exclusivamente en este formato JSON:

{{
  "travel_preferences": {{
    "with_dogs": {str(preferences.get('with_dogs', False)).lower()},
    "with_children": {str(preferences.get('with_children', False)).lower()},
    "with_elderly": {str(preferences.get('with_elderly', False)).lower()},
    "with_couple": {str(preferences.get('with_couple', False)).lower()},
    "with_friends": {str(preferences.get('with_friends', False)).lower()},
    "priority": "{priority}",
    "car_available": {str(has_car == 'si').lower()}
  }},
  "destination": "{destination}",
  "starting_address": "{starting_address if starting_address else ''}",
  "total_km": 0,
  "total_time": "0h0m",
  "days": [
    {{
      "day": 1,
      "zone": "Nombre de la zona/barrio/comarca",
      "total_km": 0,
      "total_time": "0h0m",
      "google_maps_url": "https://www.google.com/maps/dir/?api=1&origin=LUGAR1&destination=ULTIMO&waypoints=LUGAR2|LUGAR3&travelmode=walking",
      "plan": {{
        "morning": [
          {{
            "place": "Nombre específico del lugar",
            "description": "Por qué merece la pena (1 frase)",
            "distance_km": 0,
            "time_estimated": "0h0m",
            "transport_mode": "walking",
            "coordinates": {{"lat": 40.416775, "lng": -3.703790}}
          }}
        ],
        "lunch": {{
          "area": "Zona específica para comer",
          "suggestion": "Restaurante o tipo de comida concreta",
          "time_estimated": "1h0m",
          "transport_mode": "walking",
          "coordinates": {{"lat": 40.416775, "lng": -3.703790}},
          "restaurants": [
            {{
              "name": "Restaurante específico",
              "price_range": "alto",
              "coordinates": {{"lat": 40.416775, "lng": -3.703790}}
            }},
            {{
              "name": "Restaurante específico 2",
              "price_range": "medio",
              "coordinates": {{"lat": 40.416775, "lng": -3.703790}}
            }},
            {{
              "name": "Restaurante específico 3",
              "price_range": "bajo",
              "coordinates": {{"lat": 40.416775, "lng": -3.703790}}
            }}
          ]
        }},
        "afternoon": [
          {{
            "place": "Nombre específico del lugar",
            "description": "Por qué merece la pena (1 frase)",
            "distance_km": 0,
            "time_estimated": "0h0m",
            "transport_mode": "driving",
            "coordinates": {{"lat": 40.416775, "lng": -3.703790}}
          }}
        ],
        "evening": [
          {{
            "place": "Nombre específico del lugar",
            "description": "Por qué merece la pena (1 frase)",
            "distance_km": 0,
            "time_estimated": "0h0m",
            "transport_mode": "walking",
            "coordinates": {{"lat": 40.416775, "lng": -3.703790}},
            "restaurants": [
              {{
                "name": "Restaurante específico para cena",
                "price_range": "alto",
                "coordinates": {{"lat": 40.416775, "lng": -3.703790}}
              }},
              {{
                "name": "Restaurante específico para cena 2",
                "price_range": "medio",
                "coordinates": {{"lat": 40.416775, "lng": -3.703790}}
              }},
              {{
                "name": "Restaurante específico para cena 3",
                "price_range": "bajo",
                "coordinates": {{"lat": 40.416775, "lng": -3.703790}}
              }}
            ]
          }}
        ]
      }}
    }}
  ]
}}

IMPORTANTE: 
- Responde SOLO con el JSON, sin texto antes ni después
- Los tiempos deben ser realistas: "1h30m", "45m", "2h0m", etc.
- Suma TODOS los tiempos (actividades + desplazamientos) para obtener total_time del día
- Los desplazamientos en coche: 50km/h ciudad, 80km/h carretera
- transport_mode debe ser "walking" o "driving" según la distancia:
  * <1 km = "walking"
  * 1-5 km = "walking" (centro histórico) o "driving" (zona amplia)
  * >5 km = "driving"
- coordinates debe contener lat y lng PRECISAS de cada lugar específico (usa las coordenadas reales del lugar)
- google_maps_url debe incluir SOLO los lugares de ese día específico
- Formato URL: https://www.google.com/maps/dir/?api=1&origin=LUGAR1,{destination},España&destination=ULTIMO,{destination},España&waypoints=LUGAR2|LUGAR3&travelmode=walking (o driving si hay tramos largos)
- Los restaurantes deben ser nombres reales y específicos (no genéricos como "Restaurante del centro")
- price_range debe ser exactamente "alto", "medio" o "bajo" (en minúsculas)
- Los restaurantes de cena deben estar dentro del último objeto del array "evening", NO como campo separado "evening_restaurants"
- Para pueblos pequeños, busca actividades, restaurantes y lugares turísticos en un radio de 20-30 km si es necesario"""

    user_message = UserMessage(text=user_prompt)
    
    try:
        # Enviar mensaje y obtener respuesta
        response = await chat.send_message(user_message)
        
        # Limpiar la respuesta (eliminar posibles markdown code blocks)
        response = response.strip()
        if response.startswith('```json'):
            response = response[7:]
        if response.startswith('```'):
            response = response[3:]
        if response.endswith('```'):
            response = response[:-3]
        response = response.strip()
        
        # Parsear JSON
        itinerary = json.loads(response)
        
        return itinerary
        
    except json.JSONDecodeError as e:
        raise Exception(f"Error al parsear JSON de OpenAI: {str(e)}\nRespuesta: {response[:500]}")
    except Exception as e:
        raise Exception(f"Error al generar itinerario: {str(e)}")

async def main():
    """
    Función principal que lee argumentos y genera el itinerario
    """
    try:
        # Leer argumentos de stdin (JSON)
        input_data = sys.stdin.read()
        data = json.loads(input_data)
        
        # Soportar tanto 'city' (legacy) como 'destination' (nuevo)
        destination = data.get('destination') or data.get('city')
        days = data.get('days')
        has_car = data.get('hasCar', 'si')
        intensity = data.get('intensity', 'equilibrado')
        preferences = data.get('preferences', {})
        starting_address = data.get('starting_address', '')
        
        if not destination or not days:
            raise Exception("Faltan parámetros requeridos: destination/city y days")
        
        # Generar itinerario con preferencias y dirección de inicio
        itinerary = await generate_itinerary(destination, days, has_car, intensity, preferences, starting_address)
        
        # Devolver resultado como JSON
        print(json.dumps(itinerary, ensure_ascii=False))
        
    except Exception as e:
        error_response = {
            "error": str(e),
            "type": "generation_error"
        }
        print(json.dumps(error_response, ensure_ascii=False))
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
