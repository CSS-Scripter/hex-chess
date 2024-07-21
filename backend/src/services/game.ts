import { randomBytes } from "crypto";
import { Socket } from "socket.io";
import { Color, getOppositeColor } from "../types/color";
import { Board } from "./board";

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

    public finished: boolean = false;
    public winner: Color = Color.NONE;
    public outcome: string = '';

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

    public doMove(player: Player, from: string, to: string) {
        this.board.doMove(from, to);

        this.switchTurn();
        this.emitBoard();

        const checkState = this.board.isCheckOrStalemate(this.currentTurn);
        if (checkState !== '') this.emitWin(getOppositeColor(this.currentTurn), checkState);
    }

    public emitBoard() {
        const serializedBoard = this.board.serialize();
        const objToEmit = { currentToMove: this.currentTurn, board: serializedBoard };
        this.emitToPlayers("game_update", objToEmit);
    }

    private emitWin(winningColor: Color, wonBy: string) {
        console.log(wonBy, "by", winningColor);
        this.finished = true;
        this.winner = winningColor;
        this.outcome = wonBy;

        const colorString = winningColor === Color.BLACK ? "black" : "white";
        this.emitToPlayers("win", `player ${colorString} has won by ${wonBy}`);
    }

    private emitToPlayers(name: string, msg: any) {
        this.playerBlack?.socket.emit(name, msg);
        this.playerWhite?.socket.emit(name, msg);
    }

    private generateToken(): string {
        return randomBytes(48).toString('hex');
    }
}