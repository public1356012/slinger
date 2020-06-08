import { MessageType, MESSAGE_TYPE_OFFSET, MESSAGE_SUBTYPE_OFFSET } from '../message';


export const enum WorldMessage {
    TICK,
    IDENTIFIABLE_PROJECTILES,
    ANONYMOUS_PROJECTILES,
    HITS,
    ITEMS,
    POSITIONS,
    AIM_ANGLES,
    SPAWNS,
    DESPAWNS,
    NEW_PLAYERS,
    ELIMINATIONS,
}

const WORLD = MessageType.WORLD << MESSAGE_TYPE_OFFSET;

const TICK_HEAD = WORLD | (WorldMessage.TICK << MESSAGE_SUBTYPE_OFFSET);
const IDENTIFIABLE_PROJECTILES_HEAD =
    WORLD | (WorldMessage.IDENTIFIABLE_PROJECTILES << MESSAGE_SUBTYPE_OFFSET);
const ANONYMOUS_PROJECTILES_HEAD =
    WORLD | (WorldMessage.ANONYMOUS_PROJECTILES << MESSAGE_SUBTYPE_OFFSET);
const HITS_HEAD         = WORLD | (WorldMessage.HITS << MESSAGE_SUBTYPE_OFFSET);
const ITEMS_HEAD        = WORLD | (WorldMessage.ITEMS << MESSAGE_SUBTYPE_OFFSET);
const POSITIONS_HEAD    = WORLD | (WorldMessage.POSITIONS << MESSAGE_SUBTYPE_OFFSET);
const AIM_ANGLES_HEAD   = WORLD | (WorldMessage.AIM_ANGLES << MESSAGE_SUBTYPE_OFFSET);
const SPAWNS_HEAD       = WORLD | (WorldMessage.SPAWNS << MESSAGE_SUBTYPE_OFFSET);
const DESPAWNS_HEAD     = WORLD | (WorldMessage.DESPAWNS << MESSAGE_SUBTYPE_OFFSET);
const NEW_PLAYERS_HEAD  = WORLD | (WorldMessage.NEW_PLAYERS << MESSAGE_SUBTYPE_OFFSET);
const ELIMINATIONS_HEAD = WORLD | (WorldMessage.ELIMINATIONS << MESSAGE_SUBTYPE_OFFSET);

// Number of bytes
const UINT8  = 1;
const UINT16 = 2;
const INT32  = 4;
const FLOAT  = 4;

const MAX_PACKAGE_SIZE_VALUE = 2 ** 8 - 1;

const MESSAGE_HEAD_SIZE = UINT8;
const PACKAGE_SIZE_SIZE = UINT8;
const MAX_PACKAGE_SIZE = 2 ** 8;
const TOTAL_USERNAME_LENGTH_SIZE = UINT16;

export const TICK_NUMBER_SIZE     = UINT16;
export const PROJECTILE_TYPE_SIZE = UINT8;
export const PROJECTILE_ID_SIZE   = UINT16;
export const PLAYER_ID_SIZE       = UINT16;
export const ANGLE_SIZE           = FLOAT;
export const COORDINATE_SIZE      = FLOAT;
export const ENTITY_SIZE          = INT32;
export const DAMAGE_SIZE          = UINT16;
export const ITEM_TYPE_SIZE       = UINT8;
export const ITEM_SUBTYPE_SIZE    = UINT8;
export const USERNAME_LENGTH_SIZE = UINT8;

export const MAX_TICK_NUMBER     = 2 ** (8 * TICK_NUMBER_SIZE);
export const MAX_ANGLE           = Number.MAX_VALUE;
export const MAX_COORDINATE      = Number.MAX_VALUE;
export const MAX_DAMAGE          = 2 ** (8 * DAMAGE_SIZE);
export const MAX_USERNAME_LENGTH = 2 ** (8 * USERNAME_LENGTH_SIZE);

export interface IdentifiableProjectile {
    projectileType: number;
    projectileId: number;
    angle: number;
    playerId: number;
}

export interface AnonymousProjectile {
    projectileType: number;
    projectileId: number;
    angle: number;
    x: number;
    y: number;
}

