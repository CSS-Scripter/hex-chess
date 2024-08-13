import { GameFactory } from "../factories/gameFactory";
import { Color } from "../types/color";
import { Move } from "../types/move";
import { Tile } from "../types/tile";

export abstract class Board {
    protected board: Tile[];

    constructor(protected factory: GameFactory) {
        this.board = [];
    }

    abstract doMove(from: string, to: string, promotion: string | undefined): Move;
    abstract isKingChecked(color: Color): boolean;
    abstract isCheckOrStalemate(color: Color): "" | "checkmate" | "stalemate";
    abstract serialize(): Record<string, any>[];

}