import { Socket } from "socket.io";
import { Game, Player } from "../services/game";

type MoveRequest = {
    from: string;
    to: string;
}

export class MoveHandler {
    constructor(private player: Player, private game: Game, private socket: Socket) {
        socket.on("move", (move: MoveRequest) => {
            try {
                this.handler(move);
            } catch (e) {
                console.error(e);
                socket.emit("error", { status: 400, error: "illegal move" });
            }
        });
    }

    private handler(move: MoveRequest) {
        if (move.from === move.to) return;
        if (!this.isYourTurn()) return;
        if (!this.movedOwnPiece(move.from)) return;
        
        this.doMove(move.from, move.to);
    }

    private isYourTurn(): boolean {
        return this.game.currentTurn === this.player.color;
    }

    private movedOwnPiece(from: string): boolean {
        const movedColor = this.game.board.getTileByID(from)?.color;
        return movedColor === this.player.color;
    }

    private doMove(from: string, to: string) {
        this.game.board.doMove(from, to);
        this.game.switchTurn();
        this.game.emitBoard();    
    }
}
