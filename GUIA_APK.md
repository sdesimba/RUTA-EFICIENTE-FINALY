# 📱 Guía para compilar la APK de RutaEficiente

## Requisitos previos

Necesitas tener instalado:
- **Node.js** 18+ y **Yarn**
- **Java JDK 17** (recomendado para Android)
- **Android Studio** (incluye Android SDK y emulador)
- Variable de entorno `ANDROID_HOME` apuntando al SDK

### Instalar Java (si no lo tienes)
```bash
# macOS con Homebrew
brew install openjdk@17
export JAVA_HOME=/opt/homebrew/opt/openjdk@17

# Windows: descarga de https://adoptium.net
```

### Instalar Android Studio
1. Descarga desde https://developer.android.com/studio
2. Al abrir, acepta la instalación del SDK (API 35 recomendado)
3. En SDK Manager, instala también:
   - Android SDK Build-Tools 34+
   - Android Emulator (opcional, para testing)

---

## Opción A — APK para pruebas (debug, sin firmar)

### Paso 1: Instalar dependencias
```bash
cd ruta-inteligente-v3
yarn install
```

### Paso 2: (Opcional) Si tienes backend propio para la IA
```bash
export NEXT_PUBLIC_API_URL=https://tu-servidor.com
```
Si no defines esto, la app usará los datos mock incluidos.

### Paso 3: Ejecutar el build
```bash
./build-mobile.sh
```
Este script:
- Genera el build estático en `/out`
- Sincroniza con Capacitor → carpeta `/android`
- Restaura tu configuración de desarrollo automáticamente

### Paso 4: Generar la APK
```bash
npx cap open android
```
En Android Studio:
- **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- La APK debug aparece en: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Opción B — APK de producción (firmada, para distribuir)

### Crear el keystore (solo la primera vez)
```bash
keytool -genkeypair \
  -v \
  -keystore ruta-eficiente.keystore \
  -alias rutaeficiente \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```
⚠️ **Guarda este archivo y las contraseñas en un lugar seguro. Sin ellas no puedes actualizar la app.**

### Firmar en Android Studio
1. `Build → Generate Signed Bundle / APK`
2. Selecciona **APK**
3. Elige tu keystore, alias y contraseñas
4. Selecciona **Release**
5. Firma con **V1 + V2**

La APK firmada aparece en:
`android/app/build/outputs/apk/release/app-release.apk`

---

## Opción C — Build desde línea de comandos (sin Android Studio)

```bash
# Tras ejecutar build-mobile.sh
cd android
./gradlew assembleDebug      # APK debug
./gradlew assembleRelease    # APK release (necesita keystore configurado)
```

---

## Instalar la APK en tu móvil

### Por cable USB
```bash
# Activa "Depuración USB" en tu Android (Ajustes → Opciones de desarrollador)
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Transfiriendo el archivo
1. Copia la APK al móvil
2. En el móvil: Ajustes → Seguridad → Permite instalar apps de fuentes desconocidas
3. Abre el archivo APK desde el explorador de archivos

---

## Preguntas frecuentes

**¿Por qué la app no genera itinerarios?**
La versión APK sin `NEXT_PUBLIC_API_URL` usa datos mock. Para IA real necesitas:
1. Desplegar el backend Python en un servidor (Render, Railway, etc.)
2. Definir la variable antes del build

**¿Puedo subir esto a Google Play?**
Sí, pero necesitas:
- APK firmada con Release keystore
- Cuenta de Google Play Developer (25$ único)
- Screenshots, descripción y política de privacidad

**¿Y para iOS?**
El proyecto incluye soporte Capacitor para iOS, pero necesitas:
- Mac con Xcode
- Cuenta Apple Developer (99$/año)
- Ejecutar: `npx cap add ios && npx cap open ios`

---

## Estructura de archivos relevante

```
ruta-inteligente-v3/
├── app/                    ← Código Next.js (web + lógica)
├── android/                ← Proyecto Android nativo (Capacitor)
│   └── app/build/outputs/ ← APKs generadas aquí
├── out/                    ← Build estático (generado por build-mobile.sh)
├── capacitor.config.ts     ← Config de Capacitor
├── next.config.mobile.js   ← Config Next.js para export estático
└── build-mobile.sh         ← Script de build completo
```
