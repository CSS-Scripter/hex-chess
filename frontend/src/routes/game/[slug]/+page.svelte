<script lang="ts">
	import { goto } from '$app/navigation';
	import { Color } from '$lib/board';
	import { io } from 'socket.io-client';
	import { onMount } from 'svelte';

    export let data;
    const gameId = data.gameId;

    let socket;
    let yourColor: Color;
    let board = [];

    onMount(() => {
        socket = io("http://localhost:3000/" + gameId, { path: "/api" });
        socket.on("error", (msg) => {
            alert(msg);
            goto("/")
        });

        socket.on("join", (color) => {
            if (color === "white") yourColor = Color.WHITE;
            else yourColor = Color.BLACK;
        })
    });
</script>

<h1>{yourColor}</h1>