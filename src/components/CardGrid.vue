<template>
  <div
    :style="{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '12px',
    }"
  >
    <PokemonCard
      v-for="card in cards"
      :key="card.id"
      :card="card"
      :current-hp="card.hp"
      :size="size"
      :selected="selectable && selectedIds.includes(card.id)"
      :disabled="selectable && isDisabled(card.id)"
      @click="selectable ? toggle(card.id) : undefined"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import type { Card } from '../types'
import PokemonCard from './PokemonCard.vue'

const props = withDefaults(
  defineProps<{
    cards: Card[]
    size?: 'sm' | 'md'
    selectable?: boolean
    selectedIds?: number[]
    maxSelected?: number
  }>(),
  {
    size: 'md',
    selectable: false,
    selectedIds: () => [],
    maxSelected: undefined,
  },
)

const emit = defineEmits<{ 'update:selectedIds': [ids: number[]] }>()

const maxReached = computed(
  () =>
    props.maxSelected !== undefined &&
    props.selectedIds.length >= props.maxSelected,
)

function isDisabled(cardId: number): boolean {
  return maxReached.value && !props.selectedIds.includes(cardId)
}

function toggle(cardId: number) {
  if (props.selectedIds.includes(cardId)) {
    emit(
      'update:selectedIds',
      props.selectedIds.filter((id) => id !== cardId),
    )
  } else if (!maxReached.value) {
    emit('update:selectedIds', [...props.selectedIds, cardId])
  }
}
</script>
