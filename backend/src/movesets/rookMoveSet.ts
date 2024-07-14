import { Directions } from "../directions";
import { Piece } from "../piece";
import { Tile } from "../tile";
import { MoveSet } from "./moveset";


export class RookMoveSet extends MoveSet {
    getAvailableTiles(tile: Tile): Tile[] {
        const directions = [
            [Directions.TOP],
            [Directions.TOPLEFT],
            [Directions.TOPRIGHT],
            [Directions.BOTTOM],
            [Directions.BOTTOMLEFT],
            [Directions.BOTTOMRIGHT],
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