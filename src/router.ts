import { createRouter, createWebHistory } from 'vue-router'

import HomePage from './pages/HomePage.vue'
import SignInPage from './pages/SignInPage.vue'
import SignUpPage from './pages/SignUpPage.vue'
import { useAuthStore } from './store/auth'

export const ROUTES = {
  HOME: '/',
  SIGNIN: '/signin',
  SIGNUP: '/signup',
} as const

const routes = [
  { path: ROUTES.HOME, component: HomePage, meta: { requiresAuth: true } },
  { path: ROUTES.SIGNIN, component: SignInPage, meta: { requiresGuest: true } },
  { path: ROUTES.SIGNUP, component: SignUpPage, meta: { requiresGuest: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Router guard pour gérer l'authentification (RG2 et RG3)
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  // RG2: Route privée nécessite authentification
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next(ROUTES.SIGNIN)
  }

  // RG3: Pages de connexion/inscription inaccessibles si déjà connecté
  if (to.meta.requiresGuest && isAuthenticated) {
    return next(ROUTES.HOME)
  }

  next()
})

export default router
