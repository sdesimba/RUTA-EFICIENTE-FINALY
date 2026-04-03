# 📱 Ruta Eficiente - Versión Móvil (Capacitor)

## ✅ Configuración Completada

Tu aplicación web "Ruta Eficiente" ha sido configurada para convertirse en una app móvil Android (APK) usando Capacitor.

## 📁 Archivos Nuevos Añadidos

```
/app/
├── capacitor.config.ts          # Configuración de Capacitor
├── next.config.mobile.js        # Configuración Next.js para build móvil
├── .env.mobile                  # Variables de entorno para la app móvil
├── MOBILE_BUILD_GUIDE.md        # Guía completa paso a paso (¡LÉELA!)
├── android/                     # Proyecto Android nativo generado
└── package.json                 # Actualizado con scripts móviles
```

## 🚀 Pasos Rápidos

### 1️⃣ Desplegar el Backend
```bash
# Sube tu código a GitHub
# Despliega en Vercel (https://vercel.com)
# Copia la URL de tu deployment
```

### 2️⃣ Configurar URL del Backend
Edita `.env.mobile` y reemplaza con tu URL real:
```bash
NEXT_PUBLIC_API_URL=https://tu-app.vercel.app
```

### 3️⃣ Generar la App Móvil
```bash
# Build para móvil
yarn build:mobile

# Abrir en Android Studio (necesitas tenerlo instalado)
npx cap open android

# Desde Android Studio: Build > Build APK
```

## 📖 Documentación Completa

Lee el archivo **`MOBILE_BUILD_GUIDE.md`** para instrucciones detalladas sobre:
- Cómo instalar Android Studio
- Cómo desplegar el backend
- Cómo generar el APK de desarrollo
- Cómo generar el APK de producción
- Cómo publicar en Google Play Store
- Solución de problemas comunes

## 🎯 Scripts Disponibles

```bash
# Desarrollo web (como siempre)
yarn dev

# Build para móvil
yarn build:mobile

# Ejecutar en dispositivo Android conectado
yarn android:dev

# Build APK desde línea de comandos
yarn android:build
```

## ⚠️ Importante

- **Backend y Frontend están SEPARADOS**: El backend debe estar desplegado en un servidor
- **Actualiza `.env.mobile`**: Antes de generar el APK, configura la URL correcta
- **Primera vez tarda**: El primer build puede tardar 10-15 minutos
- **Necesitas Android Studio**: Es gratuito pero ocupa ~3-4 GB

## 🆘 Ayuda

Si tienes problemas:
1. Lee `MOBILE_BUILD_GUIDE.md` (sección "Solución de Problemas")
2. Verifica que el backend esté funcionando (abre la URL en tu navegador)
3. Asegúrate de haber hecho `yarn build:mobile` después de cambiar `.env.mobile`

## 💰 Costos

- ✅ Vercel (backend): **GRATIS** (plan hobby)
- ✅ Android Studio: **GRATIS**
- 💵 Google Play Developer: **$25 USD** (pago único, solo si quieres publicar)

---

## 🎉 ¡Ya está todo listo!

Ahora solo necesitas:
1. Desplegar el backend en Vercel
2. Actualizar `.env.mobile`
3. Hacer el build móvil
4. Generar tu APK

**Tiempo total estimado: 1-2 horas** (primera vez)
