import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rutaeficiente.app',
  appName: 'RutaEficiente',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Elimina esta sección en producción. Solo para dev local:
    // url: 'http://TU_IP_LOCAL:3000',
    // cleartext: true,
  },
  android: {
    buildOptions: {
      releaseType: 'APK',
    },
    // Oculta la barra de estado para experiencia fullscreen
    backgroundColor: '#f8f5f0',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#E11D48',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
