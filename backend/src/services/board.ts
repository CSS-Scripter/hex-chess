import { BischopMoveSet } from "../movesets/bischopMoveSet";
import { KingMoveSet } from "../movesets/kingMoveSet";
import { KnightMoveSet } from "../movesets/knightMoveSet";
import { MoveSet } from "../movesets/moveset";
import { PawnMoveSet } from "../movesets/pawnMoveSet";
import { QueenMoveSet } from "../movesets/queenMoveSet";
import { RookMoveSet } from "../movesets/rookMoveSet";
import { Color, getOppositeColor } from "../types/color";
import { Directions } from "../types/directions";
import { Move } from "../types/move";
import { Piece } from "../types/piece";
import { Tile } from "../types/tile";
import { ProjectedBoard } from "./projectedBoard";

type SerializedTile = Omit<Tile, 'directions'> & { directions: Record<Directions, string | undefined> };

export class Board {
    private board: Tile[][];

    constructor() {
        this.board = [] as Tile[][];
        this.fillBoard();
        this.linkTiles();
        this.setupStartingPosition();
    }

    private fillBoard() {
        for(let y = 0; y < 11; y++) {
            const rows = Math.min(1 + (y * 2), 11);
            this.board.push([]);
            for(let x = 0; x < rows; x++) {
                const tileName = this.cordsToTileName(rows, x, y);
                // const tileName = `${x},${y}`;
                this.board[y].push({
                    name: tileName,
                    piece: Piece.EMPTY,
                    color: Color.NONE,
                    gradient: this.getTileGradient(rows, x, y),
                    highlighted: false,
                    isInitialPosition: false,
                    previouslyDoubleMoved: false,
                    directions: {}
                } as Tile);
            }
        }        
    }

    private linkTiles() {
        for(let y = 0; y < this.board.length; y++) {
            for(let x = 0; x < this.board[y].length; x++) {
                const tile = this.board[y][x];
                this.linkTopBottom(x, y, tile);
                this.linkTopLeftBottomRight(x, y, tile);
                this.linkBottomLeftTopRight(x, y, tile);
            }
        }
    }

    private linkTopBottom(x: number, y: number, tile: Tile) {
        let ty = y;
        let tx = x;
        if (y <= 5) {
            ty -= 1;
            tx -= 1;
        } else {
            ty -= 1;
        }

        if (tx >= 0 && ty >= 0) {
            const foundTile = this.board[ty]?.[tx];
            if (foundTile) {
                tile.directions[Directions.TOP] = foundTile;
                foundTile.directions[Directions.BOTTOM] = tile;
            }
        }
    }

    private linkTopLeftBottomRight(x: number, y: number, tile: Tile) {
        const centerX = Math.ceil(this.board[y].length / 2) - 1;
        let ty = y;
        let tx = x;
        if (x <= centerX) {
            tx -= 1;
        }
        else if(y <= 5) {
            ty -= 1;
            tx -= 2;
        } else {
            ty -= 1;
            tx -= 1;
        }
        if (tx >= 0 && ty >= 0) {
            const foundTile = this.board[ty]?.[tx];
            if (foundTile) {
                tile.directions[Directions.TOPLEFT] = foundTile;
                foundTile.directions[Directions.BOTTOMRIGHT] = tile;
            }
        }
    }

    private linkBottomLeftTopRight(x: number, y: number, tile: Tile) {
        const centerX = Math.ceil(this.board[y].length / 2) - 1;
        let ty = y;
        let tx = x;

        if (x > centerX) {
            tx -= 1;
        } else if(y <= 4) {
            ty += 1
        } else {
            ty += 1;
            tx -= 1;
        }

        if (tx >= 0 && ty >= 0) {
            const foundTile = this.board[ty]?.[tx];
            if (foundTile) {
                tile.directions[Directions.BOTTOMLEFT] = foundTile;
                foundTile.directions[Directions.TOPRIGHT] = tile;
            }
        }
    }

