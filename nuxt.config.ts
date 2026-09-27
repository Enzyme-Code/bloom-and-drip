// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: false,
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      // Set via NUXT_PUBLIC_FIREBASE_* env vars (see .env.example)
      firebase: {
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: ''
      },
      // NUXT_PUBLIC_FIREBASE_EMULATOR=true connects to the local Auth / Firestore emulators
      firebaseEmulator: false
    }
  },
  vite: {
    plugins: [tailwindcss()]
  },
  app: {
    head: {
      htmlAttrs: { lang: 'zh-Hant' },
      title: 'Bloom & Drip — Pourcraft Studio',
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Manrope:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap'
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block'
        }
      ]
    }
  }
})