export interface Hit {
    entity: number;
    projectileId: number;
    damage: number;
}

export interface Item {
    playerId: number;
    itemType: number;
    itemSubtype: number;
}

export interface Position {
    playerId: number;
    x: number;
    y: number;
}

export interface Angle {
    playerId: number;
    angle: number;
}

export interface Spawn {
    entity: number;
    x: number;
    y: number;
}

export interface Despawn {
    entity: number;
}

export interface NewPlayer {
    playerId: number;
    username: string;
}

export interface Elimination {
    victim: number;
    villain: number;
    weaponType: number;
}


export function tick(tickNumber: number) {
    const bufferSize =
        MESSAGE_HEAD_SIZE +
        TICK_NUMBER_SIZE;

    const buffer = Buffer.alloc(bufferSize);

    buffer.writeUInt8(TICK_HEAD, 0);
    buffer.writeUInt16LE(tickNumber, 1);

    return buffer;
}


export function identifiableProjectiles(projectiles: IdentifiableProjectile[]) {
    let numberOfProjectiles = projectiles.length;

    let bufferOffset = 0;

    const numberOfMessages = Math.floor(numberOfProjectiles / MAX_PACKAGE_SIZE) + 1;

    const bufferSize =
        numberOfMessages * (
            MESSAGE_HEAD_SIZE +
            PACKAGE_SIZE_SIZE
        ) +
        numberOfProjectiles * (
            PROJECTILE_TYPE_SIZE +
            PROJECTILE_ID_SIZE +
            ANGLE_SIZE +
            PLAYER_ID_SIZE
        );

    const buffer = Buffer.alloc(bufferSize);

    for (let i = 0; i < numberOfMessages; ++i) {
        const packageSize = Math.min(numberOfProjectiles, MAX_PACKAGE_SIZE_VALUE);

        numberOfProjectiles -= packageSize;

        buffer.writeUInt8(IDENTIFIABLE_PROJECTILES_HEAD, bufferOffset++);
        buffer.writeUInt8(packageSize, bufferOffset++);

        for (let j = 0; j < packageSize; ++j) {
            const projectile = projectiles[j];

            buffer.writeUInt8(projectile.projectileType, bufferOffset);
            bufferOffset += PROJECTILE_TYPE_SIZE;

            buffer.writeUInt16LE(projectile.projectileId, bufferOffset);
            bufferOffset += PROJECTILE_ID_SIZE;

            buffer.writeFloatLE(projectile.angle, bufferOffset);
            bufferOffset += ANGLE_SIZE;

            buffer.writeUInt16LE(projectile.playerId, bufferOffset);
            bufferOffset += PLAYER_ID_SIZE;
        }
    }

    return buffer;
}


export function anonymousProjectiles(projectiles: AnonymousProjectile[]) {
    let numberOfProjectiles = projectiles.length;

    let bufferOffset = 0;

    const numberOfMessages = Math.floor(numberOfProjectiles / MAX_PACKAGE_SIZE) + 1;

    const bufferSize =
        numberOfMessages * (
            MESSAGE_HEAD_SIZE +
            PACKAGE_SIZE_SIZE
        ) +
        numberOfProjectiles * (
            PROJECTILE_TYPE_SIZE +
            PROJECTILE_ID_SIZE +
            ANGLE_SIZE +
            COORDINATE_SIZE +
            COORDINATE_SIZE
        );

    const buffer = Buffer.alloc(bufferSize);

    for (let i = 0; i < numberOfMessages; ++i) {
        const packageSize = Math.min(numberOfProjectiles, MAX_PACKAGE_SIZE_VALUE);

        numberOfProjectiles -= packageSize;

        buffer.writeUInt8(ANONYMOUS_PROJECTILES_HEAD, bufferOffset++);
        buffer.writeUInt8(packageSize, bufferOffset++);

        for (let j = 0; j < packageSize; ++j) {
            const projectile = projectiles[j];

            buffer.writeUInt8(projectile.projectileType, bufferOffset);
            bufferOffset += PROJECTILE_TYPE_SIZE;

            buffer.writeUInt16LE(projectile.projectileId, bufferOffset);
            bufferOffset += PROJECTILE_ID_SIZE;

            buffer.writeFloatLE(projectile.angle, bufferOffset);
            bufferOffset += ANGLE_SIZE;

            buffer.writeFloatLE(projectile.x, bufferOffset);
            bufferOffset += COORDINATE_SIZE;

            buffer.writeFloatLE(projectile.y, bufferOffset);
            bufferOffset += COORDINATE_SIZE;
        }
    }

    return buffer;
}


