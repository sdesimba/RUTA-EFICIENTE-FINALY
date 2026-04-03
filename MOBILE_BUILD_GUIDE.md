# 📱 Guía Completa: Convertir Ruta Eficiente en APK con Capacitor

## 🎯 Arquitectura

Tu app ahora funciona con arquitectura separada:
- **Frontend (App Móvil)**: Código Next.js exportado como estática que se ejecuta en el móvil
- **Backend (Servidor)**: API routes de Next.js desplegado en Vercel/Railway que maneja OpenAI

## 📋 Paso 1: Desplegar el Backend en Vercel

### 1.1 Preparar el Proyecto
```bash
# El backend ya está listo en tu carpeta /app
# Solo necesitas subirlo a un repositorio Git
```

### 1.2 Desplegar en Vercel (GRATIS)
1. Ve a https://vercel.com
2. Conecta tu cuenta de GitHub
3. Importa tu repositorio
4. Vercel detectará automáticamente Next.js
5. En "Environment Variables" añade:
   ```
   EMERGENT_LLM_KEY=tu_clave_openai
   MONGO_URL=tu_url_mongodb (si usas MongoDB)
   ```
6. Click en "Deploy"
7. **Copia la URL de tu deployment** (ej: `https://ruta-eficiente.vercel.app`)

### 1.3 Alternativa: Railway
Si prefieres Railway:
1. Ve a https://railway.app
2. Conecta con GitHub
3. Selecciona tu repo
4. Añade las variables de entorno
5. Deploy automático

---

## 📋 Paso 2: Configurar la App Móvil

### 2.1 Actualizar la URL del Backend
Edita el archivo `.env.mobile`:
```bash
# Reemplaza con la URL de tu backend desplegado
NEXT_PUBLIC_API_URL=https://ruta-eficiente.vercel.app
```

### 2.2 Build del Frontend
```bash
# Construir la versión estática para móvil
yarn build:mobile
```

Este comando hace:
1. Copia la configuración móvil (`next.config.mobile.js`)
2. Construye la app estática (carpeta `out/`)
3. Sincroniza con Capacitor

---

## 📋 Paso 3: Generar el APK

### 3.1 Requisitos Previos
Necesitas instalar en tu computadora:

