import type { Tile } from "$lib/board";
import { BischopMoveSet } from "./bischopMoveSet";
import { MoveSet } from "./moveset";
import { RookMoveSet } from "./rookMoveSet";

export class QueenMoveSet extends MoveSet {
    getAvailableTiles(tile: Tile): Tile[] {
        const rookTiles = new RookMoveSet().getAvailableTiles(tile);
        const bischopTiles = new BischopMoveSet().getAvailableTiles(tile);
        return [...rookTiles, ...bischopTiles];
    }

}