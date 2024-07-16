import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Color } from "./color";
import { Game, Player } from "./game";

const app = express();
const server = createServer(app);
const io = new Server(server, { path: "/api", cors: { origin: "http://localhost:5173", credentials: false } });

const seededGame = new Game();
const seededId = "aaaaa-aaaaa-aaaaa-aaaaa-aaaaa"
seededGame.id = seededId
const games = { [seededId]: seededGame } as Record<string, Game>;

app.get("/api/game/new", () => {
    const game = new Game();
    games[game.id] = game;

    return { id: game.id };
});


const gameNSP = io.of(/^\/[a-f\d]+-[a-f\d]+-[a-f\d]+-[a-f\d]+-[a-f\d]+$/);
gameNSP.on("connection", (socket) => {
    let game: Game | undefined;
    try {
        const gameID = socket.nsp.name.slice(1);
        game = games[gameID];
    
        const handshakeData = socket.handshake;
        const joinAs = handshakeData.query["join_as"];
        const token = handshakeData.auth.token;

        let player = { socket, token } as Player
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

        socket.emit("joined", { color: player.color, token: player.token });
        socket.emit("game_update", { currentToMove: game.currentTurn, board: game.board.serialize });
    } catch (e) {
        console.error(e);
        socket.emit("error", { status: 400, error: "invalid handshake" });
        socket.disconnect();
        return;
    }

    socket.on("get_allowed_moves", (tileID: string) => {
        const allowedMoves = game.board.getAllowedMoves(tileID);
        socket.emit("allowed_moves", { from: tileID, allowed: allowedMoves });
    });

    socket.on("move", (move: {from: string, to: string}) => {
        try {
            game.board.doMove(move.from, move.to);
            game.switchTurn();
            socket.emit("game_update", { currentToMove: game.currentTurn, board: game.board.serialize });
        } catch (e) {
            console.error(e);
            socket.emit("error", { status: 400, error: "illegal move" });
        }
    });
});

server.listen(3000, () => {
    console.log('Listening on port 3000');
});
