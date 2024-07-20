import { Directions } from "../types/directions";
import { Tile } from "../types/tile";
import { MoveSet } from "./moveset";


export class KingMoveSet extends MoveSet {
    getAvailableTiles(tile: Tile): Tile[] {
        const directions = [
            [Directions.TOP],
            [Directions.TOPLEFT],
            [Directions.TOPRIGHT],
            [Directions.BOTTOM],
            [Directions.BOTTOMLEFT],
            [Directions.BOTTOMRIGHT],
            [Directions.TOP, Directions.TOPRIGHT],
            [Directions.TOP, Directions.TOPLEFT],
            [Directions.BOTTOMLEFT, Directions.TOPLEFT],
            [Directions.BOTTOMLEFT, Directions.BOTTOM],
            [Directions.BOTTOMRIGHT, Directions.TOPRIGHT],
            [Directions.BOTTOMRIGHT, Directions.BOTTOM],
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