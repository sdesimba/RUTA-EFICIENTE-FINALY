# Ruta Eficiente 🗺️

Generador de escapadas optimizadas en España de 2 a 5 días para viajes en coche, **con itinerarios detallados generados por IA (OpenAI GPT-5.2)**.

## 🎯 Características

- **Formulario intuitivo** con ciudad base, número de días (2-5), transporte en coche y nivel de intensidad
- **Generación con IA (OpenAI GPT-5.2)**: Itinerarios personalizados con lugares específicos y optimización geográfica
- **Lugares concretos con nombres propios**: Monumentos, restaurantes, miradores específicos
- **Optimización por zonas**: Agrupa actividades cercanas para evitar desplazamientos innecesarios
- **Descripciones motivadoras**: Cada lugar incluye una breve explicación de por qué merece la pena visitarlo
- **Cálculo real de kilómetros** por día y totales
- **Diseño minimalista** y profesional con shadcn/ui + Tailwind CSS
- **Preparado para escalar** con arquitectura modular y limpia

## 🚀 Tecnologías

- **Next.js 14** (App Router)
- **React 18**
- **OpenAI GPT-5.2** (para generación de itinerarios)
- **Python** (emergentintegrations para integración con OpenAI)
- **Tailwind CSS**
- **shadcn/ui** (componentes UI)
- **Lucide React** (iconos)

## 📁 Estructura del Proyecto

```
/app
├── app/
│   ├── page.js              # Página principal con formulario y resultados
│   ├── layout.js            # Layout de la aplicación
│   ├── globals.css          # Estilos globales
│   └── api/
│       └── [[...path]]/
│           └── route.js     # API endpoint que llama al script Python
├── lib/
│   └── generate_itinerary.py  # Script Python con OpenAI GPT-5.2
├── components/ui/           # Componentes shadcn/ui
├── .env                     # Variables de entorno (EMERGENT_LLM_KEY)
└── package.json
```

## 🎨 Funcionalidades Implementadas

### Formulario
- **Ciudad base**: Input de texto para ingresar la ciudad de partida
- **Número de días**: Selector de 2 a 5 días
- **Viaja en coche**: Radio buttons (Sí/No)
- **Nivel de intensidad**: 
  - Relax - Ritmo tranquilo (3-4 actividades/día)
  - Equilibrado - Mix perfecto (4-5 actividades/día)
  - A tope - Máxima actividad (hasta 6 actividades/día)

### Generación con IA (OpenAI GPT-5.2)

El sistema utiliza **GPT-5.2** con un prompt especializado que garantiza:

- ✅ **Optimización geográfica por zonas** para minimizar desplazamientos
- ✅ **Lugares específicos con nombres propios** (no descripciones genéricas)
- ✅ **Explicación breve** de por qué merece la pena cada lugar
- ✅ **Cálculo de kilómetros aproximados** por día (basado en distancias reales)
- ✅ **Mínimo 2 lugares culturales, 1 experiencia gastronómica y 1 lugar natural** (cuando sea viable)
- ✅ **Agrupación inteligente** de actividades cercanas el mismo día
- ✅ **Respeta el nivel de intensidad** seleccionado por el usuario

### Visualización de Resultados

- **Resumen general**: Ciudad, días totales, kilómetros totales
- **Zona geográfica por día**: Indica el área o barrio que se visitará
- **Botón Google Maps**: Preparado para integrar con Google Maps
- **Tarjetas detalladas por día** con:
  - **Mañana**: Lista de lugares con descripciones
  - **Zona de comida**: Área recomendada y sugerencias gastronómicas específicas
  - **Tarde**: Lista de lugares con descripciones
  - **Noche**: Actividades vespertinas y opciones de cena
  - **Kilómetros del día**

## 🛠️ Formato de Respuesta API

