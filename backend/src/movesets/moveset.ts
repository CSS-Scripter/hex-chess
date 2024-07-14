import { Tile } from "../tile";


export abstract class MoveSet {
    abstract getAvailableTiles(tile: Tile): Tile[];
}
