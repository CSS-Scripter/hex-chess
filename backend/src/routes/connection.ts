import { Socket } from "socket.io";
import { Game, Player } from "../services/game";
import { Color } from "../types/color";

export type OnConnectionResponse = {
    success: boolean;
    game?: Game;
    player?: Player;
}

export const onConnection = (socket: Socket, availableGames: Record<string, Game>): OnConnectionResponse => {
    try {
        const gameID = socket.nsp.name.slice(1);
        let game = availableGames[gameID];
        if (!game) {
            game = new Game();
            const success = game.loadGame(gameID);
            if (!success) throw new Error("game not found");
        }
    
        const handshakeData = socket.handshake;
        const joinAs = handshakeData.query["join_as"];
        const token = handshakeData.auth.token;
        let player = { token, socket } as Player;

        switch (joinAs) {
            case "new":
                player = game.registerPlayer(socket);
                break;
            case "black":
                player.color = Color.BLACK;
                game.login(player);
                break;
            case "white":
                player.color = Color.WHITE;
                game.login(player);
                break;
            default:
                throw new Error('invalid handshake');
        }

        console.log(`player ${player.color} succesfully connected to game ${game.id}`);

        return {
            success: true,
            game,
            player,
        }
    } catch (e) {
        const err = e as Error;
        console.log(`${err.name}: ${err.message}`);
        return { success: false };
    }
}
