<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      gap: 10px;
      padding: 14px 20px;
      background: #fff;
      border: 1.5px solid #e8e8e8;
      border-radius: 12px;
    "
  >
    <!-- RG3 — indicateur de tour -->
    <div style="text-align: center">
      <NTag :type="isMyTurn ? 'success' : 'warning'" size="large" round>
        {{ isMyTurn ? 'Votre tour' : "Tour de l'adversaire" }}
      </NTag>
    </div>

    <!-- Boutons d'action — RG6 désactivés si pas le tour -->
    <div
      style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap"
    >
      <!-- RG4 — Piocher désactivé si main pleine ou deck vide -->
      <NButton
        :disabled="!isMyTurn || handFull || deckEmpty"
        @click="emit('drawCards')"
      >
        Piocher
      </NButton>

      <!-- RG5 — Attaquer désactivé si l'un des 2 joueurs n'a pas de carte active -->
      <NButton
        type="warning"
        :disabled="
          !isMyTurn || !myBoard?.activeCard || !opponentBoard?.activeCard
        "
        @click="emit('attack')"
      >
        Attaquer
      </NButton>

      <!-- Toujours disponible si c'est le tour -->
      <NButton type="primary" :disabled="!isMyTurn" @click="emit('endTurn')">
        Fin de tour
      </NButton>
    </div>

    <!-- RG7 — message en temps réel -->
    <div
      v-if="gameMessage"
      style="
        text-align: center;
        font-size: 13px;
        color: #555;
        background: #f5f5f5;
        border-radius: 6px;
        padding: 6px 10px;
      "
    >
      {{ gameMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NTag } from 'naive-ui'
import { computed } from 'vue'

import type { PlayerBoard } from '../../types'

const props = defineProps<{
  isMyTurn: boolean
  myBoard: PlayerBoard | null
  opponentBoard: PlayerBoard | null
  gameMessage: string
}>()

const emit = defineEmits<{
  drawCards: []
  attack: []
  endTurn: []
}>()

const handFull = computed(() => (props.myBoard?.hand?.length ?? 0) >= 5)
const deckEmpty = computed(() => (props.myBoard?.deck?.length ?? 0) === 0)
</script>