export function hits(hits: Hit[]) {
    let numberOfHits = hits.length;

    let bufferOffset = 0;

    const numberOfMessages = Math.floor(numberOfHits / MAX_PACKAGE_SIZE) + 1;

    const bufferSize =
        numberOfMessages * (
            MESSAGE_HEAD_SIZE +
            PACKAGE_SIZE_SIZE
        ) +
        numberOfHits * (
            ENTITY_SIZE +
            PROJECTILE_ID_SIZE +
            DAMAGE_SIZE
        );

    const buffer = Buffer.alloc(bufferSize);

    for (let i = 0; i < numberOfMessages; ++i) {
        const packageSize = Math.min(numberOfHits, MAX_PACKAGE_SIZE_VALUE);

        numberOfHits -= packageSize;

        buffer.writeUInt8(HITS_HEAD, bufferOffset++);
        buffer.writeUInt8(packageSize, bufferOffset++);

        for (let j = 0; j < packageSize; ++j) {
            const hit = hits[j];

            buffer.writeInt32LE(hit.entity, bufferOffset);
            bufferOffset += ENTITY_SIZE;

            buffer.writeUInt16LE(hit.projectileId, bufferOffset);
            bufferOffset += PROJECTILE_ID_SIZE;

            buffer.writeUInt16LE(hit.damage, bufferOffset);
            bufferOffset += DAMAGE_SIZE;
        }
    }

    return buffer;
}


export function items(items: Item[]) {
    let numberOfItems = items.length;

    let bufferOffset = 0;

    const numberOfMessages = Math.floor(numberOfItems / MAX_PACKAGE_SIZE) + 1;

    const bufferSize =
        numberOfMessages * (
            MESSAGE_HEAD_SIZE +
            PACKAGE_SIZE_SIZE
        ) +
        numberOfItems * (
            PLAYER_ID_SIZE +
            ITEM_TYPE_SIZE +
            ITEM_SUBTYPE_SIZE
        );

    const buffer = Buffer.alloc(bufferSize);

    for (let i = 0; i < numberOfMessages; ++i) {
        const packageSize = Math.min(numberOfItems, MAX_PACKAGE_SIZE_VALUE);

        numberOfItems -= packageSize;

        buffer.writeUInt8(ITEMS_HEAD, bufferOffset++);
        buffer.writeUInt8(packageSize, bufferOffset++);

        for (let j = 0; j < packageSize; ++j) {
            const item = items[j];

            buffer.writeUInt16LE(item.playerId, bufferOffset);
            bufferOffset += PLAYER_ID_SIZE;

            buffer.writeUInt8(item.itemType, bufferOffset);
            bufferOffset += ITEM_TYPE_SIZE;

            buffer.writeUInt8(item.itemSubtype, bufferOffset);
            bufferOffset += ITEM_SUBTYPE_SIZE;
        }
    }

    return buffer;
}


export function positions(positions: Position[]) {
    let numberOfPositions = positions.length;

    let bufferOffset = 0;

    const numberOfMessages = Math.floor(numberOfPositions / MAX_PACKAGE_SIZE) + 1;

    const bufferSize =
        numberOfMessages * (
            MESSAGE_HEAD_SIZE +
            PACKAGE_SIZE_SIZE
        ) +
        numberOfPositions * (
            PLAYER_ID_SIZE +
            COORDINATE_SIZE +
            COORDINATE_SIZE
        );

    const buffer = Buffer.alloc(bufferSize);

    for (let i = 0; i < numberOfMessages; ++i) {
        const packageSize = Math.min(numberOfPositions, MAX_PACKAGE_SIZE_VALUE);

        numberOfPositions -= packageSize;

        buffer.writeUInt8(POSITIONS_HEAD, bufferOffset++);
        buffer.writeUInt8(packageSize, bufferOffset++);

        for (let j = 0; j < packageSize; ++j) {
            const position = positions[j];

            buffer.writeUInt16LE(position.playerId, bufferOffset);
            bufferOffset += PLAYER_ID_SIZE;

            buffer.writeFloatLE(position.x, bufferOffset);
            bufferOffset += COORDINATE_SIZE;

            buffer.writeFloatLE(position.y, bufferOffset);
            bufferOffset += COORDINATE_SIZE;
        }
    }

    return buffer;
}


