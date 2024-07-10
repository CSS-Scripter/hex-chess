export enum Piece {
    KING = '♔♚',
    QUEEN = '♕♛',
    BISCHOP = '♗♝',
    KNIGHT = '♘♞',
    ROOK = '♖♜',
    PAWN = '♙♟︎',
    EMPTY = '',
}

export enum Color {
    BLACK,
    WHITE,
    NONE,
}

export enum Directions {
    TOP,
    TOPLEFT,
    TOPRIGHT,
    BOTTOM,
    BOTTOMLEFT,
    BOTTOMRIGHT
}

export type Tile = {
    name: string;
    piece: Piece;
    color: Color;
    gradient: 0 | 1 | 2;
    highlighted: boolean;

    directions: Record<Directions, Tile | undefined>;
}

export class Board {
    private board: Tile[][];

    constructor() {
        this.board = [];

        for(let y = 0; y < 11; y++) {
            const rows = Math.min(1 + (y * 2), 11);
            this.board.push([]);
            for(let x = 0; x < rows; x++) {
                const tileName = this.cordsToTileName(rows, x, y);
                // const tileName = `${x},${y}`;
                this.board[y].push({
                    name: tileName,
                    piece: Piece.EMPTY,
                    color: Color.WHITE,
                    gradient: this.getTileGradient(rows, x, y),
                    highlighted: false,
                    directions: {}
                } as Tile);
            }
        }

        for(let y = 0; y < this.board.length; y++) {
            for(let x = 0; x < this.board[y].length; x++) {
                const tile = this.board[y][x];

                const isAtBottom = y === this.board.length-1
                const isAtTop = y <= 5 && (x === this.board[y].length-1 || x === 0);

                const isAtLeft = x === 0;
                const isAtRight = x === this.board[y].length;

                const isAtTopLeft = (x <= 6 && isAtTop);
                const isAtTopRight = (x >= 6 && isAtTop);
                const isAtBottomLeft = (x <= 6 && isAtBottom);
                const isAtBottomRight = (x >= 6 && isAtBottom);

                const centerX = Math.ceil(this.board[y].length / 2) - 1;
                const shrinkY = 4;

                if (true) {
                    let ty = y;
                    let tx = x;
                    if (y <= shrinkY+1) {
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

                if (true) {
                    let ty = y;
                    let tx = x;
                    if (x <= centerX) {
                        tx -= 1;
                    }
                    else if(y <= shrinkY+1) {
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

                if (true) {
                    let ty = y;
                    let tx = x;

                    if (x > centerX) {
                        tx -= 1;
                    } else if(y <= shrinkY) {
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
            }
        }

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

    public getBoard() {
        return this.board;
    }

    public highlightTile(x: number, y: number) {
        const tile = this.board[y][x];
        tile.highlighted = true;

        switch(tile.piece) {
            case Piece.KING:
                this.highlightKing(tile);
                break;
            case Piece.QUEEN:
                this.highlightBischop(tile);
                this.highlightRook(tile);
                break;
            case Piece.BISCHOP:
                this.highlightBischop(tile);
                break;
            case Piece.KNIGHT:
                this.highlightKnight(tile);
                break;
            case Piece.ROOK:
                this.highlightRook(tile);
                break;
            case Piece.PAWN:
                this.highlightPawn(tile);
                break;
        }

        // this.highlightBischop(tile);
        // this.highlightRook(tile);
    }

    private highlightRook(tile: Tile) {
        const directions = [
            Directions.TOP,
            Directions.TOPLEFT,
            Directions.TOPRIGHT,
            Directions.BOTTOM,
            Directions.BOTTOMLEFT,
            Directions.BOTTOMRIGHT,
        ];

        for(const dir of directions) {
            let foundTile = tile.directions[dir];
            while (foundTile) {
                if (foundTile.piece !== Piece.EMPTY) break;
                foundTile.highlighted = true;
                foundTile = foundTile.directions[dir];
            }
        }
    }

    private highlightBischop(tile: Tile) {
        const directions = [
            [Directions.TOP, Directions.TOPRIGHT],
            [Directions.TOP, Directions.TOPLEFT],
            [Directions.BOTTOMLEFT, Directions.TOPLEFT],
            [Directions.BOTTOMLEFT, Directions.BOTTOM],
            [Directions.BOTTOMRIGHT, Directions.TOPRIGHT],
            [Directions.BOTTOMRIGHT, Directions.BOTTOM],
        ];

        for(const dirs of directions) {
            let foundTile = tile as Tile | undefined;
            dirs.forEach((d) => foundTile = foundTile?.directions[d])
            while (foundTile) {
                if (foundTile.piece !== Piece.EMPTY) break;
                foundTile.highlighted = true;
                dirs.forEach((d) => foundTile = foundTile?.directions[d]);
            }
        }
    }

    private highlightKing(tile: Tile) {
        const directions = [
            Directions.TOP,
            Directions.TOPLEFT,
            Directions.TOPRIGHT,
            Directions.BOTTOM,
            Directions.BOTTOMLEFT,
            Directions.BOTTOMRIGHT,
        ];

        for(const dir of directions) {
            const foundTile = tile.directions[dir];
            if (foundTile && foundTile.piece === Piece.EMPTY) foundTile.highlighted = true;
        }
    }

    private highlightPawn(tile: Tile) {
        const direction = tile.color === Color.WHITE ? Directions.TOP : Directions.BOTTOM;
        const foundTile = tile.directions[direction];
        if (foundTile) foundTile.highlighted = true;
    }

    private highlightKnight(tile: Tile) {
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

        for(const dirs of directions) {
            let foundTile = tile as Tile | undefined;
            dirs.forEach((d) => foundTile = foundTile?.directions[d])
            if (foundTile?.piece === Piece.EMPTY) foundTile.highlighted = true;
        }
    }

    public clearHighlight() {
        for (const row of this.board) {
            for (const tile of row) {
                tile.highlighted = false;
            }
        }
    }
}