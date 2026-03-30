<template>
  <!-- RG1 main — cartes + deck count -->
  <div style="margin-top: 12px">
    <div
      style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      "
    >
      <span style="font-size: 12px; color: #666"
        >Main ({{ hand.length }}/5)</span
      >
      <span style="font-size: 12px; color: #888"
        >Deck : {{ deckCount }} carte{{ deckCount > 1 ? 's' : '' }}</span
      >
    </div>

    <div
      v-if="hand.length === 0"
      style="color: #bbb; font-size: 12px; text-align: center; padding: 8px"
    >
      Main vide
    </div>

    <div
      v-else
      style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px"
    >
      <!-- RG2 main — jouer carte si tour du joueur et pas de carte active -->
      <div
        v-for="(card, index) in hand"
        :key="`${card.id}-${index}`"
        style="flex-shrink: 0; width: 90px"
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
