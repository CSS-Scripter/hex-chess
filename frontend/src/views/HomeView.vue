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
  <section class="homepage">
    <h1>CHEX CLUB</h1>
    <p class="tagline">Chess, but hexagonal!</p>

    <button class="big yellow" @click="newGame">Start new game</button>

    <h2>How do pieces move?</h2>
    <div class="movesets">
      <div class="move">
        <h3>King</h3>
        <p>The king is allowed to move to each adjecant tile, including diagonals</p>
        <div class="spacer"></div>
        <button popovertarget="king_movement" class="blue">Show me</button>
      </div>

      <div class="move">
        <h3>Queen</h3>
        <p>The queen is allowed to do the same moves as the rook and bischop combined. It can move along all adjescant and diagonal tiles for any amount of tiles necessary</p>
        <div class="spacer"></div>
        <button popovertarget="queen_movement" class="red">Show me</button>
      </div>

      <div class="move">
        <h3>Rook</h3>
        <p>The rook is allowed to move along all adjecant directions</p>
        <div class="spacer"></div>
        <button popovertarget="rook_movement" class="orange">Show me</button>
      </div>

      <div class="move">
        <h3>Bischop</h3>
        <p>The rook is allowed to move along all diagonals</p>
        <div class="spacer"></div>
        <button popovertarget="bischop_movement" class="purple">Show me</button>
      </div>

      <div class="move">
        <h3>Knight</h3>
        <p>The knight moves 2 steps in any adjecant direction, and 1 in an outgoing adjecant direction</p>
        <div class="spacer"></div>
        <button popovertarget="knight_movement" class="green">Show me</button>
      </div>

      <div class="move">
        <h3>Pawn</h3>
        <p>
          Pawns are allowed to double move on their first turn. Double moving allowes the opponent to take en passant.
          Pawns can take pieces that are adjecant in front of them. Getting a pawn to the final row of the board, allows promotion.
        </p>
        <div class="spacer"></div>
        <button popovertarget="pawn_movement" class="yellow">Show me</button>
      </div>

      <div id="queen_movement" class="img" popover>
        <img src="@/assets/images/queen_movement.png" alt="Queen's allowed moves">
      </div>

      <div id="rook_movement" class="img" popover>
        <img src="@/assets/images/rook_movement.png" alt="Rook's allowed moves">
      </div>

      <div id="bischop_movement" class="img" popover>
        <img src="@/assets/images/bischop_movement.png" alt="Bischop's allowed moves">
      </div>

      <div id="king_movement" class="img" popover>
        <img src="@/assets/images/king_movement.png" alt="King's allowed moves">
      </div>

      <div id="knight_movement" class="img" popover>
        <img src="@/assets/images/knight_movement.png" alt="Knight's allowed moves">
      </div>

      <div id="pawn_movement" class="img" popover>
        <img src="@/assets/images/pawn_movement.png" alt="Pawn's allowed moves">
      </div>
    </div>
    
  </section>
</template>

<style scoped>

section.homepage {
  width: max(320px, 70vw);
  margin: 0 auto;
  text-align: center;
}

button.big {
  font-size: 1.5em;
  padding: 1em;
}

h1 {
  margin-bottom: 0;
  font-weight: 1200;
}

.tagline {
  margin-top: 0;
  font-size: 32px;
  font-style: italic;
}

.movesets {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
  gap: 32px;
}

.movesets h3 {
  margin-top: 0;
  padding: 0;
  text-transform: uppercase;
}

.move {
  background-color: #fff;
  border: 4px solid black;
  box-shadow: 4px 4px 0 0 black;
  border-radius: 8px;
  padding: 1.5em;
  flex-grow: 1;
  max-width: clamp(280px, 25vw, 350px);
  transition-duration: 200ms;
  transition-property: transform box-shadow;

  display: flex;
  flex-direction: column;
}

.spacer {
  display: block;
  width: 1px;
  flex: 1;
}


.img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: max(300px, 50vw);
  height: max(350px, 55vw);
  margin: 0 auto;

  border-radius: 8px;
  border: 4px solid black;
  box-shadow: 4px 4px 0 0 black;

  overflow-y: hidden;
  background-color: #fafafa;
}

.move:hover {
  transform: translate(4px, 4px);
  box-shadow: 0 0 0 0 black;
}

.move:hover button {
  translate: transform(-4px, -4px);
  box-shadow: 8px 8px 0 0 black;
}

.move:hover button:hover {
  translate: transform(4px, 4px);
  box-shadow: 0 0 0 0 black;
}
</style>
