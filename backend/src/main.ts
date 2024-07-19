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

app.get("/game/new", (req, res) => {
    const game = new Game();
    games[game.id] = game;

    console.log(`created game ${game.id}`);

    return res.status(201).json({ id: game.id });
});


const gameNSP = io.of(/^\/[a-f\d]+-[a-f\d]+-[a-f\d]+-[a-f\d]+-[a-f\d]+$/);
gameNSP.on("connection", (socket) => {
    let game: Game | undefined;
    let player = { socket } as Player
    try {
        const gameID = socket.nsp.name.slice(1);
        game = games[gameID];
        if (!game) {
            throw new Error("game not found");
        }
    
        const handshakeData = socket.handshake;
        const joinAs = handshakeData.query["join_as"];
        player.token = handshakeData.auth.token;

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
        socket.emit("joined", { color: player.color, token: player.token });
        socket.emit("game_update", { currentToMove: game.currentTurn, board: game.board.serialize() });
    } catch (e) {
        const err = e as Error;
        console.log(`${err.name}: ${err.message}`);
        socket.emit("error", { status: 400, error: "invalid handshake" });
        socket.disconnect();
        return;
    }

    socket.on("get_allowed_moves", (tileID: string) => {
        const tile = game.board.getTileByID(tileID);
        if (player.color === game.currentTurn && player.color === tile?.color) {
            const allowedMoves = game.board.getAllowedMoves(tileID);
            socket.emit("allowed_moves", { from: tileID, allowed: allowedMoves });
        }
    });

    socket.on("move", (move: {from: string, to: string}) => {
        if (move.from === move.to) return;
        try {
            const movedColor = game.board.getTileByID(move.from)?.color;
            const yourColor = player.color;

            if (game.currentTurn === yourColor && yourColor === movedColor) {
                game.board.doMove(move.from, move.to);
                game.switchTurn();
                gameNSP.emit("game_update", { currentToMove: game.currentTurn, board: game.board.serialize() });
            }
        } catch (e) {
            console.error(e);
            socket.emit("error", { status: 400, error: "illegal move" });
        }
    });
});

app.all("*", (_, res) => {
    console.log("404!");
    res.status(404).send("not found");
})

server.listen(3000, () => {
    console.log('Listening on port 3000');
});
