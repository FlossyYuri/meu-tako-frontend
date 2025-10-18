export default defineNuxtPlugin((nuxtApp) => {
  const router = nuxtApp.$router
  const routeLoading = useState<boolean>('routeLoading', () => false)

  router.beforeEach(() => {
    routeLoading.value = true
  })

  const finish = () => {
    // pequeno atraso para suavidade visual
    setTimeout(() => { routeLoading.value = false }, 120)
  }

  router.afterEach(finish)
  router.onError(() => finish())
})