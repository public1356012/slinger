import type ClientEventEmitter from './event';

import handleActionMessage from './message/action';
import handleConnectionMessage from './message/connection';

import { increaseModulus, applyMask } from '../utils';

export const enum MessageType {
    ACTION,
    CONNECTION,
}

export const MESSAGE_TYPE_MASK      = 0b11110000;
export const MESSAGE_TYPE_OFFSET    = 4;
export const MESSAGE_SUBTYPE_MASK   = 0b00001111;
export const MESSAGE_SUBTYPE_OFFSET = 0;

export function handleClientMessage(
    buffer: Buffer,
    bufferOffset: number,
    eventEmitter: ClientEventEmitter,
): number {
    const byte = buffer.readUInt8(0);

    const messageType    = applyMask(byte, MESSAGE_TYPE_MASK, MESSAGE_TYPE_OFFSET);
    const messageSubtype = applyMask(byte, MESSAGE_SUBTYPE_MASK, MESSAGE_SUBTYPE_OFFSET);

    switch (messageType) {
        case MessageType.ACTION:
            return increaseModulus(handleActionMessage(
                messageSubtype, buffer, bufferOffset + 1, eventEmitter), 1);

        case MessageType.CONNECTION:
            return increaseModulus(handleConnectionMessage(
                messageSubtype, buffer, bufferOffset + 1, eventEmitter), 1);

        default:
            eventEmitter.emit('invalidByte');

            return 1;
    }
}
