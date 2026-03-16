<template>
  <div style="padding: 24px">
    <NCard :title="isEdit ? 'Modifier le deck' : 'Créer un deck'">
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

          <CardGrid
            v-else
            :cards="allCards"
            size="sm"
            :selectable="true"
            :max-selected="10"
            :selected-ids="selectedCardIds"
            @update:selected-ids="selectedCardIds = $event"
          />
        </NFormItem>
      </NForm>

      <template #footer>
        <NSpace justify="end">
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
const selectedCardIds = ref<number[]>([])
const allCards = ref<Card[]>([])
const loadingCards = ref(false)
const submitting = ref(false)

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