export function aimAngles(angles: Angle[]) {
    let numberOfAngles = angles.length;

    let bufferOffset = 0;

    const numberOfMessages = Math.floor(numberOfAngles / MAX_PACKAGE_SIZE) + 1;

    const bufferSize =
        numberOfMessages * (
            MESSAGE_HEAD_SIZE +
            PACKAGE_SIZE_SIZE
        ) +
        numberOfAngles * (
            PLAYER_ID_SIZE +
            ANGLE_SIZE
        );

    const buffer = Buffer.alloc(bufferSize);

    for (let i = 0; i < numberOfMessages; ++i) {
        const packageSize = Math.min(numberOfAngles, MAX_PACKAGE_SIZE_VALUE);

        numberOfAngles -= packageSize;

        buffer.writeUInt8(AIM_ANGLES_HEAD, bufferOffset++);
        buffer.writeUInt8(packageSize, bufferOffset++);

        for (let j = 0; j < packageSize; ++j) {
            const angle = angles[j];

            buffer.writeUInt16LE(angle.playerId, bufferOffset);
            bufferOffset += PLAYER_ID_SIZE;

            buffer.writeFloatLE(angle.angle, bufferOffset);
            bufferOffset += ANGLE_SIZE;
        }
    }

    return buffer;
}


export function spawns(spawns: Spawn[]) {
    let numberOfSpawns = spawns.length;

    let bufferOffset = 0;

    const numberOfMessages = Math.floor(numberOfSpawns / MAX_PACKAGE_SIZE) + 1;

    const bufferSize =
        numberOfMessages * (
            MESSAGE_HEAD_SIZE +
            PACKAGE_SIZE_SIZE
        ) +
        numberOfSpawns * (
            ENTITY_SIZE +
            COORDINATE_SIZE +
            COORDINATE_SIZE
        );

    const buffer = Buffer.alloc(bufferSize);

    for (let i = 0; i < numberOfMessages; ++i) {
        const packageSize = Math.min(numberOfSpawns, MAX_PACKAGE_SIZE_VALUE);

        numberOfSpawns -= packageSize;

        buffer.writeUInt8(SPAWNS_HEAD, bufferOffset++);
        buffer.writeUInt8(packageSize, bufferOffset++);

        for (let j = 0; j < packageSize; ++j) {
            const spawn = spawns[j];

            buffer.writeInt32LE(spawn.entity, bufferOffset);
            bufferOffset += ENTITY_SIZE;

            buffer.writeFloatLE(spawn.x, bufferOffset);
            bufferOffset += COORDINATE_SIZE;

            buffer.writeFloatLE(spawn.y, bufferOffset);
            bufferOffset += COORDINATE_SIZE;
        }
    }

    return buffer;
}


export function despawns(despawns: Despawn[]) {
    let numberOfDespawns = despawns.length;

    let bufferOffset = 0;

    const numberOfMessages = Math.floor(numberOfDespawns / MAX_PACKAGE_SIZE) + 1;

    const bufferSize =
        numberOfMessages * (
            MESSAGE_HEAD_SIZE +
            PACKAGE_SIZE_SIZE
        ) +
        numberOfDespawns * (
            ENTITY_SIZE
        );

    const buffer = Buffer.alloc(bufferSize);

    for (let i = 0; i < numberOfMessages; ++i) {
        const packageSize = Math.min(numberOfDespawns, MAX_PACKAGE_SIZE_VALUE);

        numberOfDespawns -= packageSize;

        buffer.writeUInt8(DESPAWNS_HEAD, bufferOffset++);
        buffer.writeUInt8(packageSize, bufferOffset++);

        for (let j = 0; j < packageSize; ++j) {
            const despawn = despawns[j];

            buffer.writeInt32LE(despawn.entity, bufferOffset);
            bufferOffset += ENTITY_SIZE;
        }
    }

    return buffer;
}


