<script setup lang="ts">
import router from '@/router';


async function newGame() {
  console.log(import.meta.env.VITE_BASE_URL)
  const gameId = await fetch(`${import.meta.env.VITE_BASE_URL}api/game/new`)
    .then((r) => r.json())
    .then((d) => d.id)
    .catch((e) => console.log(e));

  if (!gameId) return;

  router.push(`/game/${gameId}`);
}

</script>

<template>
  <h1>Hex Chess</h1>
  <button @click="newGame">Start new game</button>
</template>
