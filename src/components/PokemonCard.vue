<template>
  <div
    :style="{
      border: selected ? '2px solid #2080f0' : '1.5px solid #e8e8e8',
      borderRadius: '10px',
      padding: size === 'sm' ? '8px 6px' : '12px 10px',
      textAlign: 'center',
      background: selected ? '#f0f7ff' : '#fff',
      opacity: disabled ? 0.4 : 1,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: size === 'sm' ? '3px' : '5px',
      transition: 'border-color 0.15s, background 0.15s, opacity 0.15s',
      userSelect: 'none',
    }"
    @click="handleClick"
  >
    <img
      :src="card.imgUrl"
      :alt="card.name"
      :style="{
        width: size === 'sm' ? '58px' : '88px',
        height: size === 'sm' ? '58px' : '88px',
        objectFit: 'contain',
      }"
    />
    <div :style="{ fontSize: size === 'sm' ? '10px' : '12px', color: '#bbb' }">
      #{{ card.pokedexNumber }}
    </div>
    <div
      :style="{ fontSize: size === 'sm' ? '12px' : '14px', fontWeight: 600 }"
    >
      {{ card.name }}
    </div>
    <div
      :style="{
        display: 'flex',
        padding: '2px 9px',
        borderRadius: '12px',
        fontSize: size === 'sm' ? '10px' : '11px',
        color: '#fff',
        fontWeight: 500,
        background: getTypeColor(card.type),
      }"
    >
      {{ card.type }}
    </div>

    <!-- HP bar (affiché si currentHp est fourni) -->
    <div
      v-if="currentHp !== undefined"
      style="
        width: 100%;
        height: 5px;
        background: #eee;
        border-radius: 3px;
        overflow: hidden;
      "
    >
      <div
        :style="{
          height: '100%',
          width: hpPercent + '%',
          background: hpBarColor,
          borderRadius: '3px',
          transition: 'width 0.3s',
        }"
      />
    </div>

    <div
      :style="{
        fontSize: size === 'sm' ? '10px' : '12px',
        color: '#666',
        display: 'flex',
        gap: '8px',
      }"
    >
      <span>❤️ {{ card.hp }}</span>
      <span>⚔️ {{ card.attack }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useColors } from '../composables/useColors'
import type { Card } from '../types'

const props = withDefaults(
  defineProps<{
    card: Card
    size?: 'sm' | 'md'
    selected?: boolean
    disabled?: boolean
    currentHp?: number
  }>(),
  { size: 'md', selected: false, disabled: false },
)

const emit = defineEmits<{ click: [] }>()

const { getTypeColor, hpColor } = useColors()

const hpPercent = computed(() =>
  props.currentHp !== undefined
    ? Math.min(100, Math.round((props.currentHp / props.card.hp) * 100))
    : 0,
)

const hpBarColor = computed(() => hpColor(hpPercent.value))

function handleClick() {
  if (!props.disabled) emit('click')
}
</script>
