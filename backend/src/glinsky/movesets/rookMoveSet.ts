import { Moveset } from "../../abstract/moveset";
import { Directions } from "../../types/directions";
import { Piece } from "../../types/piece";
import { Tile } from "../../types/tile";


export class RookMoveSet extends Moveset {
    getAllowedMoves(tile: Tile): Tile[] {
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