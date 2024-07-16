<script lang="ts">
	import { goto } from '$app/navigation';
	import { AuthStore } from '$lib/authStore';
	import { Board, Color, Piece, type Tile } from '$lib/board';
	import { io } from 'socket.io-client';
	import { onMount } from 'svelte';

    export let data;
    const gameId = data.gameId;

    let boardObj: Board;
    let socket;
    let yourColor: Color;

    onMount(() => {
        const gameStore = new AuthStore();
        const game = gameStore.getGame(gameId);
        let query = { join_as: "new" };
        let auth = {};
        if (!!game) {
            query = {
                join_as: game.color === Color.WHITE ? "white" : "black",
            };
            auth = { token: game.token };
        }

        socket = io("http://localhost:3000/" + gameId, {
            query, auth,
            path: "/api"
        });

        socket.on("error", ({ status, message }) => {
            console.error(`${status}: ${message}`);
            goto("/")
        });

        socket.on("joined", (data) => {
            const color = data.color === 'black' ? Color.BLACK : Color.WHITE;
            const token = data.token;
            gameStore.storeGame(gameId, color, token);

            yourColor = color;
        });

        socket.on("game_update", (data) => {
            const currentMove = data.currentToMove === 'white' ? Color.WHITE : Color.BLACK;
            const tiles = data.board;
            boardObj = new Board(tiles);
       })
    });

    $: board = boardObj?.getBoard();

    function findTopMargin(rowSize: number, i: number) {
        const center = Math.ceil(rowSize / 2) - 1;
        const distanceFromCenter = Math.abs(center - i);
        return distanceFromCenter * -22;
    }

    function getTileGradient(x: number, y: number) {
        const tile = board[y][x];
        const gradients = ["light", "medium", "dark"];
        return gradients[tile.gradient];
    }

    function onTileClick(tile: Tile) {}
</script>

<h1>{gameId}</h1>


{#if board}
<div class="board">
    {#each board as row, y }
        <div class="row">
            <div
                class="tile legend"
                style="margin-top: {findTopMargin(row.length, -1)}px"
            >
                {row[0].name.slice(1)}
            </div>

            {#each row as tile, x}
                <!-- svelte-ignore a11y-mouse-events-have-key-events -->
                <!-- svelte-ignore a11y-no-static-element-interactions -->
                <div
                    class="tile {getTileGradient(x, y)}"
                    class:highlight={tile.highlighted}
                    style="margin-top: {findTopMargin(row.length, x)}px; color: {tile.color === Color.WHITE ? 'white' : 'black'};"
                    on:mousedown={() => onTileClick(tile)}
                >
                {#if tile.piece !== Piece.EMPTY}
                    {#if tile.color === Color.WHITE}
                        {tile.piece.charAt(0)}
                    {:else}
                        {tile.piece.charAt(1)}
                    {/if}
                {/if}
                <!-- {tile.name} -->
            </div>
            {/each}

        </div>
    {/each}

    <div class="row">
        <div class="tile legend" style="margin-top: {findTopMargin(11, -1)}px"></div>
        <div class="tile legend" style="margin-top: {findTopMargin(11, 0)}px">a</div>
        <div class="tile legend" style="margin-top: {findTopMargin(11, 1)}px">b</div>
        <div class="tile legend" style="margin-top: {findTopMargin(11, 2)}px">c</div>
        <div class="tile legend" style="margin-top: {findTopMargin(11, 3)}px">d</div>
        <div class="tile legend" style="margin-top: {findTopMargin(11, 4)}px">e</div>
        <div class="tile legend" style="margin-top: {findTopMargin(11, 5)}px">f</div>
        <div class="tile legend" style="margin-top: {findTopMargin(11, 6)}px">g</div>
        <div class="tile legend" style="margin-top: {findTopMargin(11, 7)}px">h</div>
        <div class="tile legend" style="margin-top: {findTopMargin(11, 8)}px">i</div>
        <div class="tile legend" style="margin-top: {findTopMargin(11, 9)}px">k</div>
        <div class="tile legend" style="margin-top: {findTopMargin(11, 10)}px">l</div>
    </div>
</div>
{/if}


<style>
    * {
        user-select: none;
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
        /* line-height: 40px; */
        font-size: 30px;
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
     

</style>
