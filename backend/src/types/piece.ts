export enum Piece {
    KING = '♔♚',
    QUEEN = '♕♛',
    BISCHOP = '♗♝',
    KNIGHT = '♘♞',
    ROOK = '♖♜',
    PAWN = '♙♟︎',
    EMPTY = '',
}

export const pieceToUTF8 = (piece: Piece): string => {
    switch (piece) {
        case Piece.KING: return 'king';
        case Piece.QUEEN: return 'queen';
        case Piece.BISCHOP: return 'bischop';
        case Piece.KNIGHT: return 'knight';
        case Piece.ROOK: return 'rook';
        case Piece.PAWN: return 'pawn';
        default: return '';
    }
}

export const utf8ToPiece = (piece: string): Piece => {
    switch (piece) {
        case 'king': return Piece.KING;
        case 'queen': return Piece.QUEEN;
        case 'bischop': return Piece.BISCHOP;
        case 'knight': return Piece.KNIGHT;
        case 'rook': return Piece.ROOK;
        case 'pawn': return Piece.PAWN;
        default: return Piece.EMPTY;
    }
}