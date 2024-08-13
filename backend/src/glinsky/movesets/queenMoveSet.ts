import { Moveset } from "../../abstract/moveset";
import { Tile } from "../../types/tile";
import { BischopMoveSet } from "./bischopMoveSet";
import { RookMoveSet } from "./rookMoveSet";


export class QueenMoveSet extends Moveset {
    getAllowedMoves(tile: Tile): Tile[] {
        const rookTiles = new RookMoveSet().getAllowedMoves(tile);
        const bischopTiles = new BischopMoveSet().getAllowedMoves(tile);
        return [...rookTiles, ...bischopTiles];
    }

}