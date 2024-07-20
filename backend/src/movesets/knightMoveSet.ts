import { Directions } from "../types/directions";
import { Tile } from "../types/tile";
import { MoveSet } from "./moveset";


export class KnightMoveSet extends MoveSet {
    getAvailableTiles(tile: Tile): Tile[] {
        const directions = [
            [Directions.TOP, Directions.TOP, Directions.TOPRIGHT],
            [Directions.TOP, Directions.TOP, Directions.TOPLEFT],
            [Directions.TOPLEFT, Directions.TOPLEFT, Directions.TOP],
            [Directions.TOPLEFT, Directions.TOPLEFT, Directions.BOTTOMLEFT],
            [Directions.TOPRIGHT, Directions.TOPRIGHT, Directions.TOP],
            [Directions.TOPRIGHT, Directions.TOPRIGHT, Directions.BOTTOMRIGHT],
            [Directions.BOTTOM, Directions.BOTTOM, Directions.BOTTOMLEFT],
            [Directions.BOTTOM, Directions.BOTTOM, Directions.BOTTOMRIGHT],
            [Directions.BOTTOMLEFT, Directions.BOTTOMLEFT, Directions.TOPLEFT],
            [Directions.BOTTOMLEFT, Directions.BOTTOMLEFT, Directions.BOTTOM],
            [Directions.BOTTOMRIGHT, Directions.BOTTOMRIGHT, Directions.TOPRIGHT],
            [Directions.BOTTOMRIGHT, Directions.BOTTOMRIGHT, Directions.BOTTOM],
        ];

        const possibleTiles = [];
        for (const dirs of directions) {
            let foundTile = tile as Tile | undefined;
            dirs.forEach((d) => foundTile = foundTile?.directions[d]);
            if (foundTile && foundTile.color !== tile.color) {
                possibleTiles.push(foundTile);
            }
        }
        return possibleTiles;
    }
}