    private setupStartingPosition() {
        const startingPositions = [
            [0, 0, Piece.BISCHOP, Color.BLACK],
            [1, 1, Piece.BISCHOP, Color.BLACK],
            [2, 2, Piece.BISCHOP, Color.BLACK],
            [0, 1, Piece.QUEEN, Color.BLACK],
            [2, 1, Piece.KING, Color.BLACK],
            [0, 2, Piece.KNIGHT, Color.BLACK],
            [4, 2, Piece.KNIGHT, Color.BLACK],
            [0, 3, Piece.ROOK, Color.BLACK],
            [6, 3, Piece.ROOK, Color.BLACK],
            [0, 4, Piece.PAWN, Color.BLACK],
            [1, 4, Piece.PAWN, Color.BLACK],
            [2, 4, Piece.PAWN, Color.BLACK],
            [3, 4, Piece.PAWN, Color.BLACK],
            [4, 4, Piece.PAWN, Color.BLACK],
            [5, 4, Piece.PAWN, Color.BLACK],
            [6, 4, Piece.PAWN, Color.BLACK],
            [7, 4, Piece.PAWN, Color.BLACK],
            [8, 4, Piece.PAWN, Color.BLACK],

            [5, 10, Piece.BISCHOP, Color.WHITE],
            [5, 9, Piece.BISCHOP, Color.WHITE],
            [5, 8, Piece.BISCHOP, Color.WHITE],
            [4, 10, Piece.QUEEN, Color.WHITE],
            [6, 10, Piece.KING, Color.WHITE],
            [3, 10, Piece.KNIGHT, Color.WHITE],
            [7, 10, Piece.KNIGHT, Color.WHITE],
            [2, 10, Piece.ROOK, Color.WHITE],
            [8, 10, Piece.ROOK, Color.WHITE],
            [1, 10, Piece.PAWN, Color.WHITE],
            [2, 9, Piece.PAWN, Color.WHITE],
            [3, 8, Piece.PAWN, Color.WHITE],
            [4, 7, Piece.PAWN, Color.WHITE],
            [5, 6, Piece.PAWN, Color.WHITE],
            [6, 7, Piece.PAWN, Color.WHITE],
            [7, 8, Piece.PAWN, Color.WHITE],
            [8, 9, Piece.PAWN, Color.WHITE],
            [9, 10, Piece.PAWN, Color.WHITE],
        ] as [number, number, Piece, Color][];

        for (const pos of startingPositions) {
            const [x, y, piece, color] = pos;
            this.board[y][x].piece = piece;
            this.board[y][x].color = color;
            this.board[y][x].isInitialPosition = true;
        }
    }


    private cordsToTileName(rows: number, x: number, y: number): string {
        const letters = 'abcdefghikl'.split('');
        const offset = (11 - rows) / 2;
        const letter = letters[offset+x];
        const num = 11 - y;
        return `${letter}${num}`
    }

    private getTileGradient(rowSize: number, x: number, y: number): 0 | 1 | 2 {
        const rowOffset = (11 - rowSize) / 2;
        x += rowOffset;
    
        let extraOffset = 0;
        if (x >= 6) {
            extraOffset = (x - 5) * 2;
        }
    
        const gradientIndex = (y + (x*2) + extraOffset) % 3;
        return gradientIndex as 0 | 1 | 2;
    }

    private getMovesetByTile(tile: Tile): MoveSet | undefined {
        return this.getMovesetByPiece(tile.piece);
    }

    private getMovesetByPiece(piece: Piece): MoveSet | undefined {
        switch(piece) {
            case Piece.KING:
                return new KingMoveSet();
            case Piece.QUEEN:
                return new QueenMoveSet();
            case Piece.BISCHOP:
                return new BischopMoveSet();
            case Piece.KNIGHT:
                return new KnightMoveSet();
            case Piece.ROOK:
                return new RookMoveSet();
            case Piece.PAWN:
                return new PawnMoveSet();
            default:
                return;
        }
    }

