<template>
  <div style="padding: 24px">
    <LobbyComponent />
    <div style="margin-top: 36px">
      <DeckList />
    </div>
  </div>
</template>

<script setup lang="ts">
import DeckList from '../components/DeckList.vue'
import LobbyComponent from '../components/game/LobbyComponent.vue'
</script>
