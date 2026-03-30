<template>
  <div class="deck-form-page">
    <NCard
      :title="isEdit ? 'Modifier le deck' : 'Créer un deck'"
      class="deck-form-card"
    >
      <NForm>
        <NFormItem label="Nom du deck">
          <NInput v-model:value="name" placeholder="Ex: Mon deck Feu" />
        </NFormItem>

        <NFormItem>
          <template #label>
            <span>
              Cartes sélectionnées :
              <strong
                :style="{
                  color: selectedCardIds.length === 10 ? '#18a058' : '#d03050',
                }"
              >
                {{ selectedCardIds.length }} / 10
              </strong>
            </span>
          </template>

          <div v-if="loadingCards" style="padding: 24px 0">
            Chargement des cartes...
          </div>

          <div v-else style="width: 100%">
            <NInput
              v-model:value="search"
              placeholder="Rechercher une carte par nom..."
              clearable
              style="margin-bottom: 12px"
            />
            <CardGrid
              :cards="filteredCards"
              size="sm"
              :selectable="true"
              :max-selected="10"
              :selected-ids="selectedCardIds"
              @update:selected-ids="selectedCardIds = $event"
            />
          </div>
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end" wrap class="deck-form-actions">
          <NButton @click="router.back()">Annuler</NButton>
          <NButton
            type="primary"
            :disabled="!isValid"
            :loading="submitting"
            @click="handleSubmit"
          >
            {{ isEdit ? 'Enregistrer' : 'Créer' }}
          </NButton>
        </NSpace>
      </template>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { NButton, NCard, NForm, NFormItem, NInput, NSpace } from 'naive-ui'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import CardGrid from '../components/CardGrid.vue'
import { useApi } from '../composables/useApi'
import { ROUTES } from '../router'
import type { Card } from '../types'

const route = useRoute()
const router = useRouter()
const { getCards, getDeck, createDeck, updateDeck } = useApi()

const isEdit = computed(() => !!route.params.id)
const deckId = computed(() => route.params.id as string)

const name = ref('')
const search = ref('')
const selectedCardIds = ref<number[]>([])
const allCards = ref<Card[]>([])
const loadingCards = ref(false)
const submitting = ref(false)

const filteredCards = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return allCards.value
  return allCards.value.filter(
    (c) =>
      c.name.toLowerCase().includes(q) || selectedCardIds.value.includes(c.id),
  )
})

const isValid = computed(
  () => name.value.trim().length > 0 && selectedCardIds.value.length === 10,
)

onMounted(async () => {
  loadingCards.value = true
  try {
    const [cards] = await Promise.all([
      getCards(),
      isEdit.value
        ? getDeck(deckId.value).then((deck) => {
            name.value = deck.name
            selectedCardIds.value = deck.cards.map((c) => c.cardId)
          })
        : Promise.resolve(),
    ])
    allCards.value = cards
  } finally {
    loadingCards.value = false
  }
})

async function handleSubmit() {
  if (!isValid.value) return
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateDeck(deckId.value, {
        name: name.value.trim(),
        cards: selectedCardIds.value,
      })
      router.push(`/decks/${deckId.value}`)
    } else {
      await createDeck({
        name: name.value.trim(),
        cards: selectedCardIds.value,
      })
      router.push(ROUTES.HOME)
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.deck-form-page {
  padding: 16px 12px 28px;
}

.deck-form-card {
  max-width: 1100px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .deck-form-page {
    padding: 24px 20px 36px;
  }
}

@media (max-width: 640px) {
  .deck-form-actions {
    width: 100%;
  }

  .deck-form-actions :deep(.n-button) {
    width: 100%;
  }
}
</style>
