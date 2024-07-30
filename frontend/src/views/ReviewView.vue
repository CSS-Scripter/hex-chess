<script setup lang="ts">
import { Board } from '@/lib/board';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import BoardLayoutView from '@/components/BoardLayoutView.vue';

const route = useRoute();
const gameID = route.params.id instanceof Array ? route.params.id[0] : route.params.id;

const game = ref();
const board = ref(undefined as undefined | Board);
const error = ref('');
const moveIndex = ref(0);
const moveHistory = ref([] as Record<string, any>[]);

onMounted(async () => {
    const response = await fetch('/api/game/' + gameID)
        .then((r) => r.json())
        .catch((e) => error.value = e.message);

    if (!response.ok) {
        error.value = response.msg;
    } else {
        game.value = response.game;
        board.value = new Board(response.board);
        moveHistory.value = response.game.moves;
    }
});

function nextMove() {
    const move = moveHistory.value[moveIndex.value];
    board.value?.doMove(move);
    moveIndex.value++;
}

function previousMove() {
    moveIndex.value--;
    const move = moveHistory.value[moveIndex.value];
    board.value?.revertMove(move);
}

function moveToMove(index: number) {
    if (index === moveIndex.value) return;
    if (index < moveIndex.value) {
        while (index < moveIndex.value) previousMove();
    } else {
        while (index > moveIndex.value) nextMove();
    }
}

</script>

<template>
    <h1>Review</h1>

    <BoardLayoutView :board="board"/>

    <div class="actions">
        <button v-if="moveIndex > 0" @click="previousMove">Previous</button>
        <button v-if="moveIndex < moveHistory.length" @click="nextMove">Next</button>
    </div>

    <div class="moves">
        <div class="index">
            <div class="move" style="color: white">...</div>
            <div class="move" style="color: white">...</div>
            <div class="move" v-for="(_, i) in moveHistory.slice().filter((m) => m.by === 'white')">
                {{ Math.ceil(moveHistory.length / 2) - i }}.
            </div>
        </div>
        <div class="white-moves">
            <div class="move"><b>WHITE</b></div>
            <div class="move">------------</div>
            <div class="move"
                v-for="(move, i) in moveHistory.slice().reverse().filter((m) => m.by === 'white')"
                :class="{ highlight: moveHistory.length - (i * 2) - 1 === moveIndex }"
                @click="() => moveToMove(moveHistory.length - (i * 2) - 1)"
            >
                {{ move.notation }}
            </div>
        </div>
        <div class="black-moves">
            <div class="move"><b>BLACK</b></div>
            <div class="move">------------</div>
            <div class="move" v-if="moveHistory.length % 2 === 1" style="color: white">...</div>
            <div class="move"
                v-for="(move, i) in moveHistory.slice().reverse().filter((m) => m.by === 'black')"
                :class="{ highlight: moveHistory.length - (i * 2) === moveIndex }"
                @click="() => moveToMove(moveHistory.length - (i * 2))"
            >
                {{ move.notation }}
            </div>
        </div>
    </div>
</template>

<style>
.moves {
    display: grid;
    grid-template-columns: 0.3fr 1fr 1fr;
    width: 320px;
    margin: 0 auto;
    border: 1px solid #D1D1D1;
    border-radius: 12px;
    padding: 12px 0;
}

.move {
    text-align: center;
}

.move.highlight {
    color: red;
    font-weight: bold;
}

.index .move {
    text-align: right;
}

.actions {
    display: flex;
    flex-direction: row;
    justify-content: center;
    gap: 18px;
    padding: 1em;
}
</style>
