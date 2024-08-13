import { Board } from "../abstract/board";
import { Moveset } from "../abstract/moveset";
import { Piece } from "../types/piece";

export abstract class GameFactory {
    abstract createBoard(): Board;
    abstract createMovesetFromPiece(piece: Piece): Moveset | undefined;
}