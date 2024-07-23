import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { onConnection } from "./routes/connection";
import { registerGetAllowedMoves } from "./routes/getAllowedMoves";
import { MoveHandler } from "./routes/move";
import { Game } from "./services/game";

const app = express();
const server = createServer(app);
const io = new Server(server, { path: "/ws", cors: { origin: "http://localhost:5173", credentials: false } });

const seededGame = new Game();
const seededId = "aaaaa-aaaaa-aaaaa-aaaaa-aaaaa"
seededGame.id = seededId
const games = { [seededId]: seededGame } as Record<string, Game>;

app.get("/game/new", (req, res) => {
    const game = new Game();
    games[game.id] = game;

    console.log(`created game ${game.id}`);

    return res.status(201).json({ id: game.id });
});


const gameNSP = io.of(/^\/[a-f\d]+-[a-f\d]+-[a-f\d]+-[a-f\d]+-[a-f\d]+$/);
gameNSP.on("connection", (socket) => {
    const { success, game, player } = onConnection(socket, games);
    if (!success || !game || !player) {
        socket.emit("error", { status: 400, error: "invalid handshake" });
        socket.disconnect();
        return;
    }

    // Player joined game succesfully
    socket.emit("joined", { color: player.color, token: player.token });
    game.emitBoard();

    // Register event listeners
    registerGetAllowedMoves(socket, player, game);
    new MoveHandler(player, game, socket);
});

app.all("*", (_, res) => {
    console.log("404!");
    res.status(404).send("not found");
})

server.listen(3000, () => {
    console.log('Listening on port 3000');
});
