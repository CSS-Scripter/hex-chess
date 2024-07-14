<script lang="ts">
import { io } from "socket.io-client";
import { onMount } from "svelte";

const socket = io("http://localhost:3000/aaa-aaa-aaa-aaa-aaa", { path: "/api" });
const messages = [] as string[];

onMount(() => {

    try {
        socket.send("message", "message")
    } catch (e) {
        const err = e as Error;
        messages.push(err.message);
    }
})
</script>

<h1>Messages: </h1>
{#each messages as message}
    <p>{message}</p>
{/each}