<template>
  <!-- RG1 main — cartes + deck count -->
  <div class="player-hand">
    <div class="player-hand-info">
      <span style="font-size: 12px; color: #666"
        >Main ({{ hand.length }}/5)</span
      >
      <span style="font-size: 12px; color: #888"
        >Deck : {{ deckCount }} carte{{ deckCount > 1 ? 's' : '' }}</span
      >
    </div>

    <div v-if="hand.length === 0" class="player-hand-empty">Main vide</div>

    <div v-else class="player-hand-list">
      <!-- RG2 main — jouer carte si tour du joueur et pas de carte active -->
      <div
        v-for="(card, index) in hand"
        :key="`${card.id}-${index}`"
        class="player-hand-card"
      >
        <PokemonCard
          :card="toCard(card)"
          :current-hp="card.hp"
          size="sm"
          :disabled="!canPlay"
          @click="canPlay && emit('playCard', index)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { GameCard } from '../../types'
import type { Card } from '../../types'
import PokemonCard from '../PokemonCard.vue'

const props = defineProps<{
  hand: GameCard[]
  deckCount: number
  isMyTurn: boolean
  hasActiveCard: boolean
}>()

const emit = defineEmits<{ playCard: [cardIndex: number] }>()

// RG2 main — uniquement si tour du joueur et pas de carte active
const canPlay = computed(() => props.isMyTurn && !props.hasActiveCard)

function toCard(gc: GameCard): Card {
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
.player-hand {
  margin-top: 12px;
}

.player-hand-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 8px;
}

.player-hand-empty {
  color: #bbb;
  font-size: 12px;
  text-align: center;
  padding: 8px;
}

.player-hand-list {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.player-hand-card {
  flex-shrink: 0;
  width: 90px;
}

@media (max-width: 640px) {
  .player-hand-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .player-hand-card {
    width: 78px;
  }
}
</style>
