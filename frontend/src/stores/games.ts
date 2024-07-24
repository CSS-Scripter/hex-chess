import { defineStore } from "pinia";

export const useGamesStore = defineStore('games', () => {
    const storeGame = (id: string, color: string, token: string) => {
        const game = {id, color, token};
        localStorage.setItem(`game-${id}`, JSON.stringify(game));
    }

    const getGame = (id: string) => {
        const gameString = localStorage.getItem(`game-${id}`);
        if (!gameString) return;

        return JSON.parse(gameString);
    }

    return { storeGame, getGame };
});
