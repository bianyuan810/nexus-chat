// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
 
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "@nuxtjs/supabase"],
  supabase: {
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/',
      exclude: [],
    },
  },
  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
        }
      ]
    }
  }
});
