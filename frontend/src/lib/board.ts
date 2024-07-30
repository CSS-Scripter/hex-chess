export type Tile = {
    name: string,
    piece: string,
    color: string,
    gradient: 0 | 1 | 2;
    highlight: string;
    highlighted: boolean;
}

export class Board {
    private board: Tile[][];

    constructor(tiles: Tile[]) {
        this.board = [];
        let i = 0;
        for(let y = 0; y < 11; y++) {
            const rows = Math.min(1 + (y * 2), 11);
            this.board.push([]);
            for(let x = 0; x < rows; x++) {
                this.board[y].push(tiles[i]);
                i++;
            }
        }
    }

    public getBoard() {
        return this.board;
    }

    public clearHighlight() {
        for (const row of this.board) {
            for (const tile of row) {
                tile.highlighted = false;
            }
        }
    }

    public clearHighlightLabels() {
        for (const row of this.board) {
            for (const tile of row) {
                tile.highlight = '';
            }
        }
    }

    public highlightWithLabel(tiles: string[], label: string) {
        for (const row of this.board) {
            for (const tile of row) {
                tile.highlight = tiles.includes(tile.name) ? label : tile.highlight;
            }
        }
    }

    public highlightTiles(tiles: string[]) {
        for (const row of this.board) {
            for (const tile of row) {
                tile.highlighted = tiles.includes(tile.name);
            }
        }
    }

    public doMove(move: Record<string, any>) {
        const from = move.from;
        const to = move.to;
        const fromTile = this.getTile(from);
        const toTile = this.getTile(to);

        if (move.enPassant) {
            const enPassantTile = this.getTile(move.enPassantCaptureTile);
            if (!enPassantTile) throw new Error('failed to run move');

            enPassantTile.color = '';
            enPassantTile.piece = '';
        }

        if (!fromTile || !toTile) {
            throw new Error('failed to run move');
        }

        toTile.color = fromTile.color;
        toTile.piece = fromTile.piece;
        
        fromTile.color = '';
        fromTile.piece = '';

        if (move.promotion !== '') {
            toTile.piece = move.promotion;
        }
    }

    public revertMove(move: Record<string, any>) {
        const from = move.from;
        const to = move.to;
        const fromTile = this.getTile(from);
        const toTile = this.getTile(to);

        if (move.enPassant) {
            const enPassantTile = this.getTile(move.enPassantCaptureTile);
            if (!enPassantTile) throw new Error('failed to run move');

            enPassantTile.color = move.capturedColor;
            enPassantTile.piece = move.capturedPiece;
        }

        if (!fromTile || !toTile) {
            throw new Error('failed to run move');
        }

        fromTile.color = toTile.color;
        fromTile.piece = toTile.piece;
        
        if (move.capture && !move.enPassant) {
            toTile.color = move.capturedColor;
            toTile.piece = move.capturedPiece;
        } else {
            toTile.color = '';
            toTile.piece = '';
        }

        if (move.promotion !== '') {
            fromTile.piece = move.piece;
        }

    }

    private getTile(name: string) {
        for (const row of this.board) {
            for (const tile of row) {
                if (tile.name === name) return tile;
            }
        }
        return;
    }
}