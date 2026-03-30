<template>
  <div class="deck-detail-page">
    <div v-if="loading" style="text-align: center; padding: 48px">
      <NSpin size="large" />
    </div>

    <NCard v-else-if="deck" :title="deck.name" class="deck-detail-card">
      <template #header-extra>
        <NButton type="primary" @click="router.push(`/decks/${deck.id}/edit`)">
          Modifier
        </NButton>
      </template>

      <CardGrid :cards="deckCards" size="md" />

      <template #footer>
        <NButton @click="router.push(ROUTES.HOME)">← Retour</NButton>
      </template>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { NButton, NCard, NSpin } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CardGrid from '../components/CardGrid.vue'
import { useApi } from '../composables/useApi'
import { ROUTES } from '../router'
import type { Card, Deck } from '../types'

const route = useRoute()
const router = useRouter()
const { getDeck, getCards } = useApi()

const deck = ref<Deck | null>(null)
const cardMap = ref<Record<number, Card>>({})
const loading = ref(false)

const deckCards = computed(
  () =>
    (deck.value?.cards ?? [])
      .map((dc) => cardMap.value[dc.cardId])
      .filter(Boolean) as Card[],
)

onMounted(async () => {
  loading.value = true
  try {
    const [fetchedDeck, cards] = await Promise.all([
      getDeck(route.params.id as string),
      getCards(),
    ])
    deck.value = fetchedDeck
    cardMap.value = Object.fromEntries(cards.map((c) => [c.id, c]))
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.deck-detail-page {
  padding: 16px 12px 28px;
}

.deck-detail-card {
  max-width: 1100px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .deck-detail-page {
    padding: 24px 20px 36px;
  }
}
</style>
