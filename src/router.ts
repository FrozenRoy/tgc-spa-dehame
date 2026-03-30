import { createRouter, createWebHistory } from 'vue-router'

import DeckDetailPage from './pages/DeckDetailPage.vue'
import DeckFormPage from './pages/DeckFormPage.vue'
import GamePage from './pages/GamePage.vue'
import HomePage from './pages/HomePage.vue'
import SignInPage from './pages/SignInPage.vue'
import SignUpPage from './pages/SignUpPage.vue'
import { useAuthStore } from './store/auth'

export const ROUTES = {
  HOME: '/',
  SIGNIN: '/signin',
  SIGNUP: '/signup',
  DECK_NEW: '/decks/new',
  DECK_DETAIL: '/decks/:id',
  DECK_EDIT: '/decks/:id/edit',
  GAME: '/game',
} as const

const routes = [
  { path: ROUTES.HOME, component: HomePage, meta: { requiresAuth: true } },
  { path: ROUTES.GAME, component: GamePage, meta: { requiresAuth: true } },
  { path: ROUTES.SIGNIN, component: SignInPage, meta: { requiresGuest: true } },
  { path: ROUTES.SIGNUP, component: SignUpPage, meta: { requiresGuest: true } },
  {
    path: ROUTES.DECK_NEW,
    component: DeckFormPage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.DECK_DETAIL,
    component: DeckDetailPage,
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.DECK_EDIT,
    component: DeckFormPage,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next(ROUTES.SIGNIN)
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    return next(ROUTES.HOME)
  }

  next()
})

export default router
