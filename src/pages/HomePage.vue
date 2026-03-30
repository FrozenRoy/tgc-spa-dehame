<template>
  <div class="home-page">
    <LobbyComponent />
    <div class="home-decks">
      <DeckList />
    </div>
  </div>
</template>

<script setup lang="ts">
import DeckList from '../components/DeckList.vue'
import LobbyComponent from '../components/game/LobbyComponent.vue'
</script>

<style scoped>
.home-page {
  padding: 16px 12px 28px;
}

.home-decks {
  margin-top: 28px;
}

@media (min-width: 768px) {
  .home-page {
    padding: 24px 20px 36px;
  }

  .home-decks {
    margin-top: 36px;
  }
}
</style>
