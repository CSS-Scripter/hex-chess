<script setup lang="ts">
import type { Tile } from '@/lib/board';
import { defineProps } from 'vue';

defineProps(['board', 'color']);
const emit = defineEmits(['click']);

function findTopMargin(rowSize: number, i: number) {
        const center = Math.ceil(rowSize / 2) - 1;
        const distanceFromCenter = Math.abs(center - i);
        const screenWidth = window.innerWidth;
        let gap = -22;
        if (screenWidth < 600) gap = -19;
        if (screenWidth < 420) gap = -14;
        return `${distanceFromCenter * gap}px`;
    }

function getTileGradient(tile: Tile) {
    const gradients = ["light", "medium", "dark"];
    return gradients[tile.gradient];
}

</script>

<template>
    <div class="board" v-if="!!board" :class="{rotated: color === 'black'}">
        <div class="row" v-for="(row, y) in board.getBoard()">
            <div class="tile legend" :style="{'margin-top': findTopMargin(row.length, -1)}">{{ row[0].name.slice(1) }}</div>
            <div
                v-for="(tile, x) in row"
                class="tile"
                :class="{[getTileGradient(tile)]: true, [tile.color]: true, highlight: tile.highlighted, [`highlight-${tile.highlight}`]: true}"
                :style="{'margin-top': findTopMargin(row.length, x)}"
                @click="() => emit('click', tile)"
                >
                    {{ tile.piece.charAt(0) ?? '' }}
                </div>

        </div>
        <div class="row">
            <div class="tile legend" :style="{'margin-top': findTopMargin(11, -1)}"></div>
            <div class="tile legend" :style="{'margin-top': findTopMargin(11, 0)}">a</div>
            <div class="tile legend" :style="{'margin-top': findTopMargin(11, 1)}">b</div>
            <div class="tile legend" :style="{'margin-top': findTopMargin(11, 2)}">c</div>
            <div class="tile legend" :style="{'margin-top': findTopMargin(11, 3)}">d</div>
            <div class="tile legend" :style="{'margin-top': findTopMargin(11, 4)}">e</div>
            <div class="tile legend" :style="{'margin-top': findTopMargin(11, 5)}">f</div>
            <div class="tile legend" :style="{'margin-top': findTopMargin(11, 6)}">g</div>
            <div class="tile legend" :style="{'margin-top': findTopMargin(11, 7)}">h</div>
            <div class="tile legend" :style="{'margin-top': findTopMargin(11, 8)}">i</div>
            <div class="tile legend" :style="{'margin-top': findTopMargin(11, 9)}">k</div>
            <div class="tile legend" :style="{'margin-top': findTopMargin(11, 10)}">l</div>
        </div>
    </div>
</template>

<style>

.board {
    margin: 20px 0;
}

.rotated {
    transform: rotate(180deg);
}

.rotated .tile {
    transform: rotate(180deg);
}

.row {
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 0 auto;
    margin-top: 1px;
}

.row .tile {
    display: block;
    width: 50px;
    height: 45px;
    background: black;
    clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
    margin-left: -5px;
    margin-right: -5px;
    text-align: center;
    font-size: 30px;
    color: white;
}

.tile.black {
    color: black;
}

.tile.white {
    color: white;
}

.tile.light {
    background-color: #FFCF9F;
}

.tile.light:hover {
    background-color: #EFBF8F;
}

.tile.medium {
    background-color: #E9AD70;
}

.tile.medium:hover {
    background-color: #D99D60;
}

.tile.dark {
    background-color: #D28D45;
}

.tile.dark:hover {
    background: #C27D35;
}

.row .tile.legend {
    background: none;
    color: black;
}


.tile.highlight.light {
    background-color: #efef8f;
}
.tile.highlight.medium {
    background-color: #d9cd60;
}
.tile.highlight.dark {
    background-color: #c2ad35;
}



.tile.highlight-last-move {
    background-color: #f25d15;
}

.tile.highlight-move {
    background-color: #5d68ce;
}

@media (max-width: 600px) {
    .row .tile {
        width: 40px;
        height: 36px;
        margin-left: -4px;
        margin-right: -4px;
        font-size: 24px;
    }
}

@media (max-width: 420px) {
    .row .tile {
        width: 30px;
        height: 27px;
        margin-left: -3px;
        margin-right: -3px;
        font-size: 18px;
    }
}
</style>