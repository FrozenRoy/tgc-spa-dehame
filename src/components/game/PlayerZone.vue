<template>
  <div :class="['player-zone', { 'player-zone-opponent': isOpponent }]">
    <!-- En-tête zone -->
    <div class="player-zone-header">
      <span style="font-weight: 600; font-size: 14px; color: #555">{{
        label
      }}</span>
      <!-- Score : nombre de KOs — RG2 page jeu -->
      <div class="player-zone-score">
        <span style="font-size: 12px; color: #888">KOs :</span>
        <div style="display: flex; gap: 4px">
          <span
            v-for="i in 3"
            :key="i"
            :style="{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: board && i <= board.score ? '#f0a020' : '#ddd',
            }"
          />
        </div>
        <span style="font-size: 12px; font-weight: 600; color: #333">{{
          board?.score ?? 0
        }}</span>
      </div>
    </div>

    <!-- Carte active ou placeholder — RG3 page jeu -->
    <div class="player-zone-active-area">
      <div v-if="board?.activeCard" class="player-zone-active-card">
        <PokemonCard
          :card="toCard(board.activeCard)"
          :current-hp="board.activeCard.currentHp"
          size="md"
          :disabled="true"
        />
      </div>

      <!-- Placeholder si aucune carte active -->
      <div v-else class="player-zone-placeholder">Aucune carte active</div>
    </div>

    <!-- Main (slot pour la zone joueur) -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import type { ActiveCard, PlayerBoard } from '../../types'
import type { Card } from '../../types'
import PokemonCard from '../PokemonCard.vue'

defineProps<{
  board: PlayerBoard | null
  label: string
  isOpponent?: boolean
}>()

function toCard(gc: ActiveCard): Card {
  return {
    id: gc.id,
    name: gc.name,
    hp: gc.hp,
    attack: gc.attack,
    type: gc.type as Card['type'],
    pokedexNumber: gc.pokedexNumber,
    imgUrl: gc.imgUrl,
  }
}
</script>

<style scoped>
.player-zone {
  border: 1.5px solid #e8e8e8;
  border-radius: 12px;
  padding: 16px;
  background: #f0f7ff;
  min-height: 160px;
}

.player-zone-opponent {
  background: #fafbfc;
}

.player-zone-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 8px;
  flex-wrap: wrap;
}

.player-zone-score {
  display: flex;
  align-items: center;
  gap: 6px;
}

.player-zone-active-area {
  display: flex;
  justify-content: center;
}

.player-zone-active-card {
  width: 130px;
}

.player-zone-placeholder {
  width: 130px;
  height: 160px;
  border: 2px dashed #ccc;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #bbb;
  font-size: 13px;
  text-align: center;
}

@media (max-width: 640px) {
  .player-zone {
    padding: 10px;
  }

  .player-zone-active-card,
  .player-zone-placeholder {
    width: 110px;
  }

  .player-zone-placeholder {
    height: 140px;
  }
}
</style>
