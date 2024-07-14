import { Socket } from "socket.io";
import { Board } from "./board";
import { Color } from "./color";

export class Game {
    public id: string;
    public board: Board;
    public currentTurn: Color;

    public playerWhite: Socket | undefined;
    public playerBlack: Socket | undefined;

    constructor() {
        this.id = crypto.randomUUID();
        this.board = new Board();
        this.currentTurn = Color.WHITE;
    }

    public switchTurn() {
        if (this.currentTurn === Color.BLACK) {
            this.currentTurn = Color.WHITE;
        } else {
            this.currentTurn = Color.BLACK;
        }
    }

    public registerPlayer(socket: Socket) {
        if (!this.playerWhite) {
            this.playerWhite = socket;
            return Color.WHITE;
        }

        if (!this.playerBlack) {
            this.playerBlack = socket;
            return Color.BLACK;
        }

        throw new Error("both spots in the game are populated");
    }
}