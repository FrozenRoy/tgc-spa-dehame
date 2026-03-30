import { defineStore } from 'pinia'
import { io, type Socket } from 'socket.io-client'
import { computed, ref } from 'vue'

import { useStorage } from '@/composables/useStorage'
import router from '@/router'
import type {
  GameEndedPayload,
  GameState,
  RoomCreatedPayload,
  RoomListItem,
} from '@/types'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL as string
const parsedUrl = new URL(apiBaseUrl)
const SOCKET_URL = parsedUrl.origin
const subPath = parsedUrl.pathname.replace(/\/api$/, '').replace(/\/$/, '')
const SOCKET_PATH = subPath ? `${subPath}/socket.io` : '/socket.io'

interface SocketGamePayload {
  gameState?: GameState
  message?: string
  roomId?: number
}

const isSocketGamePayload = (
  payload: unknown,
): payload is SocketGamePayload => {
  if (typeof payload !== 'object' || payload === null) return false

  const candidate = payload as Record<string, unknown>
  const hasValidMessage =
    candidate.message === undefined || typeof candidate.message === 'string'
  const hasValidRoomId =
    candidate.roomId === undefined || typeof candidate.roomId === 'number'
  const hasValidGameState =
    candidate.gameState === undefined ||
    (typeof candidate.gameState === 'object' && candidate.gameState !== null)

  return hasValidMessage && hasValidRoomId && hasValidGameState
}

export const useGameStore = defineStore('game', () => {
  const storage = useStorage()

  let socket: Socket | null = null

  const socketId = ref<string>('')

  // Lobby
  const rooms = ref<RoomListItem[]>([])
  const currentRoomId = ref<number | null>(null)

  // Game
  const gameState = ref<GameState | null>(null)
  const gameResult = ref<GameEndedPayload | null>(null)
  const isHost = ref(false)
  const message = ref('')
  const errorMessage = ref<string | null>(null)
  const opponentDisconnected = ref(false)

  // Computed
  const isMyTurn = computed(() => {
    if (!gameState.value || !socket) return false
    return gameState.value.currentPlayerSocketId === socketId.value
  })

  const myBoard = computed(() => {
    if (!gameState.value) return null
    if (gameState.value.host.socketId === socketId.value) {
      return gameState.value.host.board
    }
    return gameState.value.guest.board
  })

  const opponentBoard = computed(() => {
    if (!gameState.value) return null
    if (gameState.value.host.socketId === socketId.value) {
      return gameState.value.guest.board
    }
    return gameState.value.host.board
  })

  // Connection
  const connect = () => {
    if (socket) return
    const token = storage.get<string>('token')
    socket = io(SOCKET_URL, { path: SOCKET_PATH, auth: { token } })

    socket.on('connect', () => {
      socketId.value = socket?.id ?? ''
      socket?.emit('getRooms')
    })

    socket.on('roomsList', (data: RoomListItem[]) => {
      rooms.value = data
    })

    socket.on('roomsListUpdated', (data: RoomListItem[]) => {
      rooms.value = data
    })

    socket.on('roomCreated', (data: RoomCreatedPayload) => {
      isHost.value = true
      currentRoomId.value = data.roomId
    })

    socket.on('gameStarted', (payload: unknown) => {
      if (!isSocketGamePayload(payload)) return

      if (payload.gameState) {
        gameState.value = JSON.parse(JSON.stringify(payload.gameState))
        message.value = payload.message ?? ''
        currentRoomId.value = payload.gameState.roomId
        router.push('/game')
      } else if (payload.roomId !== undefined) {
        gameState.value = JSON.parse(JSON.stringify(payload))
        currentRoomId.value = payload.roomId
        router.push('/game')
      }
    })

    socket.on('gameStateUpdated', (payload: unknown) => {
      if (!isSocketGamePayload(payload)) return

      if (payload.gameState) {
        gameState.value = JSON.parse(JSON.stringify(payload.gameState))
        if (payload.message !== undefined) message.value = payload.message
      } else if (payload.roomId !== undefined) {
        gameState.value = JSON.parse(JSON.stringify(payload))
      }
    })

    socket.on('gameEnded', (payload: GameEndedPayload) => {
      gameResult.value = payload
      if (payload.message) message.value = payload.message
    })

    socket.on('opponentDisconnected', () => {
      opponentDisconnected.value = true
    })

    socket.on('error', (err: { message: string } | string) => {
      errorMessage.value = typeof err === 'string' ? err : err.message
    })

    socket.on('connect_error', (err) => {
      errorMessage.value = `Connexion impossible : ${err.message}`
    })
  }

  const disconnect = () => {
    socket?.disconnect()
    socket = null
  }

  // Lobby actions
  const createRoom = (deckId: number) => {
    if (!socket) {
      errorMessage.value = 'Connexion non établie'
      return
    }
    socket.emit('createRoom', { deckId })
    // getRooms will just fetch the list, but it's okay to call
    setTimeout(() => socket?.emit('getRooms'), 300)
  }
  const joinRoom = (roomId: number, deckId: number) => {
    if (!socket) {
      errorMessage.value = 'Connexion non établie'
      return
    }
    isHost.value = false
    currentRoomId.value = roomId
    socket.emit('joinRoom', { roomId, deckId })
  }

  // Game actions
  const drawCards = () => {
    if (!socket || currentRoomId.value === null) return
    socket.emit('drawCards', { roomId: currentRoomId.value })
  }
  const playCard = (cardIndex: number) => {
    if (!socket || currentRoomId.value === null) return
    socket.emit('playCard', { roomId: currentRoomId.value, cardIndex })
  }
  const attack = () => {
    if (!socket || currentRoomId.value === null) return
    socket.emit('attack', { roomId: currentRoomId.value })
  }
  const endTurn = () => {
    if (!socket || currentRoomId.value === null) return
    socket.emit('endTurn', { roomId: currentRoomId.value })
  }

  const resetGame = () => {
    gameState.value = null
    gameResult.value = null
    isHost.value = false
    currentRoomId.value = null
    message.value = ''
    errorMessage.value = null
    opponentDisconnected.value = false
    rooms.value = []
  }

  return {
    rooms,
    currentRoomId,
    gameState,
    gameResult,
    isHost,
    message,
    errorMessage,
    opponentDisconnected,
    isMyTurn,
    myBoard,
    opponentBoard,
    connect,
    disconnect,
    createRoom,
    joinRoom,
    drawCards,
    playCard,
    attack,
    endTurn,
    resetGame,
  }
})
