import { Piece } from "./piece";

export interface Move {
    notation: string;
    from: string;
    to: string;
    piece: Piece;
    promotion: Piece;

    capture: boolean;
    checked: boolean;
    mated: boolean;
    stale: boolean;
}

const pieceNotations = {
    [Piece.KING]: 'K',
    [Piece.QUEEN]: 'Q',
    [Piece.BISCHOP]: 'B',
    [Piece.KNIGHT]: 'N',
    [Piece.ROOK]: 'R',
    [Piece.PAWN]: '',
} as Record<Piece, string>;

export const AnnotateMove = (m: Move) => {
    if (m.promotion !== Piece.EMPTY) {
        return `${m.to}${pieceNotations[m.promotion]}`;
    }

    // [Piece][From][x if capture][To][+ if checked][# if mated][S if stale]
    let notation = pieceNotations[m.piece];
    notation += m.from.toLocaleLowerCase();
    if (m.capture) notation += 'x';
    notation += m.to.toLowerCase();

    if (m.mated) notation += '#';
    else if (m.checked) notation += '+';
    else if (m.stale) notation += 'S';

    m.notation = notation;
}
