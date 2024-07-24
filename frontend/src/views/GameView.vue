<script setup lang="ts">
import { Board, type Tile } from '@/lib/board';
import { useGamesStore } from '@/stores/games';
import { io, type Socket } from 'socket.io-client';
import { onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const gameID = route.params.id instanceof Array ? route.params.id[0] : route.params.id;
const gameStore = useGamesStore();
const board = ref(undefined as Board|undefined);

let socket: Socket;
let yourColor: string;
let state = ref('joining game...');
let awaitingOtherPlayer: boolean = true;
let selectedTile: Tile | undefined = undefined;

let showPromotionDialog = ref(false);
let promotionPromise: Promise<string> | undefined;
let promotionPromiseResolve: ((choice: string) => void) | undefined;


onBeforeMount(() => {
    const game = gameStore.getGame(gameID);
    let query = { join_as: "new" };
    let auth = {};
    if (!!game) {
        query.join_as = game.color;
        auth = { token: game.token };
    }

    socket = io(`${import.meta.env.VITE_BASE_URL}${gameID}`, {
        query, auth, path: "/ws"
    });

    socket.on("error", ({ status, message }) => {
        console.error(`${status}: ${message}`);
    });

    socket.on("joined", (data) => {
        const color = data.color;
        const token = data.token;
        gameStore.storeGame(gameID, color, token);

        yourColor = color;
    });

    socket.on("game_update", (data) => {
        const tiles = data.board;
        board.value = new Board(tiles);

        const currentToMove = data.currentToMove;
        awaitingOtherPlayer = data.awaitingPlayer;
        if (awaitingOtherPlayer) {
            state.value = "waiting for other player to join...";
        } else {
            if (currentToMove === yourColor) {
                state.value = "Your turn!"
            } else {
                state.value = "opponents turn..."
            }
        }
    });

    socket.on("allowed_moves", ({ allowed }) => {
        board.value?.highlightTiles(allowed);
    })
});

function findTopMargin(rowSize: number, i: number) {
        const center = Math.ceil(rowSize / 2) - 1;
        const distanceFromCenter = Math.abs(center - i);
        return `${distanceFromCenter * -22}px`;
    }

function getTileGradient(tile: Tile) {
    const gradients = ["light", "medium", "dark"];
    return gradients[tile.gradient];
}

async function onTileClick(tile: Tile) {
    if (tile.highlighted && selectedTile) {
        const from = selectedTile.name;
        const to = tile.name;
        if (from === to) {
            selectedTile = undefined;
            board.value?.clearHighlight();
            return;
        }

        let promotion: string | undefined;
        if (requiresPromotionChoise(tile)) {
            promotion = await requestPromotion();
        }

        socket.emit("move", { from, to, promotion });
    } else if (tile.piece !== '') {
        selectedTile = tile;
        socket.emit("get_allowed_moves", tile.name);
    } else {
        selectedTile = undefined;
        board.value?.clearHighlight();
    }
}

function requiresPromotionChoise(toTile: Tile): boolean {
    if (yourColor === 'white') {
        return [
            'a6', 'b7', 'c8',
            'd9', 'e10', 'f11',
            'g10', 'h9', 'i8',
            'k7', 'l6'
        ].includes(toTile.name);
    } else {
        return [
            'a1', 'b1', 'c1',
            'd1', 'e1', 'f1',
            'g1', 'h1', 'i1',
            'k1', 'l1'
        ].includes(toTile.name);
    }
}

async function requestPromotion(): Promise<string> {
    promotionPromise = new Promise((res) => {
        promotionPromiseResolve = res;
    });

    showPromotionDialog.value = true;

    const choise = await promotionPromise;
    promotionPromise = undefined;
    promotionPromiseResolve = undefined;
    showPromotionDialog.value = false;

    return choise;
}

function copyLinkToClipboard() {
    const link = window.location.href;
    navigator.clipboard.writeText(link);
    alert("link copied to clipboard!");
}

</script>

<template>
    <h1>GameTime</h1>
    <h2>{{ gameID }}</h2>
    <p>{{ state }}</p>
    <button v-if="awaitingOtherPlayer" @click="copyLinkToClipboard">Copy Link</button>

    <div class="board" v-if="!!board" :class="{rotated: yourColor === 'black'}">
        <div class="row" v-for="(row, y) in board.getBoard()">
            <div class="tile legend" :style="{'margin-top': findTopMargin(row.length, -1)}">{{ row[0].name.slice(1) }}</div>
            <div
                v-for="(tile, x) in row"
                class="tile"
                :class="{[getTileGradient(tile)]: true, [tile.color]: true, highlight: tile.highlighted}"
                :style="{'margin-top': findTopMargin(row.length, x)}"
                @click="() => onTileClick(tile)"
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


    <div class="backdrop" v-if="showPromotionDialog">
        <div class="dialog">
            <h1>Choose a promotion piece</h1>
            <div class="options">
                <button @click="() => promotionPromiseResolve?.('rook')">♖</button>
                <button @click="() => promotionPromiseResolve?.('knight')">♘</button>
                <button @click="() => promotionPromiseResolve?.('bischop')">♗</button>
                <button @click="() => promotionPromiseResolve?.('queen')">♕</button>
            </div>
        </div>
    </div>
</template>


<style>
    * {
        user-select: none;
    }

    button {
        border: 1px solid #D1D1D1;
        background: white;
        padding: 8px 12px;
        border-radius: 8px;
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
     

    .backdrop {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.1);
    }

    .dialog {
        position: absolute;
        top: 10vh;
        left: 50%;
        transform: translate(-50%, 0);
        background: white;
        border-radius: 16px;
        padding: 1em;
    }

    .options {
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
    }

    .options button {
        border: 1px solid #D1D1D1;
        border-radius: 4px;
        background: white;
        padding: 8px 12px;
        font-size: 32px;
        font-weight: bold;
    }

    .options button:hover {
        cursor: pointer;
        background: #D1D1D1;
    }

</style>