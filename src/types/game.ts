// src/types/game.ts
export interface Card {
  id: number
  name: string
  hp: number
  attack: number
  type: string
  pokedexNumber: number
  imgUrl: string
}

export interface ActiveCard {
  id: number
  name: string
  hp: number
  currentHp: number
  attack: number
  type: string
  pokedexNumber: number
  imgUrl: string
}

export interface PlayerBoard {
  activeCard: ActiveCard | null
  hand: Card[]
  deck: Card[]
  score: number
}

export interface PlayerState {
  socketId: string
  board: PlayerBoard
}

export interface GameState {
  roomId: number
  status: string
  currentPlayerSocketId: string
  host: PlayerState
  guest: PlayerState
}

export interface RoomListItem {
  id: number
  hostSocketId: string
}

export interface RoomCreatedPayload {
  roomId: number
  message: string
}

export interface GameStartedPayload {
  message: string
  gameState: GameState
}

export interface GameStateUpdatedPayload {
  message: string
  gameState: GameState
}

export interface GameEndedPayload {
  winner: string
  message: string
}

export interface OpponentDisconnectedPayload {
  message: string
}

export interface ErrorPayload {
  message: string
}

export interface CreateRoomEvent {
  deckId: number
}

export interface JoinRoomEvent {
  roomId: number
  deckId: number
}

export interface DrawCardsEvent {
  roomId: number
}

export interface PlayCardEvent {
  roomId: number
  cardIndex: number
}

export interface AttackEvent {
  roomId: number
}

export interface EndTurnEvent {
  roomId: number
}