export function newPlayers(newPlayers: NewPlayer[]) {
    let numberOfNewPlayers = newPlayers.length;

    const usernameLengths = new Array(numberOfNewPlayers);

    let totalUsernameLength = 0;

    // Get username lengths
    for (let i = 0; i < numberOfNewPlayers; ++i) {
        const usernameLength = Buffer.byteLength(newPlayers[i].username);

        usernameLengths[i] = usernameLength;

        totalUsernameLength += usernameLength;
    }

    let bufferOffset = 0;

    const numberOfMessages = Math.floor(numberOfNewPlayers / MAX_PACKAGE_SIZE) + 1;

    const bufferSize =
        numberOfMessages * (
            MESSAGE_HEAD_SIZE +
            PACKAGE_SIZE_SIZE +
            TOTAL_USERNAME_LENGTH_SIZE
        ) +
        numberOfNewPlayers * (
            PLAYER_ID_SIZE +
            USERNAME_LENGTH_SIZE
        ) +
        totalUsernameLength;

    const buffer = Buffer.alloc(bufferSize);

    for (let i = 0; i < numberOfMessages; ++i) {
        const packageSize = Math.min(numberOfNewPlayers, MAX_PACKAGE_SIZE_VALUE);

        numberOfNewPlayers -= packageSize;

        buffer.writeUInt8(NEW_PLAYERS_HEAD, bufferOffset++);
        buffer.writeUInt8(packageSize, bufferOffset++);

        buffer.writeUInt16LE(totalUsernameLength, bufferOffset);
        bufferOffset += TOTAL_USERNAME_LENGTH_SIZE;

        for (let j = 0; j < packageSize; ++j) {
            const newPlayer = newPlayers[j];

            buffer.writeUInt16LE(newPlayer.playerId, bufferOffset);
            bufferOffset += PLAYER_ID_SIZE;

            buffer.writeUInt8(usernameLengths[j], bufferOffset);
            bufferOffset += USERNAME_LENGTH_SIZE;

            buffer.write(newPlayer.username, bufferOffset);
            bufferOffset += usernameLengths[j];
        }
    }

    return buffer;
}


export function eliminations(eliminations: Elimination[]) {
    let numberOfEliminations = eliminations.length;

    let bufferOffset = 0;

    const numberOfMessages = Math.floor(numberOfEliminations / MAX_PACKAGE_SIZE) + 1;

    const bufferSize =
        numberOfMessages * (
            MESSAGE_HEAD_SIZE +
            PACKAGE_SIZE_SIZE
        ) +
        numberOfEliminations * (
            PLAYER_ID_SIZE +
            PLAYER_ID_SIZE +
            ITEM_SUBTYPE_SIZE
        );

    const buffer = Buffer.alloc(bufferSize);

    for (let i = 0; i < numberOfMessages; ++i) {
        const packageSize = Math.min(numberOfEliminations, MAX_PACKAGE_SIZE_VALUE);

        numberOfEliminations -= packageSize;

        buffer.writeUInt8(ELIMINATIONS_HEAD, bufferOffset++);
        buffer.writeUInt8(packageSize, bufferOffset++);

        for (let j = 0; j < packageSize; ++j) {
            const elimination = eliminations[j];

            buffer.writeUInt16LE(elimination.victim, bufferOffset);
            bufferOffset += PLAYER_ID_SIZE;

            buffer.writeUInt16LE(elimination.villain, bufferOffset);
            bufferOffset += PLAYER_ID_SIZE;

            buffer.writeUInt8(elimination.weaponType, bufferOffset);
            bufferOffset += ITEM_SUBTYPE_SIZE;
        }
    }

    return buffer;
}
