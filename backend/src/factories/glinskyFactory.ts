import { Board } from "../abstract/board";
import { Moveset } from "../abstract/moveset";
import { GlinskyBoard } from "../glinsky/glinskyBoard";
import { BischopMoveSet } from "../glinsky/movesets/bischopMoveSet";
import { KingMoveSet } from "../glinsky/movesets/kingMoveSet";
import { KnightMoveSet } from "../glinsky/movesets/knightMoveSet";
import { PawnMoveSet } from "../glinsky/movesets/pawnMoveSet";
import { QueenMoveSet } from "../glinsky/movesets/queenMoveSet";
import { RookMoveSet } from "../glinsky/movesets/rookMoveSet";
import { Piece } from "../types/piece";
import { GameFactory } from "./gameFactory";

export class GlinskyFactory extends GameFactory {
    createBoard(): Board {
        return new GlinskyBoard(this);
    }
    
    createMovesetFromPiece(piece: Piece): Moveset | undefined {
        switch(piece) {
            case Piece.KING:
                return new KingMoveSet();
            case Piece.QUEEN:
                return new QueenMoveSet();
            case Piece.BISCHOP:
                return new BischopMoveSet();
            case Piece.KNIGHT:
                return new KnightMoveSet();
            case Piece.ROOK:
                return new RookMoveSet();
            case Piece.PAWN:
                return new PawnMoveSet();
            default:
                return;
        }
    }
    
}