    public isMoveAllowed(from: Tile, to: Tile): boolean {
        if (from.piece === Piece.EMPTY) return false;

        const moveset = this.getMovesetByTile(from);
        if (!moveset) return false;

        const allowedTiles = moveset.getAvailableTiles(from);
        return !!allowedTiles.find((t) => t.name === to.name);
    }

    public serialize(): SerializedTile[] {
        const tileClones = [];

        for (const row of this.board) {
            for (const tile of row) {
                tileClones.push(this.serializeTile(tile));
            }
        }

        return tileClones;
    }

    private serializeTile(tile: Tile): SerializedTile {
        return {
            name: tile.name,
            piece: tile.piece,
            color: tile.color,
            gradient: tile.gradient,
            highlighted: tile.highlighted,
            isInitialPosition: tile.isInitialPosition,
            directions: {
                [Directions.TOP]: tile.directions[Directions.TOP]?.name,
                [Directions.TOPLEFT]: tile.directions[Directions.TOPLEFT]?.name,
                [Directions.TOPRIGHT]: tile.directions[Directions.TOPRIGHT]?.name,
                [Directions.BOTTOM]: tile.directions[Directions.BOTTOM]?.name,
                [Directions.BOTTOMLEFT]: tile.directions[Directions.BOTTOMLEFT]?.name,
                [Directions.BOTTOMRIGHT]: tile.directions[Directions.BOTTOMRIGHT]?.name,
            },
        } as SerializedTile;
    }

    public getAllowedMoves(tileID: string): string[] {
        const tile = this.getTileByID(tileID);
        if (!tile) return [];

        const moveset = this.getMovesetByTile(tile);
        const allowedTiles = moveset?.getAvailableTiles(tile) ?? [];
        if (allowedTiles.length === 0) return [];

        const projection = new ProjectedBoard(this);
        return allowedTiles
            .filter((t) => !projection.projectMoveAndCheckCheck(tileID, t.name, tile.color))
            .map((t) => t.name);
    }

    public getTileByID(id: string): Tile | undefined {
        for (const row of this.board) {
            for (const tile of row) {
                if (tile.name === id) return tile;
            }
        }
    }

    public doMove(from: string, to: string, promotion: string | undefined): Move {
        let move = { from, to, promotion: Piece.EMPTY } as Move;

        const fromTile = this.getTileByID(from);
        const toTile = this.getTileByID(to);

        if (!fromTile || !toTile) throw new Error('tile not found');
        move.by = fromTile.color;
        move.piece = fromTile.piece;
        move.capture = toTile.piece !== Piece.EMPTY;
        move.possibleFroms = this.whatPiecesCanSeeTile(toTile, fromTile.piece, fromTile.color).filter((n) => n !== fromTile.name);

        const moveset = this.getMovesetByTile(fromTile);
        if (!moveset) throw new Error('tile does not contain piece');

        const allowedMoves = moveset.getAvailableTiles(fromTile);
        const isMoveAllowed = allowedMoves.map((t) => t.name).includes(to);
        if (!isMoveAllowed) throw new Error('move is not allowed');

        if (this.checkIfMoveIsEnPassant(fromTile, toTile)) {
            const passantDirection = fromTile.color === Color.WHITE ? Directions.BOTTOM : Directions.TOP;
            const passantTile = toTile.directions[passantDirection];
            if (passantTile) {
                passantTile.color = Color.NONE;
                passantTile.piece = Piece.EMPTY;
            }
        }

        const isDoubleMove = this.checkIfMoveIsDouble(fromTile, toTile);

        toTile.piece = fromTile.piece;
        toTile.color = fromTile.color;
        toTile.isInitialPosition = false;
        toTile.previouslyDoubleMoved = isDoubleMove;
        
        fromTile.piece = Piece.EMPTY;
        fromTile.color = Color.NONE;
        fromTile.isInitialPosition = false;
        fromTile.previouslyDoubleMoved = false;

        if (toTile.piece === Piece.PAWN && this.isTilePromotionTile(toTile, toTile.color)) {
            const promotionPiece = this.stringToPiece(promotion);
            if (!promotionPiece) throw Error("invalid promotion piece");

            toTile.piece = promotionPiece;
            move.promotion = promotionPiece;
        }

        move.checked = this.isKingChecked(getOppositeColor(toTile.color));

        return move;
    }

