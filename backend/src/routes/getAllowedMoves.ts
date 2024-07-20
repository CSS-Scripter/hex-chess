import { Socket } from "socket.io";
import { Game, Player } from "../services/game";

export const registerGetAllowedMoves = (socket: Socket, player: Player, game: Game) => {
    socket.on("get_allowed_moves", (tileID: string) => {
        const tile = game.board.getTileByID(tileID);
        if (player.color === game.currentTurn && player.color === tile?.color) {
            const allowedMoves = game.board.getAllowedMoves(tileID);
            socket.emit("allowed_moves", { from: tileID, allowed: allowedMoves });
        }
    });
};
