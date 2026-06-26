export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  ssr: true,
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Dinkleberg Maker',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
    },
  },
})