    private isTilePromotionTile(tile: Tile, color: Color) {
        if (color === Color.WHITE) {
            return [
                'a6', 'b7', 'c8',
                'd9', 'e10', 'f11',
                'g10', 'h9', 'i8',
                'k7', 'l6'
            ].includes(tile.name);
        } else {
            return [
                'a1', 'b1', 'c1',
                'd1', 'e1', 'f1',
                'g1', 'h1', 'i1',
                'k1', 'l1'
            ].includes(tile.name);
        }
    }

    private stringToPiece(piece: string | undefined): Piece | undefined {
        switch (piece) {
            case "rook": return Piece.ROOK;
            case "knight": return Piece.KNIGHT;
            case "bischop": return Piece.BISCHOP;
            case "queen": return Piece.QUEEN;
            default: return undefined;
        }
    }

    private checkIfMoveIsEnPassant(fromTile: Tile, toTile: Tile): boolean {
        if (fromTile.piece !== Piece.PAWN) return false;

        const movingColor = fromTile.color;
        const enPassantDirection = movingColor === Color.WHITE ? Directions.BOTTOM : Directions.TOP;
        const enPassantTile = toTile.directions[enPassantDirection];

        return (
            enPassantTile?.color !== fromTile.color &&
            enPassantTile?.piece === Piece.PAWN &&
            enPassantTile?.previouslyDoubleMoved
        );
    }

    private checkIfMoveIsDouble(fromTile: Tile, toTile: Tile): boolean {
        if (fromTile.piece !== Piece.PAWN) return false;

        const direction = fromTile.color === Color.WHITE ? Directions.TOP : Directions.BOTTOM;
        const doubleMoveTile = fromTile.directions[direction]?.directions[direction];
        return doubleMoveTile?.name === toTile.name;
    }

    private getTilesByPiece(piece: Piece, color: Color): Tile[] {
        const tiles = [];
        for (const row of this.board) {
            for (const tile of row) {
                if (tile.piece === piece && tile.color === color) {
                    tiles.push(tile);
                }
            }
        }
        return tiles;
    }

    public isCheckOrStalemate(color: Color) {
        const tilesWithPieces = this.findTiles((t) => t.color === color && t.piece !== Piece.EMPTY);

        const allowedMoves = tilesWithPieces.map((t) => {
            const allowedMoves = this.getAllowedMoves(t.name);
            return allowedMoves.length;
        }).reduce((acc, v) => acc+v, 0);

        if (allowedMoves === 0) {
            if (this.isKingChecked(color)) return "checkmate";
            else return "stalemate";
        }

        return "";
    }

    private findTiles(pred: (t: Tile) => boolean) {
        const found = [];
        for (const row of this.board) {
            for (const tile of row) {
                if (pred(tile)) found.push(tile);
            }
        }

        return found;
    }

    public isKingChecked(color: Color) {
        const kingTile = this.getTilesByPiece(Piece.KING, color)[0];
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

    private whatPiecesCanSeeTile(tile: Tile, piece: Piece, color: Color): string[] {
        const otherPieceTiles = [];
        for (const row of this.board) {
            for (const t of row) {
                if (t.piece === piece && t.color === color) otherPieceTiles.push(t);
            }
        }

        const moveset = this.getMovesetByPiece(piece);
        if (!moveset) return [];

        const possibleTiles = [] as string[];

        for (const t of otherPieceTiles) {
            const availTiles = moveset.getAvailableTiles(t);
            const canSee = availTiles.filter((t) => t.name === tile.name).length > 0;
            if (canSee) possibleTiles.push(t.name);
        }

        return possibleTiles;
    }
}
