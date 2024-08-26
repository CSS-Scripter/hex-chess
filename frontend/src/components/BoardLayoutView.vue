<script setup lang="ts">
import type { Tile } from '@/lib/board';
import { defineProps } from 'vue';

defineProps(['board', 'color']);
const emit = defineEmits(['click']);

function findTopMargin(rowSize: number, i: number) {
        const center = Math.ceil(rowSize / 2) - 1;
        const distanceFromCenter = Math.abs(center - i);
        const screenWidth = window.innerWidth;
        let gap = -26;
        // if (screenWidth < 600) gap = -19;
        // if (screenWidth < 420) gap = -14;
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
            <div class="outline"
                v-for="(tile, x) in row"
                :style="{'margin-top': findTopMargin(row.length, x)}"
            >
                <div
                    class="tile"
                    :class="{[getTileGradient(tile)]: true, [tile.color]: true, highlight: tile.highlighted, [`highlight-${tile.highlight}`]: true}"
                    @click="() => emit('click', tile)"
                >
                    {{ tile.piece.charAt(0) ?? '' }}
                </div>
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

<svg style="visibility: hidden; position: absolute;" width="0" height="0" xmlns="http://www.w3.org/2000/svg" version="1.1">
  <defs>
        <filter id="round">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />    
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop"/>
        </filter>
    </defs>
</svg>
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
    margin-top: 5px;
}

.outline {
    display: block;
    width: 55px;
    height: 50px;
    background: black;
    clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);    
    margin-left: -2px;
    margin-right: -2px;
    text-align: center;
    font-size: 30px;
    color: white;
    filter:url(#round);
    position: relative;
}

.row .tile {
    position: absolute;
    left: 2px;
    top: 2px;
    display: block;
    width: 50px;
    height: 45px;
    clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
    filter:url(#round);
    transition-duration: 200ms;
}

.row .tile:hover, .row .tile.highlight, .row .tile.tile.highlight-check, .row .tile.tile.tile.highlight-last-move, .row .tile.tile.highlight-move {
    width: 55px;
    height: 50px;
    top: 0;
    left: 0;
}

.tile.black {
    color: black;
}

.tile.white {
    color: white;
}

.tile.light {
    background-color: #88aaee;
}

.tile.medium {
    background-color: #ff6b6b;
}

.tile.dark {
    background-color: #7fbc8c;
}

.row .tile.legend {
    background: none;
    color: black;
}


.tile.highlight {
    background-color: #ffdc58;
}

/* .tile.highlight.light {
    background-color: #efef8f;
}
.tile.highlight.medium {
    background-color: #d9cd60;
}
.tile.highlight.dark {
    background-color: #c2ad35;
} */



.tile.highlight-last-move {
    background-color: #fd9745;
}

.tile.highlight-move {
    background-color: #5d68ce;
}

.tile.highlight-check {
    background-color: #fd9745;
}

@media (max-width: 600px) {
    .row .outline {
        width: 40px;
        height: 36px;
        margin-left: -4px;
        margin-right: -4px;
        font-size: 24px;
    }
}

@media (max-width: 420px) {
    .row .outline {
        width: 30px;
        height: 27px;
        margin-left: -3px;
        margin-right: -3px;
        font-size: 18px;
    }
}
</style>