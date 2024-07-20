import { Tile } from "../types/tile";


export abstract class MoveSet {
    abstract getAvailableTiles(tile: Tile): Tile[];
}
