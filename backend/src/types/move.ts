import { Color } from "./color";
import { Piece } from "./piece";

export interface Move {
    notation: string;
    by: Color,
    from: string;
    to: string;
    piece: Piece;
    promotion: Piece;

    possibleFroms: string[];

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
        return `${m.to}=${pieceNotations[m.promotion]}`;
    }

    // [Piece][From if possibleFroms > 0][x if capture][To][+ if checked][# if mated][S if stale]
    let notation = pieceNotations[m.piece];
    notation += getFromNotation(m);
    if (m.capture) notation += 'x';
    notation += m.to.toLowerCase();

    if (m.mated) notation += '#';
    else if (m.checked) notation += '+';
    else if (m.stale) notation += 'S';

    m.notation = notation;
}

const getFromNotation = (m: Move): string => {
    if (m.possibleFroms?.length === 0) return '';

    const fromCol = m.from.charAt(0);
    const fromRow = m.from.slice(1);

    let hasPieceInSameRow = false;
    let hasPieceInSameCol = false;

    m.possibleFroms.forEach((f) => {
        if (f.charAt(0) === fromCol) hasPieceInSameCol = true;
        if (f.slice(1) === fromRow) hasPieceInSameRow = true;
    });

    if (!hasPieceInSameCol) return fromCol;
    if (!hasPieceInSameRow) return fromRow;
    return m.from;
}
