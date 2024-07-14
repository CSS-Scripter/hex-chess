import { Board, Color } from "$lib/board";

class Game {
    public readonly board: Board;
    public readonly yourColor: Color;
    private _currentTurn: Color;

    constructor() {
        this.board = new Board();
        this.yourColor = Color.WHITE;
        this._currentTurn = Color.WHITE;
    }

    public get currentColor(): Color {
        return this._currentTurn;
    }

    public switchTurn() {
        if (this._currentTurn === Color.BLACK) {
            this._currentTurn = Color.WHITE;
        } else {
            this._currentTurn = Color.BLACK;
        }
    }
}

let gameInstance = undefined as Game | undefined;

export const GetGame = () => {
    if (!gameInstance) {
        gameInstance = new Game();
    }
    return gameInstance;
}

