<template>
  <div class="lobby">
    <div class="lobby-header">
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
    <NCard title="Choisir un deck" class="lobby-deck-card">
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

      <div v-else class="lobby-room-list">
        <div
          v-for="room in gameStore.rooms"
          :key="room.id"
          class="lobby-room-row"
        >
          <div class="lobby-room-info">
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
            class="lobby-room-btn"
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

<style scoped>
.lobby {
  max-width: 820px;
  margin: 0 auto;
}

.lobby-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.lobby-deck-card {
  margin-bottom: 20px;
}

.lobby-room-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.lobby-room-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px 16px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
}

.lobby-room-info {
  min-width: 0;
}

@media (max-width: 640px) {
  .lobby-room-row {
    flex-direction: column;
    align-items: stretch;
  }

  .lobby-room-btn {
    width: 100%;
  }
}
</style>
