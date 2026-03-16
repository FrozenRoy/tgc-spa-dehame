<template>
  <div>
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      "
    >
      <h2 style="margin: 0">Mes decks</h2>
      <NButton type="primary" @click="router.push(ROUTES.DECK_NEW)"
        >+ Nouveau deck</NButton
      >
    </div>

    <div v-if="loading" style="text-align: center; padding: 48px">
      <NSpin size="large" />
    </div>

    <p v-else-if="decks.length === 0" style="color: #999">Aucun deck trouvé.</p>

    <div v-else style="display: flex; flex-direction: column; gap: 20px">
      <NCard v-for="deck in decks" :key="deck.id" :title="deck.name">
        <div
          style="
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
          "
        >
          <template v-for="deckCard in deck.cards" :key="deckCard.id">
            <PokemonCard
              v-if="cardMap[deckCard.cardId]"
              :card="cardMap[deckCard.cardId]"
              :current-hp="cardMap[deckCard.cardId].hp"
              size="sm"
            />
          </template>
        </div>

        <template #footer>
          <div style="display: flex; justify-content: flex-end">
            <NSpace>
              <NButton size="small" @click="router.push(`/decks/${deck.id}`)"
                >Voir le détail</NButton
              >
              <NButton
                size="small"
                @click="router.push(`/decks/${deck.id}/edit`)"
                >Modifier</NButton
              >
              <NButton
                size="small"
                type="error"
                :loading="deletingId === deck.id"
                @click="handleDelete(deck.id)"
              >
                Supprimer
              </NButton>
            </NSpace>
          </div>
        </template>
      </NCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { NButton, NCard, NSpace, NSpin } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '../composables/useApi'
import { ROUTES } from '../router'
import type { Card, Deck } from '../types'
import PokemonCard from './PokemonCard.vue'

const router = useRouter()
const { getMyDecks, getCards, deleteDeck } = useApi()

const decks = ref<Deck[]>([])
const cardMap = ref<Record<number, Card>>({})
const loading = ref(false)
const deletingId = ref<number | null>(null)

async function fetchDecks() {
  loading.value = true
  try {
    decks.value = await getMyDecks()
  } finally {
    loading.value = false
  }
}

async function fetchCards() {
  const cards = await getCards()
  cardMap.value = Object.fromEntries(cards.map((c) => [c.id, c]))
}

async function handleDelete(id: number) {
  deletingId.value = id
  try {
    await deleteDeck(id)
    await fetchDecks()
  } finally {
    deletingId.value = null
  }
}

onMounted(() => Promise.all([fetchDecks(), fetchCards()]))
</script>
