<template>
  <!-- RG8 — modal automatique à la fin de la partie -->
  <NModal
    :show="show"
    :mask-closable="false"
    preset="card"
    style="width: min(92vw, 380px); text-align: center"
  >
    <template #header>
      <span style="font-size: 20px">
        {{ result === 'win' ? '🏆 Victoire !' : '💀 Défaite' }}
      </span>
    </template>

    <div style="padding: 16px 0; font-size: 16px; color: #333">
      {{
        result === 'win'
          ? 'Félicitations, vous avez gagné !'
          : 'Vous avez perdu cette fois.'
      }}
    </div>

    <template #footer>
      <!-- RG9 — bouton retour au lobby -->
      <div style="display: flex; justify-content: center">
        <NButton type="primary" @click="emit('goToLobby')">
          Retour au lobby
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<script setup lang="ts">
import { NButton, NModal } from 'naive-ui'

defineProps<{
  show: boolean
  result: 'win' | 'lose' | null
}>()

const emit = defineEmits<{ goToLobby: [] }>()
</script>
