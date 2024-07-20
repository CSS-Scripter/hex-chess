import { BischopMoveSet } from "../movesets/bischopMoveSet";
import { KingMoveSet } from "../movesets/kingMoveSet";
import { MoveSet } from "../movesets/moveset";
import { QueenMoveSet } from "../movesets/queenMoveSet";
import { Color, getOppositeColor } from "../types/color";
import { Directions } from "../types/directions";
import { Piece } from "../types/piece";
import { Tile } from "../types/tile";
import { Board } from "./board";

type State = {
    piece: Piece,
    color: Color,
}

export class ProjectedBoard {
    private original: Tile[];
    private stateStorage = {} as Record<string, State>;
    
    constructor(originalBoard: Board) {
        const clone = JSON.parse(JSON.stringify(originalBoard.serialize())) as Tile[];
        const tileMap = {} as Record<string, Tile>;
        clone.forEach((t) => tileMap[t.name] = t);

        this.original = clone.map((t) => {
            t.directions[Directions.TOP] = tileMap[t.directions[Directions.TOP] as unknown as string];
            t.directions[Directions.TOPLEFT] = tileMap[t.directions[Directions.TOPLEFT] as unknown as string];
            t.directions[Directions.TOPRIGHT] = tileMap[t.directions[Directions.TOPRIGHT] as unknown as string];
            t.directions[Directions.BOTTOM] = tileMap[t.directions[Directions.BOTTOM] as unknown as string];
            t.directions[Directions.BOTTOMLEFT] = tileMap[t.directions[Directions.BOTTOMLEFT] as unknown as string];
            t.directions[Directions.BOTTOMRIGHT] = tileMap[t.directions[Directions.BOTTOMRIGHT] as unknown as string];
            return t;
        });
    }

    public projectMoveAndCheckCheck(from: string, to: string, color: Color): boolean {
        const fromTile = this.findByName(from);
        const toTile = this.findByName(to);

        if (!fromTile || !toTile) return false;

        this.storeState(fromTile);
        this.storeState(toTile);

        toTile.piece = fromTile.piece;
        toTile.color = fromTile.color;

        fromTile.piece = Piece.EMPTY;
        fromTile.color = Color.NONE;

        const isChecked = this.isKingChecked(color);

        this.restoreState(fromTile);
        this.restoreState(toTile);

        return isChecked;
    }

    private findByName(name: string) {
        return this.original.find((t) => t.name === name);
    }

    public isKingChecked(color: Color) {
        const kingTile = this.original.find((t) => t.piece === Piece.KING && t.color === color);
        if (!kingTile) return false;

        const moves = [
            [Piece.QUEEN, new QueenMoveSet()],
            [Piece.BISCHOP, new BischopMoveSet()],
            [Piece.KNIGHT, new BischopMoveSet()],
            [Piece.ROOK, new BischopMoveSet()],
            [Piece.KING, new KingMoveSet()],
        ] as [Piece, MoveSet][];
        const opposingColor = getOppositeColor(color);

        for (const entry of moves) {
            const [piece, moveset] = entry;
            const tiles = moveset.getAvailableTiles(kingTile);
            const isChecked = !!tiles.find((t) => t.color === opposingColor && t.piece === piece);
            if (isChecked) return true;
        }

        const attackingPawnSpaces = [];
        if (color === Color.WHITE) {
            attackingPawnSpaces.push(kingTile.directions[Directions.TOPLEFT]);
            attackingPawnSpaces.push(kingTile.directions[Directions.TOPRIGHT]);
        } else {
            attackingPawnSpaces.push(kingTile.directions[Directions.BOTTOMLEFT]);
            attackingPawnSpaces.push(kingTile.directions[Directions.BOTTOMRIGHT]);
        }

        for (const tile of attackingPawnSpaces) {
            if (tile && tile.color === opposingColor && tile.piece === Piece.PAWN) return true;
        }

        return false;
    }

    private storeState(tile: Tile) {
        this.stateStorage[tile.name] = {
            piece: tile.piece,
            color: tile.color,
        }
    }

    private restoreState(tile: Tile) {
        const state = this.stateStorage[tile.name];
        if (!state) throw new Error('state not stored');

        tile.piece = state.piece;
        tile.color = state.color;
    }
}
