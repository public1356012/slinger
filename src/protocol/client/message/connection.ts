import type ClientEventEmitter from '../event';

import { areBytesMissing, isByteMissing } from '../../utils';

export const enum ConnectionMessage {
    PING,
    PONG,
    CONNECT,
    DISCONNECT,
}

export default function handleConnectionMessage(
    messageType: ConnectionMessage,
    buffer: Buffer,
    bufferOffset: number,
    eventEmitter: ClientEventEmitter,
): number {
    switch (messageType) {
        case ConnectionMessage.PING:
            eventEmitter.emit('connection.ping');

            return 0;

        case ConnectionMessage.PONG:
            eventEmitter.emit('connection.pong');

            return 0;

        case ConnectionMessage.CONNECT: {
            if (isByteMissing(buffer, bufferOffset))
                return -1;

            const usernameLength = buffer.readUInt8(bufferOffset);

            if (areBytesMissing(buffer, bufferOffset, usernameLength))
                return -1 - usernameLength;

            const username =
                buffer.toString('utf8', bufferOffset + 1, bufferOffset + 1 + usernameLength);

            eventEmitter.emit('connection.connect', username);

            return 1 + usernameLength;
        }

        case ConnectionMessage.DISCONNECT:
            eventEmitter.emit('connection.disconnect');

            return 0;

        default:
            eventEmitter.emit('invalidByte');

            return 0;
    }
}
