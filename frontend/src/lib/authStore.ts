import { Color } from "$lib/board";

export class AuthStore {
    public storeGame(id: string, color: Color, token: string) {
        const game = {id, color, token};
        localStorage.setItem(`game-${id}`, JSON.stringify(game));
    }

    public getGame(id: string) {
        const gameString = localStorage.getItem(`game-${id}`);
        if (!gameString) return;

        return JSON.parse(gameString);
    }
}
