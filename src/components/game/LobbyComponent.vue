<template>
  <div style="max-width: 600px; margin: 0 auto">
    <div
      style="
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 20px;
      "
    >
      <h2 style="margin: 0">Lobby</h2>
      <NTag :type="isConnected ? 'success' : 'warning'" size="small" round>
        {{ isConnected ? 'Connecté' : 'Connexion...' }}
      </NTag>
    </div>

    <NAlert
      v-if="gameStore.errorMessage"
      type="error"
      style="margin-bottom: 16px"
      closable
      @close="gameStore.errorMessage = null"
    >
      {{ gameStore.errorMessage }}
    </NAlert>

    <!-- En attente d'un adversaire après création -->
    <NAlert
      v-if="gameStore.currentRoomId && !gameStore.errorMessage"
      type="info"
      style="margin-bottom: 16px"
    >
      Room créée — en attente d'un adversaire...
      <NSpin size="small" style="margin-left: 8px" />
    </NAlert>

    <!-- Sélection du deck -->
    <NCard title="Choisir un deck" style="margin-bottom: 20px">
      <div v-if="loadingDecks" style="text-align: center; padding: 16px">
        <NSpin size="medium" />
      </div>
      <NSelect
        v-else
        v-model:value="selectedDeckId"
        :options="deckOptions"
        placeholder="Sélectionnez un deck"
        style="margin-bottom: 12px"
      />
      <NButton
        type="primary"
        :disabled="!selectedDeckId || !!gameStore.currentRoomId"
        :loading="creating"
        @click="handleCreateRoom"
      >
        Créer une room
      </NButton>
    </NCard>

    <!-- Liste des rooms disponibles — RG2 -->
    <NCard title="Rooms disponibles">
      <div
        v-if="!isConnected"
        style="color: #999; text-align: center; padding: 16px"
      >
        <NSpin size="small" /> Connexion au serveur...
      </div>
      <div
        v-else-if="gameStore.rooms.length === 0"
        style="color: #999; text-align: center; padding: 16px"
      >
        Aucune room disponible. Créez-en une !
      </div>

      <div v-else style="display: flex; flex-direction: column; gap: 10px">
        <div
          v-for="room in gameStore.rooms"
          :key="room.id"
          style="
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            border: 1px solid #e8e8e8;
            border-radius: 8px;
          "
        >
          <div>
            <span style="font-weight: 600">{{ room.hostSocketId }}</span>
            <span style="color: #999; font-size: 12px; margin-left: 8px"
              >#{{ room.id }}</span
            >
          </div>
          <NButton
            size="small"
            type="success"
            :disabled="
              !selectedDeckId ||
              joining === room.id ||
              !!gameStore.currentRoomId
            "
            :loading="joining === room.id"
            @click="handleJoinRoom(room.id)"
          >
            Rejoindre
          </NButton>
        </div>
      </div>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { NAlert, NButton, NCard, NSelect, NSpin, NTag } from 'naive-ui'
import { computed, onMounted, ref, watch } from 'vue'

import { useApi } from '../../composables/useApi'
import { useGameStore } from '../../store/game'
import type { Deck } from '../../types'

const gameStore = useGameStore()
const { getMyDecks } = useApi()

const decks = ref<Deck[]>([])
const loadingDecks = ref(false)
const selectedDeckId = ref<number | null>(null)
const creating = ref(false)
const joining = ref<number | null>(null)

const isConnected = computed(() => !gameStore.errorMessage)

const deckOptions = computed(() =>
  decks.value.map((d) => ({ label: d.name, value: d.id })),
)

async function fetchDecks() {
  loadingDecks.value = true
  try {
    decks.value = await getMyDecks()
  } finally {
    loadingDecks.value = false
  }
}

function handleCreateRoom() {
  if (!selectedDeckId.value) return
  creating.value = true
  gameStore.createRoom(selectedDeckId.value)
}

function handleJoinRoom(roomId: number) {
  if (!selectedDeckId.value) return
  joining.value = roomId
  gameStore.joinRoom(roomId, selectedDeckId.value)
}

// Quand la room est créée, arrêter le spinner
watch(
  () => gameStore.currentRoomId,
  (id) => {
    if (id) creating.value = false
  },
)

// Quand erreur, arrêter les spinners
watch(
  () => gameStore.errorMessage,
  (err) => {
    if (err) {
      creating.value = false
      joining.value = null
    }
  },
)

// RG2 — connexion au montage (getRooms est émis automatiquement sur socket 'connect')
onMounted(async () => {
  gameStore.connect()
  await fetchDecks()
})
</script>
