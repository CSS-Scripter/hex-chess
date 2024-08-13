import { Tile } from "../types/tile";

export abstract class Moveset {
    abstract getAllowedMoves(tile: Tile): Tile[];
}
