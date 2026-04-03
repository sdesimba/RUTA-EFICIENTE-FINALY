# 🚀 Guía para subir RutaEficiente a internet (Vercel)

## Resultado final
Tendrás una web real en una URL tipo `https://ruta-eficiente.vercel.app` (o con tu dominio propio).
Coste: **gratis** para este tipo de proyecto.

---

## Paso 1 — Consigue tu API key de Gemini (gratis, 2 min)

1. Ve a **https://aistudio.google.com/app/apikey**
2. Inicia sesión con tu cuenta de Google
3. Click en **"Create API key"**
4. Copia la key (empieza por `AIza...`)

> Sin esta key la web funciona en modo demo con itinerarios de ejemplo.

---

## Paso 2 — Sube el código a GitHub

Si no tienes Git instalado: https://git-scm.com/downloads

```bash
# Dentro de la carpeta ruta-inteligente-v3
git init
git add .
git commit -m "RutaEficiente v3 — primer commit"
```

Luego en **https://github.com**:
1. Click en el **+** arriba a la derecha → "New repository"
2. Nombre: `ruta-eficiente` (o el que quieras)
3. Déjalo en "Public" o "Private" (ambos funcionan)
4. **No** marques "Add README" ni nada más → "Create repository"
5. GitHub te mostrará unos comandos. Ejecuta los que dicen "...or push an existing repository":

```bash
git remote add origin https://github.com/TU_USUARIO/ruta-eficiente.git
git branch -M main
git push -u origin main
```

---

## Paso 3 — Despliega en Vercel

1. Ve a **https://vercel.com** y haz click en "Sign up"
2. Elige **"Continue with GitHub"** (lo más fácil)
3. Una vez dentro, click en **"Add New Project"**
4. Vercel te lista tus repos de GitHub → selecciona `ruta-eficiente`
5. Vercel detecta Next.js automáticamente. No cambies nada.

### ⚠️ Antes de hacer click en Deploy — añade la API key:

En la misma pantalla, busca el apartado **"Environment Variables"** y añade:

| Name | Value |
|------|-------|
| `GEMINI_API_KEY` | `AIza...tu-key-aqui` |

6. Click en **"Deploy"**
7. Espera ~2 minutos. Vercel construye y despliega automáticamente.

✅ Ya tienes tu web en vivo en `https://ruta-eficiente-XXXX.vercel.app`

---

## Paso 4 — (Opcional) Dominio propio

Si tienes o quieres comprar un dominio (ej: `rutaeficiente.es`):

1. En el dashboard de tu proyecto en Vercel → **"Domains"**
2. Escribe tu dominio → "Add"
3. Vercel te da instrucciones para apuntar los DNS (en Namecheap, GoDaddy, etc.)
4. En ~30 min el dominio apunta a tu web con HTTPS automático

Dominios `.es` cuestan ~8€/año en sitios como Namecheap o Dondominio.

---

## Actualizaciones futuras

Cada vez que hagas cambios en el código y hagas push a GitHub, Vercel redespliega automáticamente:

```bash
git add .
git commit -m "descripción del cambio"
git push
```

---

## Para la APK móvil

Una vez que tengas la web en vivo, actualiza el `.env.local` con tu URL:

```
NEXT_PUBLIC_API_URL=https://ruta-eficiente.vercel.app
```

Y vuelve a ejecutar `./build-mobile.sh` para que la APK use tu API real.

---

## Preguntas frecuentes

**¿Cuánto cuesta Vercel?**
El plan gratuito incluye 100GB de transferencia/mes y despliegues ilimitados. Para un proyecto así es más que suficiente.

**¿Cuántas peticiones gratuitas tiene Gemini?**
1.500 peticiones/día gratis en el tier gratuito. Equivale a ~1.500 itinerarios generados por día.

**¿Puedo cambiar la API key después?**
Sí. En Vercel → tu proyecto → Settings → Environment Variables. Después redespliega.

**La web funciona pero los itinerarios son genéricos (modo demo)**
Significa que `GEMINI_API_KEY` no está configurada en Vercel. Añádela en Settings → Environment Variables y redespliega.
