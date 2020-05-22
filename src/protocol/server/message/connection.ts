import { MessageType, MESSAGE_TYPE_OFFSET, MESSAGE_SUBTYPE_OFFSET } from '../message';


export const enum ConnectionMessage {
    PING,
    PONG,
    ACK,
    DISCONNECT,
}

const CONNECTION = MessageType.CONNECTION << MESSAGE_TYPE_OFFSET;

const PING_HEAD       = CONNECTION | (ConnectionMessage.PING << MESSAGE_SUBTYPE_OFFSET);
const PONG_HEAD       = CONNECTION | (ConnectionMessage.PONG << MESSAGE_SUBTYPE_OFFSET);
const ACK_HEAD        = CONNECTION | (ConnectionMessage.ACK << MESSAGE_SUBTYPE_OFFSET);
const DISCONNECT_HEAD = CONNECTION | (ConnectionMessage.DISCONNECT << MESSAGE_SUBTYPE_OFFSET);

// Number of bytes
const UINT8  = 1;
const UINT16 = 2;
const FLOAT  = 4;

const MESSAGE_HEAD_SIZE = UINT8;

export const ZONE_SIZE_SIZE       = FLOAT;
export const TICK_RATE_SIZE       = UINT8;
export const PLAYER_ID_SIZE       = UINT16;
export const DISCONNECT_CODE_SIZE = UINT8;
export const USERNAME_LENGTH_SIZE = UINT8;

export const MAX_ZONE_SIZE       = Number.MAX_VALUE;
export const MAX_TICK_RATE       = 2 ** (8 * TICK_RATE_SIZE);
export const MAX_DISCONNECT_CODE = 2 ** (8 * DISCONNECT_CODE_SIZE);
export const MAX_USERNAME_LENGTH = 2 ** (8 * USERNAME_LENGTH_SIZE);


export function ping() {
    return Buffer.from([PING_HEAD]);
}


export function pong() {
    return Buffer.from([PONG_HEAD]);
}


export function ack(zoneSize: number, tickRate: number, playerId: number, username: string) {
    const usernameLength = Buffer.byteLength(username);

    const bufferSize =
        MESSAGE_HEAD_SIZE +
        ZONE_SIZE_SIZE +
        TICK_RATE_SIZE +
        PLAYER_ID_SIZE +
        USERNAME_LENGTH_SIZE +
        usernameLength;

    const buffer = Buffer.alloc(bufferSize);

    buffer.writeUInt8(ACK_HEAD, 0);
    buffer.writeFloatLE(zoneSize, 1);
    buffer.writeUInt8(tickRate, 5);
    buffer.writeUInt16LE(playerId, 6);
    buffer.writeUInt8(usernameLength, 8);
    buffer.write(username, 9);

    return buffer;
}


export function disconnect(code: number) {
    const buffer = Buffer.alloc(MESSAGE_HEAD_SIZE + DISCONNECT_CODE_SIZE);

    buffer.writeInt8(DISCONNECT_HEAD, 0);
    buffer.writeInt8(code, 1);

    return buffer;
}
