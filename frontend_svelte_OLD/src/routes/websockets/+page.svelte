<script lang="ts">
import { io } from "socket.io-client";
import { onDestroy, onMount } from "svelte";

const socket = io("http://localhost:3000/aaaaa-aaaaa-aaaaa-aaaaa-aaaaa", { path: "/api" });
let messages = [] as string[];

onMount(() => {
    socket.on("error", (msg) => {
        messages = [...messages, "Error: " + msg];
    });

    socket.on("message", (msg) => {
        console.log(msg);
        messages = [...messages, "Message: " + msg];
    });

    socket.on("join", (msg) => {
        messages = [...messages, "Joined: " + msg];
    });

    socket.on("board", (msg) => {
        console.log(msg);
    })
});

onDestroy(() => {
    socket.disconnect();
})

$: messages = messages;
</script>

<h1>Messages: </h1>
{#each messages as message}
    <p>{message}</p>
{/each}