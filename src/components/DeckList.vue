<template>
  <div class="deck-list">
    <div class="deck-list-header">
      <h2 class="deck-list-title">Mes decks</h2>
      <NButton
        type="primary"
        class="new-deck-btn"
        @click="router.push(ROUTES.DECK_NEW)"
      >
        + Nouveau deck
      </NButton>
    </div>

    <div v-if="loading" style="text-align: center; padding: 48px">
      <NSpin size="large" />
    </div>

    <p v-else-if="decks.length === 0" style="color: #999">Aucun deck trouvé.</p>

    <NGrid v-else responsive="screen" cols="1 m:2 l:3" :x-gap="16" :y-gap="16">
      <NGridItem v-for="deck in decks" :key="deck.id">
        <NCard :title="deck.name">
          <CardGrid :cards="getDeckCards(deck)" size="sm" />

          <template #footer>
            <div class="deck-card-footer">
              <NSpace wrap size="small" class="deck-actions">
                <NButton size="small" @click="router.push(`/decks/${deck.id}`)">
                  Voir le détail
                </NButton>
                <NButton
                  size="small"
                  @click="router.push(`/decks/${deck.id}/edit`)"
                >
                  Modifier
                </NButton>
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
      </NGridItem>
    </NGrid>
  </div>
</template>

<script setup lang="ts">
import { NButton, NCard, NGrid, NGridItem, NSpace, NSpin } from 'naive-ui'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import { useApi } from '../composables/useApi'
import { ROUTES } from '../router'
import type { Card, Deck } from '../types'
import CardGrid from './CardGrid.vue'

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

function getDeckCards(deck: Deck): Card[] {
  return deck.cards
    .map((deckCard) => cardMap.value[deckCard.cardId])
    .filter((card): card is Card => !!card)
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

<style scoped>
.deck-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.deck-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.deck-list-title {
  margin: 0;
}

.deck-card-footer {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 640px) {
  .new-deck-btn {
    width: 100%;
  }

  .deck-card-footer {
    justify-content: stretch;
  }

  .deck-actions {
    width: 100%;
  }

  .deck-actions :deep(.n-button) {
    width: 100%;
  }
}
</style>
