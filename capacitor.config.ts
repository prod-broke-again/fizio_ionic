import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.fizio.app',
  appName: 'Fizio',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    BackgroundRunner: {
      label: "com.fizio.healthkit.sync",
      src: "src/runners/healthkit-sync.js",
      event: "healthkitSync",
      repeat: true,
      interval: 15,
      autoStart: true
    }
  }
};

export default config;
