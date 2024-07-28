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
}