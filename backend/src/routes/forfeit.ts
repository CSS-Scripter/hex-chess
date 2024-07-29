import { Socket } from "socket.io";
import { Game, Player } from "../services/game";

export const registerForfeit = (socket: Socket, player: Player, game: Game) => {
    socket.on("forfeit", () => game.forfeit(player.color));
};
