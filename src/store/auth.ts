import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { useStorage } from '../composables/useStorage'
import type { User } from '../types'

const storage = useStorage()

export const useAuthStore = defineStore('auth', () => {
  // État — initialisé depuis le localStorage si disponible
  const token = ref<string | null>(storage.get<string>('token'))
  const user = ref<User | null>(storage.get<User>('user'))

  // Getter
  const isAuthenticated = computed(() => !!token.value)

  // Actions
  const login = (newToken: string, newUser: User): void => {
    token.value = newToken
    user.value = newUser
    storage.set('token', newToken)
    storage.set('user', newUser)
  }

  const logout = (): void => {
    token.value = null
    user.value = null
    storage.remove('token', 'user')
  }

  return { token, user, isAuthenticated, login, logout }
})
