import { randomBytes } from "crypto";
import { Socket } from "socket.io";
import { Board } from "./board";
import { Color } from "./color";

export type Player = {
    socket: Socket;
    color: Color;
    token: string;
};

export class Game {
    public id: string;
    public board: Board;
    public currentTurn: Color;

    public playerWhite: Player | undefined;
    public playerBlack: Player | undefined;

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

    public registerPlayer(socket: Socket): Player {
        const player = { socket, token: this.generateToken() } as Player;
        if (!this.playerWhite) {
            player.color = Color.WHITE;
            this.playerWhite = player;
            return player;
        }

        if (!this.playerBlack) {
            player.color = Color.BLACK;
            this.playerBlack = player;
            return player;
        }

        throw new Error("both spots in the game are populated");
    }

    public login(player: Player) {
        if (player.color === Color.WHITE && !!this.playerWhite && this.playerWhite.token === player.token) {
            this.playerWhite.socket = player.socket;
            return;
        }
        if (player.color === Color.BLACK && !!this.playerBlack && this.playerBlack.token === player.token) {
            this.playerBlack.socket = player.socket;
            return;
        }

        throw new Error("unauthorized");
    }

    private generateToken(): string {
        return randomBytes(48).toString('hex');
    }
}