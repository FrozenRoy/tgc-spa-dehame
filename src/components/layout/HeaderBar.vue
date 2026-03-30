<template>
  <NLayoutHeader bordered class="header-bar">
    <div class="header-inner">
      <div class="header-left">
        <RouterLink to="/" class="brand-link">TCG SPA</RouterLink>
        <NSpace class="header-links" align="center" :size="8">
          <NButton
            tag="a"
            :href="`${apiBaseUrl.replace('/api', '')}/api-docs`"
            target="_blank"
            text
            size="small"
          >
            API Docs
          </NButton>
          <NButton
            tag="a"
            href="https://making-rerun-61323218.figma.site/"
            target="_blank"
            text
            size="small"
          >
            Maquettes
          </NButton>
        </NSpace>
      </div>

      <div class="header-right">
        <NText class="header-username" depth="3">{{
          authStore.user?.username
        }}</NText>
        <NButton size="small" @click="handleLogout">Déconnexion</NButton>
      </div>
    </div>
  </NLayoutHeader>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

import { ROUTES } from '../../router'
import { useAuthStore } from '../../store/auth'
import { useGameStore } from '../../store/game'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string
const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()

const handleLogout = () => {
  gameStore.disconnect()
  authStore.logout()
  router.push(ROUTES.SIGNIN)
}
</script>

<style scoped>
.header-bar {
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-inner {
  min-height: 56px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.header-left {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-link {
  font-weight: 700;
  text-decoration: none;
  color: inherit;
  white-space: nowrap;
}

.header-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-username {
  max-width: 140px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .header-inner {
    padding: 8px 12px;
  }

  .header-links {
    display: none;
  }

  .header-username {
    display: none;
  }

  .header-right {
    margin-left: 0;
  }
}
</style>