**En Windows:**
- [Android Studio](https://developer.android.com/studio)
- Durante la instalación, marca "Android SDK", "Android SDK Platform" y "Android Virtual Device"

**En Mac:**
```bash
# Instalar Android Studio
brew install --cask android-studio
```

**En Linux:**
```bash
# Descargar desde https://developer.android.com/studio
# Extraer y ejecutar studio.sh
```

### 3.2 Configurar Android SDK
1. Abre Android Studio
2. Ve a `Tools > SDK Manager`
3. Instala:
   - Android SDK Platform 33 (o superior)
   - Android SDK Build-Tools 33.0.0
   - Android SDK Command-line Tools

### 3.3 Abrir el Proyecto Android
```bash
# Desde tu carpeta /app
npx cap open android
```

Esto abrirá Android Studio con tu proyecto.

### 3.4 Generar APK de Desarrollo
En Android Studio:
1. Click en `Build` → `Build Bundle(s) / APK(s)` → `Build APK(s)`
2. Espera a que compile (primera vez tarda ~5-10 min)
3. Cuando termine, click en "locate" para ver tu APK
4. El APK estará en: `app/build/outputs/apk/debug/app-debug.apk`

### 3.5 Instalar en tu Móvil (Testing)
```bash
# Conecta tu Android con USB debugging activado
# Luego ejecuta:
npx cap run android
```

O copia el APK a tu móvil e instálalo manualmente.

---

## 📋 Paso 4: APK de Producción (Para Google Play)

### 4.1 Generar Keystore (Solo primera vez)
```bash
# En tu carpeta /app/android
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Guarda bien la contraseña que elijas.

### 4.2 Configurar Signing
Edita `android/app/build.gradle`:
```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('my-release-key.keystore')
            storePassword 'TU_PASSWORD'
            keyAlias 'my-key-alias'
            keyPassword 'TU_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 4.3 Generar APK Firmado
En Android Studio:
1. `Build` → `Generate Signed Bundle / APK`
2. Selecciona "APK"
3. Elige tu keystore
4. Ingresa las contraseñas
5. Selecciona "release"
6. Click "Finish"

El APK estará en: `app/build/outputs/apk/release/app-release.apk`

---

## 📋 Paso 5: Publicar en Google Play

### 5.1 Crear Cuenta de Desarrollador
1. Ve a https://play.google.com/console
2. Paga la tarifa única de $25 USD
3. Completa tu perfil

### 5.2 Crear la App
1. Click en "Crear aplicación"
2. Completa la información:
   - Nombre: **Ruta Eficiente**
   - Idioma: Español
   - App o juego: App
   - Gratis o pago: Gratis

### 5.3 Subir el APK
1. Ve a "Producción" → "Crear nueva versión"
2. Sube tu `app-release.apk`
3. Completa la información requerida:
   - Descripción corta
   - Descripción completa
   - Capturas de pantalla (mínimo 2)
   - Icono de la app
   - Gráfico de funciones
4. Enviar para revisión

La revisión tarda normalmente 1-3 días.

---

## 🎨 Paso 6: Personalizar Iconos y Splash Screen

### 6.1 Crear Iconos
Necesitas un icono de 1024x1024px. Puedes usar:
- [Figma](https://figma.com) (gratis)
- [Canva](https://canva.com) (gratis)
- Herramientas de IA (DALL-E, Midjourney)

### 6.2 Generar Tamaños Automáticos
```bash
# Instalar herramienta
npm install -g @capacitor/assets

# Coloca tu icono en: /app/resources/icon.png (1024x1024)
# Coloca tu splash en: /app/resources/splash.png (2732x2732)

# Generar todos los tamaños
npx capacitor-assets generate --android
```

---

## 🔧 Comandos Útiles

```bash
# Build para móvil
yarn build:mobile

# Abrir en Android Studio
npx cap open android

# Ejecutar en dispositivo conectado
npx cap run android

# Ver logs en tiempo real
npx cap run android -l

# Actualizar código después de cambios
yarn build:mobile && npx cap sync android

# Limpiar build
cd android && ./gradlew clean
```

---

## 🐛 Solución de Problemas Comunes

### Error: "SDK not found"
```bash
# Configurar ANDROID_HOME
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Error: "Build failed"
1. Abre Android Studio
2. `File` → `Sync Project with Gradle Files`
3. Intenta de nuevo

### La app no conecta con el backend
1. Verifica que `.env.mobile` tenga la URL correcta
2. Asegúrate de hacer `yarn build:mobile` después de cambiar la URL
3. Verifica que el backend esté funcionando (abre la URL en el navegador)

### Permisos en Android
Si necesitas permisos especiales (GPS, cámara, etc.), edita:
`android/app/src/main/AndroidManifest.xml`

---

## 📊 Checklist Final

Antes de publicar, verifica:
- [ ] Backend desplegado y funcionando
- [ ] `.env.mobile` configurado con URL correcta
- [ ] Build móvil exitoso (`yarn build:mobile`)
- [ ] APK genera correctamente
- [ ] Probado en dispositivo físico
- [ ] Iconos y splash screen configurados
- [ ] Descripciones y capturas de pantalla listas
- [ ] Política de privacidad (requerida por Google Play)
- [ ] APK firmado para producción

---

## 🎉 ¡Listo!

Ahora tienes tu app "Ruta Eficiente" lista para publicar en Google Play Store.

**Tiempo estimado total:**
- Desplegar backend: 15-30 min
- Generar APK de desarrollo: 30-45 min
- Generar APK de producción: 15-30 min
- Publicar en Google Play: 2-3 días (revisión)

**Costos:**
- Vercel/Railway: Gratis (plan básico)
- Google Play Developer: $25 USD (pago único)
- Android Studio: Gratis
