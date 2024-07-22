import { Color } from "./color";
import { Directions } from "./directions";
import { Piece } from "./piece";

export type Tile = {
    name: string;
    piece: Piece;
    color: Color;
    gradient: 0 | 1 | 2;
    highlighted: boolean;
    isInitialPosition: boolean;
    previouslyDoubleMoved: boolean;

    directions: Record<Directions, Tile | undefined>;
}