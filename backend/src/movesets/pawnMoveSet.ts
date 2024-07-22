import { Color } from "../types/color";
import { Directions } from "../types/directions";
import { Piece } from "../types/piece";
import { Tile } from "../types/tile";
import { MoveSet } from "./moveset";


export class PawnMoveSet extends MoveSet {
    getAvailableTiles(tile: Tile): Tile[] {
        const mainDirection = tile.color === Color.WHITE ? Directions.TOP : Directions.BOTTOM;
        const oppositeDirection = tile.color === Color.WHITE ? Directions.BOTTOM : Directions.TOP;
        const takingDirections = tile.color === Color.WHITE ? [Directions.TOPLEFT, Directions.TOPRIGHT] : [Directions.BOTTOMLEFT, Directions.BOTTOMRIGHT];
        const enPassantDirections = tile.color === Color.WHITE ? [Directions.BOTTOMLEFT, Directions.BOTTOMRIGHT] : [Directions.TOPLEFT, Directions.TOPRIGHT];

        const availableTiles = [] as (Tile | undefined)[];

        const nextTile = tile.directions[mainDirection];
        if (nextTile && nextTile.color === Color.NONE) {
            availableTiles.push(nextTile);
            if (tile.isInitialPosition) {
                const doubleMove = nextTile.directions[mainDirection];
                if (doubleMove?.color === Color.NONE) {
                    availableTiles.push(nextTile?.directions[mainDirection]);
                }
            }
        }

        for(const dir of takingDirections) {
            const takingTile = tile.directions[dir];
            if (takingTile?.piece !== Piece.EMPTY && takingTile?.color !== tile.color) {
                availableTiles.push(takingTile);
            }
        }

        for(const dir of enPassantDirections) {
            const movingTile = tile.directions[dir];
            const takingTile = movingTile?.directions[oppositeDirection];
            if (
                takingTile?.piece === Piece.PAWN &&
                takingTile.color !== tile.color &&
                takingTile.previouslyDoubleMoved
            ) {
                availableTiles.push(takingTile);
            }
        }

        return availableTiles.filter((t) => !!t);
    }

}