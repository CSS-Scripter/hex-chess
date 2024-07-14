import { Directions } from "../directions";
import { Piece } from "../piece";
import { Tile } from "../tile";
import { MoveSet } from "./moveset";

export class BischopMoveSet extends MoveSet {
    getAvailableTiles(tile: Tile): Tile[] {
        const directions = [
            [Directions.TOP, Directions.TOPRIGHT],
            [Directions.TOP, Directions.TOPLEFT],
            [Directions.BOTTOMLEFT, Directions.TOPLEFT],
            [Directions.BOTTOMLEFT, Directions.BOTTOM],
            [Directions.BOTTOMRIGHT, Directions.TOPRIGHT],
            [Directions.BOTTOMRIGHT, Directions.BOTTOM],
        ];

        const possibleTiles = [] as Tile[];
        for(const dirs of directions) {
            let foundTile = tile as Tile | undefined;
            while (foundTile) {
                dirs.forEach((d) => foundTile = foundTile?.directions[d])
                if (!foundTile) continue;

                if (foundTile.color === tile.color) break;

                possibleTiles.push(foundTile);
                if (foundTile.piece !== Piece.EMPTY) break;
            }
        }
        
        return possibleTiles;
    }

}