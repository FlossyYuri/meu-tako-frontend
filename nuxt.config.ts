// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  srcDir: 'app/',
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vee-validate/nuxt',
    '@vueuse/nuxt',
  ],
  css: ['~/assets/css/main.css'],
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:5000/api',
    },
  },
  app: {
    head: {
      title: 'Meu Tako - Gestão Financeira Pessoal',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Gerencie suas finanças pessoais de forma simples e eficiente',
        },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '48x48',
          href: '/icons/48-48.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '72x72',
          href: '/icons/72-72.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '96x96',
          href: '/icons/96-96.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '144x144',
          href: '/icons/144-144.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '192x192',
          href: '/icons/192-192.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '512x512',
          href: '/icons/512-512.png',
        },
        {
          rel: 'apple-touch-icon',
          sizes: '192x192',
          href: '/icons/192-192.png',
        },
        {
          rel: 'apple-touch-icon',
          sizes: '512x512',
          href: '/icons/512-512.png',
        },
      ],
    },
  },
});
