export enum Color {
    BLACK = "black",
    WHITE = "white",
    NONE = "",
}

export const getOppositeColor = (color: Color): Color => {
    switch (color) {
        case Color.NONE: return Color.NONE;
        case Color.BLACK: return Color.WHITE;
        case Color.WHITE: return Color.BLACK;
        default: return Color.NONE;
    }
}