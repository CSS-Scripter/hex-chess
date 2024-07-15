import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { Game } from "./game";

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

io.on("connection", (socket) => {
    console.log("Connection")
    socket.emit("Hello!");

    socket.on("message", (msg) => {
        console.log(msg)
        socket.send("message", "Hi!")
    });
})

io.of(/^\/[a-f\d]+-[a-f\d]+-[a-f\d]+-[a-f\d]+-[a-f\d]+$/).on("connection", (socket) => {
    console.log("Connection dynamic");

    const namespace = socket.nsp.name.slice(1);
    const game = games[namespace];

    try {
        if (!!game) {
            const color = game.registerPlayer(socket);
            console.log(`Player joined game ${namespace} as player ${color}`);
            socket.emit("message", color)
            socket.emit("board", game.board.serialize());
        } else {
            console.log(`Game ${namespace} was not found!`);
            socket.emit("message", "game does not exist");
        }
    } catch (e) {
        socket.emit("error", e);
        console.log(`failed to register player for game ${namespace}`);
        console.error(e);
    }
});

app.use("*", (req, res) => {
    console.log("404!");
    res.status(404).send("not found");
})


server.listen(3000, () => {
    console.log('Listening on port 3000');
});