```json
{
  "city": "Toledo",
  "total_km": 180,
  "days": [
    {
      "day": 1,
      "zone": "Casco Histórico de Toledo (intra-muros)",
      "total_km": 5,
      "plan": {
        "morning": [
          {
            "place": "Catedral Primada de Toledo",
            "description": "Es una de las catedrales góticas más impresionantes de España por su arquitectura y tesoros artísticos."
          },
          {
            "place": "Iglesia de Santo Tomé (El entierro del Conde de Orgaz)",
            "description": "Alberga la obra maestra de El Greco en su emplazamiento original."
          }
        ],
        "lunch": {
          "area": "Plaza de la Magdalena / Calle Tornerías",
          "suggestion": "La Abadía Cervecería Artesana (prueba carcamusas toledanas y una cerveza artesanal)"
        },
        "afternoon": [
          {
            "place": "Sinagoga de Santa María la Blanca",
            "description": "Es un ejemplo único del legado sefardí-mudéjar por sus arcos blancos y sobriedad monumental."
          }
        ],
        "evening": [
          {
            "place": "Mirador del Valle",
            "description": "Ofrece la panorámica más icónica del perfil de Toledo al atardecer."
          }
        ]
      }
    }
  ]
}
```

## 🔑 Configuración de OpenAI

La aplicación utiliza la **clave universal de Emergent** para acceder a OpenAI GPT-5.2:

```env
EMERGENT_LLM_KEY=sk-emergent-52a53C0A018D1F18a3
```

Esta clave permite usar los modelos más avanzados de OpenAI sin necesidad de gestionar tu propia API key. Los créditos se descuentan de tu balance en Emergent.

## 🎯 Próximos Pasos (Escalabilidad)

- [ ] Conectar con Google Maps API para rutas reales y navegación
- [ ] Añadir sistema de usuarios y favoritos
- [ ] Integrar base de datos MongoDB para guardar itinerarios
- [ ] Sistema de recomendaciones basado en preferencias del usuario
- [ ] Compartir itinerarios por enlace
- [ ] Exportar a PDF con mapa incluido
- [ ] Añadir fotos de los lugares (integración con APIs de imágenes)
- [ ] Sistema de valoraciones y comentarios

## 💻 Desarrollo

```bash
# Instalar dependencias
yarn install

# Instalar dependencias de Python
pip install emergentintegrations python-dotenv --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/

# Iniciar servidor de desarrollo
yarn dev

# Acceder a la aplicación
http://localhost:3000
```

## 📝 Variables de Entorno

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=your_database_name
NEXT_PUBLIC_BASE_URL=https://your-app-url.com
CORS_ORIGINS=*
EMERGENT_LLM_KEY=sk-emergent-52a53C0A018D1F18a3
```

## 🎨 Diseño

La aplicación utiliza un sistema de diseño minimalista y profesional:

- **Colores**: Azul primary (#2563EB) con gradientes sutiles
- **Bordes de colores** por sección: Azul (mañana), Ámbar (comida), Verde (tarde), Púrpura (noche)
- **Tipografía**: Sistema sans-serif con antialiasing
- **Componentes**: shadcn/ui para consistencia y accesibilidad
- **Responsive**: Diseño adaptable a mobile, tablet y desktop
- **Iconos**: Lucide React para iconografía clara

## 🧠 Cómo Funciona la Integración con IA

1. **Usuario completa el formulario** en el frontend
2. **Next.js API** recibe la petición en `/api/generate`
3. **Se ejecuta el script Python** (`lib/generate_itinerary.py`) con los parámetros
4. **Python se comunica con OpenAI GPT-5.2** mediante `emergentintegrations`
5. **OpenAI genera un itinerario detallado** siguiendo las reglas específicas del prompt
6. **El JSON estructurado** se devuelve al frontend
7. **React renderiza los lugares específicos** con descripciones y organización por zonas

## 📄 Licencia

Este proyecto es un MVP para generar escapadas optimizadas en España con IA.
