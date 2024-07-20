import { Color } from "../types/color";
import { Directions } from "../types/directions";
import { Piece } from "../types/piece";
import { Tile } from "../types/tile";
import { MoveSet } from "./moveset";


export class PawnMoveSet extends MoveSet {
    getAvailableTiles(tile: Tile): Tile[] {
        const YOUR_COLOR = Color.WHITE;
        const mainDirection = tile.color === YOUR_COLOR ? Directions.TOP : Directions.BOTTOM;
        const takingDirections = tile.color === YOUR_COLOR ? [Directions.TOPLEFT, Directions.TOPRIGHT] : [Directions.BOTTOMLEFT, Directions.BOTTOMRIGHT];        

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

        return availableTiles.filter((t) => !!t);
    }

}