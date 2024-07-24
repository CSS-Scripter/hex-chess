<script lang="ts">
import { goto } from "$app/navigation";
import { PUBLIC_BASE_URL } from "$env/static/public";

async function createGame() {
    const gameId = await fetch(`${PUBLIC_BASE_URL}/api/game/new`)
        .then((r) => r.json())
        .then((d) => d.id)
        .catch((e) => console.log(e));
    if (!gameId) return;


    goto(`/game/${gameId}`);
}
</script>


<h1>Hexagonal Chess</h1>
<button on:click={createGame}>New game</button>
