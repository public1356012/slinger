export const enum MessageType {
    WORLD,
    CONNECTION,
}

export const MESSAGE_TYPE_MASK      = 0b11110000;
export const MESSAGE_TYPE_OFFSET    = 4;
export const MESSAGE_SUBTYPE_MASK   = 0b00001111;
export const MESSAGE_SUBTYPE_OFFSET = 0;
