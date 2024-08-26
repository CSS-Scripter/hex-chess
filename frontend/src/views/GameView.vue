<script setup lang="ts">
import BoardLayoutView from '@/components/BoardLayoutView.vue';
import { Board, type Tile } from '@/lib/board';
import router from '@/router';
import { useGamesStore } from '@/stores/games';
import { io, type Socket } from 'socket.io-client';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const gameID = route.params.id instanceof Array ? route.params.id[0] : route.params.id;
const gameStore = useGamesStore();
const board = ref(undefined as Board|undefined);
const forceRerenderVar = ref(0);
const moveHistory = ref([] as Record<string, any>[]);

const gameFinished = ref(false);
const finishReason = ref("");
const showForfeitDialog = ref(false);
const inCheck = ref(false);

let socket: Socket;
let yourColor: string;
let state = ref('joining game...');
let awaitingOtherPlayer: boolean = true;
let selectedTile: Tile | undefined;

let showPromotionDialog = ref(false);
let promotionPromise: Promise<string> | undefined;
let promotionPromiseResolve: ((choice: string) => void) | undefined;


onMounted(() => {
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

        moveHistory.value = data.moves;
        board.value?.clearHighlightLabels();
        highlightLastMove();

        const finished = data.finished;
        const outcome = data.outcome;
        const winner = data.winner;
        
        if (finished) {
            gameFinished.value = true;
            finishReason.value = `player ${winner} won by ${outcome}`;
        }

        const lastMove = moveHistory.value.slice(-1)[0];
        if (lastMove && lastMove.by !== yourColor) {
            inCheck.value = lastMove.checked;
        } else {
            inCheck.value = false;
        }

        if (inCheck.value) {
            board.value.highlightWithLabelByPiece('♔♚', yourColor, "check");
        }
    });

    socket.on("allowed_moves", ({ allowed }) => {
        board.value?.highlightTiles(allowed);
    });

    window.onresize = () => forceRerenderVar.value += 1;
});


async function onTileClick(tile: Tile) {
    if (selectedTile?.name === tile.name) {
        selectedTile = undefined;
        board.value?.clearHighlight();
        highlightLastMove();
        return;
    }
    if (tile.highlighted && selectedTile) {
        const from = selectedTile.name;
        const to = tile.name;
        let promotion: string | undefined;
        if (requiresPromotionChoise(selectedTile, tile)) {
            promotion = await requestPromotion();
        }

        socket.emit("move", { from, to, promotion });
    } else if (tile.piece !== '') {
        selectedTile = tile;
        socket.emit("get_allowed_moves", tile.name);
    } else {
        selectedTile = undefined;
        board.value?.clearHighlight();
        highlightLastMove();
    }
}

function requiresPromotionChoise(fromTile: Tile, toTile: Tile): boolean {
    if (fromTile.piece !== '♙♟︎') return false;
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

function highlightLastMove() {
    if (moveHistory.value.length > 0) {
        const lastMove = moveHistory.value.slice(-1)[0];
        if (lastMove.by !== yourColor)
            board.value?.highlightWithLabel([lastMove.from, lastMove.to], 'last-move');
    }
}

function highlightMove(move: Record<string, any>) {
    board.value?.clearHighlightLabels();
    board.value?.highlightWithLabel([move.from, move.to], 'move');
    highlightLastMove();
}

function removeMoveHighlight() {
    board.value?.clearHighlightLabels();
    highlightLastMove();
}

function gotostart() {
    router.push('/');
}

function gotoReview() {
    router.push(`/review/${gameID}`);
}

function openForfeitDialog() {
    showForfeitDialog.value = true;
}

function cancelForfeit() {
    showForfeitDialog.value = false;    
}

function forfeit() {
    socket.emit('forfeit');
    showForfeitDialog.value = false;
}

</script>

<template>
    <div class="center">
        <p>{{ state }} {{ inCheck ? "You're in check!" : '' }}</p>
        <div class="actions">
            <button v-if="awaitingOtherPlayer" @click="copyLinkToClipboard">Copy Link</button>
            <button @click="openForfeitDialog">Forfeit</button>
        </div>
    </div>

    <BoardLayoutView :board="board" :color="yourColor" @click="onTileClick" :key="forceRerenderVar" />

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
            <div class="move" v-for="(move, i) in moveHistory.slice().reverse().filter((m) => m.by === 'white')" @mouseleave="() => removeMoveHighlight()" @mouseenter="() => highlightMove(move)">
                {{ move.notation }}
            </div>
        </div>
        <div class="black-moves">
            <div class="move"><b>BLACK</b></div>
            <div class="move">------------</div>
            <div class="move" v-if="moveHistory.length % 2 === 1" style="color: white">...</div>
            <div class="move" v-for="(move, i) in moveHistory.slice().reverse().filter((m) => m.by === 'black')" @mouseleave="() => removeMoveHighlight()" @mouseenter="() => highlightMove(move)">
                {{ move.notation }}
            </div>
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

    <div class="backdrop" v-if="gameFinished">
        <div class="dialog">
            <h3>{{ finishReason }}</h3>
            <div class="actions">
                <button @click="gotostart()">Back to start</button>
                <button @click="gotoReview()">Review Game</button>
            </div>
        </div>
    </div>

    <div class="backdrop" v-if="showForfeitDialog">
        <div class="dialog">
            <h3>Forfeit</h3>
            <p>Are you sure?</p>
            <div class="actions">
                <button @click="cancelForfeit">Cancel</button>
                <button @click="forfeit">Yes</button>
            </div>
        </div>
    </div>

</template>


<style>
    * {
        user-select: none;
    }

    .center {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 2em;
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

    .index .move {
        text-align: right;
    }

    
</style>
