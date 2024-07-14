import { Color } from "./color";
import { Directions } from "./directions";
import { BischopMoveSet } from "./movesets/bischopMoveSet";
import { KingMoveSet } from "./movesets/kingMoveSet";
import { KnightMoveSet } from "./movesets/knightMoveSet";
import { MoveSet } from "./movesets/moveset";
import { PawnMoveSet } from "./movesets/pawnMoveSet";
import { QueenMoveSet } from "./movesets/queenMoveSet";
import { RookMoveSet } from "./movesets/rookMoveSet";
import { Piece } from "./piece";
import { Tile } from "./tile";

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
        let moveset: MoveSet | undefined = undefined;
        switch(tile.piece) {
            case Piece.KING:
                moveset = new KingMoveSet();
                break;
            case Piece.QUEEN:
                moveset = new QueenMoveSet();
                break;
            case Piece.BISCHOP:
                moveset = new BischopMoveSet();
                break;
            case Piece.KNIGHT:
                moveset = new KnightMoveSet();
                break;
            case Piece.ROOK:
                moveset = new RookMoveSet();
                break;
            case Piece.PAWN:
                moveset = new PawnMoveSet();
                break;
        }
        return moveset;
    }

    public highlightTile(tile: Tile) {
        const moveset = this.getMovesetByTile(tile);
        if (moveset) {
            tile.highlighted = true;
            this.highlightMoveSet(tile, moveset);
        }
    }

    private highlightMoveSet(tile: Tile, moveset: MoveSet) {
        const tilesToHighlight = moveset.getAvailableTiles(tile);
        tilesToHighlight.forEach((t) => t.highlighted = true);
    }

    public clearHighlight() {
        for (const row of this.board) {
            for (const tile of row) {
                tile.highlighted = false;
            }
        }
    }

    public isMoveAllowed(from: Tile, to: Tile): boolean {
        if (from.piece === Piece.EMPTY) return false;

        const moveset = this.getMovesetByTile(from);
        if (!moveset) return false;
        const allowedTiles = moveset.getAvailableTiles(from);
        return !!allowedTiles.find((t) => t.name === to.name);
    }
}
