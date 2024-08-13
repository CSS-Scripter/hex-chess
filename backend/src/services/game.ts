import { randomBytes } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { Socket } from "socket.io";
import { Board } from "../abstract/board";
import { GameFactory } from "../factories/gameFactory";
import { GlinskyFactory } from "../factories/glinskyFactory";
import { unloadGame } from "../main";
import { Color, getOppositeColor } from "../types/color";
import { AnnotateMove, Move } from "../types/move";
import { Piece, pieceToUTF8, utf8ToPiece } from "../types/piece";

export type Player = {
    socket: Socket;
    color: Color;
    token: string;
};

const createGameFactory = (type: string): GameFactory | undefined => {
    if (type === "glinsky") return new GlinskyFactory;
}

export class Game {
    public id: string;
    public gameType: string;
    public factory: GameFactory | undefined;
    public board: Board;
    public currentTurn: Color;

    public playerWhite: Player | undefined;
    public playerBlack: Player | undefined;

    public finished: boolean = false;
    public winner: Color = Color.NONE;
    public outcome: string = '';
    public moves: Move[] = [];

    private shouldSave = true;

    constructor(gameType: string = "glinsky") {
        this.id = crypto.randomUUID();
        this.gameType = gameType;
        this.factory = createGameFactory(this.gameType);
        if (!this.factory) throw new Error("unknown game rules");

        this.board = this.factory.createBoard();
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

    public doMove(from: string, to: string, promotion: string | undefined) {
        const move = this.board.doMove(from, to, promotion);

        this.switchTurn();
        const checkState = this.board.isCheckOrStalemate(this.currentTurn);
        move.mated = checkState === 'checkmate';
        move.stale = checkState === 'stalemate';
        if (checkState !== '') {
            this.finished = true;
            this.outcome = checkState;
            this.winner = getOppositeColor(this.currentTurn);
        }

        AnnotateMove(move);
        this.moves.push(move);

        this.emitBoard();

        if (this.finished) {
            this.saveAndUnload();
        } else {
            this.saveGame();
        }
    }

    public emitBoard() {
        const serializedBoard = this.board.serialize();
        const objToEmit = {
            currentToMove: this.currentTurn,
            board: serializedBoard,
            awaitingPlayer: !this.bothPlayersJoined(),
            moves: this.moves,
            finished: this.finished,
            outcome: this.outcome,
            winner: this.winner,
        };
        this.emitToPlayers("game_update", objToEmit);
    }

    private emitToPlayers(name: string, msg: any) {
        this.playerBlack?.socket?.emit(name, msg);
        this.playerWhite?.socket?.emit(name, msg);
    }

    private generateToken(): string {
        return randomBytes(48).toString('hex');
    }

    public bothPlayersJoined(): boolean {
        return !!this.playerWhite && !!this.playerBlack;
    }

    public forfeit(color: Color) {
        this.finished = true;
        this.outcome = "forfeit";
        this.winner = getOppositeColor(color);

        this.emitBoard();
        this.saveAndUnload();
    }

    private saveGame() {
        if (!this.shouldSave) return;
        const moves = this.simplifyMoves();
        const objToSave = {
            id: this.id,
            finished: this.finished,
            winner: this.winner,
            outcome: this.outcome,
            moves,

            whiteToken: this.playerWhite?.token,
            blackToken: this.playerBlack?.token,
        };

        try {
            writeFileSync(`./games/${this.id}.json`, JSON.stringify(objToSave), { encoding: 'utf-8' });
        } catch (e) {
            console.error('failed to save game ' + this.id, e);
        }
    }

    private simplifyMoves() {
        return this.moves.map((m) => ({from: m.from, to: m.to, promotionPiece: pieceToUTF8(m.promotion) }));
    }

    public loadGame(id: string): boolean {
        this.shouldSave = false;
        try {
            const saveContents = JSON.parse(readFileSync(`./games/${id}.json`, { encoding: 'utf-8' }));
            this.id = saveContents.id;

            if (saveContents.whiteToken) {
                this.playerWhite = { color: Color.WHITE, token: saveContents.whiteToken } as Player;
            }

            if (saveContents.blackToken) {
                this.playerBlack = { color: Color.BLACK, token: saveContents.blackToken } as Player;
            }

            for (const move of saveContents.moves) {
                this.doMove(move.from, move.to, utf8ToPiece(move.promotionPiece) ?? Piece.QUEEN);
            }

            this.finished = saveContents.finished;
            this.winner = saveContents.winner;
            this.outcome = saveContents.outcome;

            console.log(`loaded game ${id}`);
            this.shouldSave = true;
            this.saveGame();

            return true;
        } catch (e) {
            console.error('failed to init game from save ' + id, e);
            return false;
        }
    }

    private saveAndUnload() {
        console.log('unloading game ' + this.id);
        this.saveGame();
        this.playerWhite?.socket?.disconnect();
        this.playerBlack?.socket?.disconnect();
        unloadGame(this.id);
    }

    public serialize() {
        return {
            id: this.id,
            finished: this.finished,
            winner: this.winner,
            outcome: this.outcome,
            moves: this.moves,
        }
    }
}