<template>
  <div class="game-page">
    <!-- Chargement ou erreur -->
    <div v-if="!gameStore.gameState" class="game-loading">
      <NSpin size="large" />
      <p style="color: #888; margin-top: 12px">En attente de la partie...</p>
      <p
        v-if="gameStore.errorMessage"
        style="color: #c00; font-size: 12px; margin-top: 8px"
      >
        {{ gameStore.errorMessage }}
      </p>
    </div>

    <!-- Jeu affiché -->
    <template v-else>
      <!-- Affichage de débogage en développement -->
      <div v-if="debugMode" class="game-debug">
        <div class="game-debug-line">
          Rôle: {{ gameStore.isHost ? 'host' : 'guest' }} | Tour:
          {{ gameStore.isMyTurn ? 'Mon tour' : 'Tour adversaire' }} | Score:
          {{ gameStore.myBoard?.score }}/3
        </div>
      </div>

      <PlayerZone
        :board="gameStore.opponentBoard"
        label="Adversaire"
        :is-opponent="true"
      />

      <ActionBar
        :is-my-turn="gameStore.isMyTurn"
        :my-board="gameStore.myBoard"
        :opponent-board="gameStore.opponentBoard"
        :game-message="gameStore.message"
        @draw-cards="handleDrawCards"
        @attack="gameStore.attack()"
        @end-turn="gameStore.endTurn()"
      />

      <PlayerZone
        :board="gameStore.myBoard"
        label="Votre zone"
        :is-opponent="false"
      >
        <PlayerHand
          :hand="gameStore.myBoard?.hand ?? []"
          :deck-count="gameStore.myBoard?.deck?.length ?? 0"
          :is-my-turn="gameStore.isMyTurn"
          :has-active-card="!!gameStore.myBoard?.activeCard"
          @play-card="gameStore.playCard($event)"
        />
      </PlayerZone>
    </template>

    <EndGameModal
      :show="showEndGameModal"
      :result="endGameResult"
      @go-to-lobby="handleGoToLobby"
    />
  </div>
</template>

<script setup lang="ts">
import { NSpin } from 'naive-ui'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import ActionBar from '../components/game/ActionBar.vue'
import EndGameModal from '../components/game/EndGameModal.vue'
import PlayerHand from '../components/game/PlayerHand.vue'
import PlayerZone from '../components/game/PlayerZone.vue'
import { ROUTES } from '../router'
import { useGameStore } from '../store/game'

const gameStore = useGameStore()
const router = useRouter()
const debugMode = ref(import.meta.env.DEV)

const showEndGameModal = computed(
  () => !!gameStore.gameResult || gameStore.opponentDisconnected,
)

const endGameResult = computed<'win' | 'lose' | null>(() => {
  if (gameStore.opponentDisconnected) return 'win'

  const result = gameStore.gameResult
  const state = gameStore.gameState
  if (!result || !state) return null

  const winner = result.winner
  if (winner === 'host' || winner === 'guest') {
    return winner === (gameStore.isHost ? 'host' : 'guest') ? 'win' : 'lose'
  }

  const mySocketId = gameStore.isHost
    ? state.host.socketId
    : state.guest.socketId
  return winner === mySocketId ? 'win' : 'lose'
})

function handleDrawCards() {
  const board = gameStore.myBoard
  if (!board) return

  const cardsToDraw = Math.max(
    0,
    Math.min(5 - board.hand.length, board.deck.length),
  )
  for (let i = 0; i < cardsToDraw; i += 1) {
    gameStore.drawCards()
  }
}

// RG9 — retour au lobby
function handleGoToLobby() {
  gameStore.resetGame()
  router.push(ROUTES.HOME)
}
</script>

<style scoped>
.game-page {
  max-width: 760px;
  margin: 0 auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: calc(100dvh - 64px);
}

.game-loading {
  text-align: center;
  padding: 40px 12px;
}

.game-debug {
  background: #f0f0f0;
  padding: 8px;
  border-radius: 4px;
  font-size: 11px;
  color: #666;
}

.game-debug-line {
  margin-bottom: 6px;
}

@media (min-width: 768px) {
  .game-page {
    padding: 16px;
    gap: 14px;
  }
}
</style>
