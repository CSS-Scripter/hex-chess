import type { Tile } from "$lib/board";

export abstract class MoveSet {
    abstract getAvailableTiles(tile: Tile): Tile[];
}
