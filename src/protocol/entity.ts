import { applyMask } from './utils';


export const enum EntityType {
    PLAYER,
    OBJECT,
    ITEM,
    PROJECTILE,
}


export type PlayerType = number;

export type ObjectType = number;

export interface ItemType {
    type: number;
    subtype: number;
}

export type ProjectileType = number;


export type Entity = PlayerEntity | ObjectEntity | ItemEntity | ProjectileEntity;

export interface EntityInterface {
    id: number;
    type: EntityType;
    subtype: PlayerType | ObjectType | ItemType | ProjectileType;
}

export interface PlayerEntity extends EntityInterface {
    type: EntityType.PLAYER;
    subtype: PlayerType;
}

export interface ObjectEntity extends EntityInterface {
    type: EntityType.OBJECT;
    subtype: ObjectType;
}

export interface ItemEntity extends EntityInterface {
    type: EntityType.ITEM;
    subtype: ItemType;
}

export interface ProjectileEntity extends EntityInterface {
    type: EntityType.PROJECTILE;
    subtype: ProjectileType;
}


// 4-byte wise
const ENTITY_TYPE_MASK      = 0xF0000000;
const ENTITY_TYPE_OFFSET    = 28;
const ENTITY_SUBTYPE_MASK   = 0x0F000000;
const ENTITY_SUBTYPE_OFFSET = 24;

const OBJECT_TYPE_MASK   = 0x00FF0000;
const OBJECT_TYPE_OFFSET = 16;

const ITEM_SUBTYPE_MASK   = 0x00FF0000;
const ITEM_SUBTYPE_OFFSET = 16;

const PROJECTILE_TYPE_MASK   = 0x00FF0000;
const PROJECTILE_TYPE_OFFSET = 16;

const COMMON_ID_MASK = 0x0000FFFF;

const PLAYER_ID_MASK     = COMMON_ID_MASK;
const OBJECT_ID_MASK     = COMMON_ID_MASK;
const ITEM_ID_MASK       = COMMON_ID_MASK;
const PROJECTILE_ID_MASK = COMMON_ID_MASK;

export const MAX_PLAYER_TYPE     = (ENTITY_SUBTYPE_MASK >>> ENTITY_SUBTYPE_OFFSET) + 1;
export const MAX_OBJECT_TYPE     = (OBJECT_TYPE_MASK >>> OBJECT_TYPE_OFFSET) + 1;
export const MAX_ITEM_TYPE       = (ENTITY_SUBTYPE_MASK >>> ENTITY_SUBTYPE_OFFSET) + 1;
export const MAX_ITEM_SUBTYPE    = (ITEM_SUBTYPE_MASK >>> ITEM_SUBTYPE_OFFSET) + 1;
export const MAX_PROJECTILE_TYPE = (PROJECTILE_TYPE_MASK >>> PROJECTILE_TYPE_OFFSET) + 1;
export const MAX_PLAYER_ID       = PLAYER_ID_MASK + 1;
export const MAX_OBJECT_ID       = OBJECT_ID_MASK + 1;
export const MAX_ITEM_ID         = ITEM_ID_MASK + 1;
export const MAX_PROJECTILE_ID   = PROJECTILE_ID_MASK + 1;


export function parsePlayer(player: number): PlayerEntity {
    const playerType = applyMask(player, ENTITY_SUBTYPE_MASK, ENTITY_SUBTYPE_OFFSET);

    return {
        id     : applyMask(player, COMMON_ID_MASK),
        type   : EntityType.PLAYER,
        subtype: playerType,
    };
}


export function forgePlayer(playerType: PlayerType, playerId: number) {
    return (
        (EntityType.PLAYER << ENTITY_TYPE_OFFSET) |
        ((playerType << ENTITY_SUBTYPE_OFFSET) & ENTITY_SUBTYPE_MASK) |
        (playerId & COMMON_ID_MASK)
    );
}


export function parseObject(object: number): ObjectEntity {
    const objectType = applyMask(object, OBJECT_TYPE_MASK, OBJECT_TYPE_OFFSET);

    return {
        id     : applyMask(object, COMMON_ID_MASK),
        type   : EntityType.OBJECT,
        subtype: objectType,
    };
}


export function forgeObject(objectType: ObjectType, objectId: number) {
    return (
        (EntityType.OBJECT << ENTITY_TYPE_OFFSET) |
        ((objectType << OBJECT_TYPE_OFFSET) & OBJECT_TYPE_MASK) |
        (objectId & COMMON_ID_MASK)
    );
}


export function parseItem(item: number): ItemEntity {
    const itemType    = applyMask(item, ENTITY_SUBTYPE_MASK, ENTITY_SUBTYPE_OFFSET);
    const itemSubtype = applyMask(item, ITEM_SUBTYPE_MASK, ITEM_SUBTYPE_OFFSET);

    return {
        id     : applyMask(item, COMMON_ID_MASK),
        type   : EntityType.ITEM,
        subtype: {
            type   : itemType,
            subtype: itemSubtype,
        },
    };
}


export function forgeItem(itemType: ItemType, itemId: number) {
    return (
        (EntityType.ITEM << ENTITY_TYPE_OFFSET) |
        ((itemType.type << ENTITY_SUBTYPE_OFFSET) & ENTITY_SUBTYPE_MASK) |
        ((itemType.subtype << ITEM_SUBTYPE_OFFSET) & ITEM_SUBTYPE_MASK) |
        (itemId & COMMON_ID_MASK)
    );
}


export function parseProjectile(projectile: number): ProjectileEntity {
    const projectileType = applyMask(projectile, PROJECTILE_TYPE_MASK, PROJECTILE_TYPE_OFFSET);

    return {
        id     : applyMask(projectile, COMMON_ID_MASK),
        type   : EntityType.PROJECTILE,
        subtype: projectileType,
    };
}


export function forgeProjectile(projectileType: ProjectileType, projectileId: number) {
    return (
        (EntityType.PROJECTILE << ENTITY_TYPE_OFFSET) |
        ((projectileType << PROJECTILE_TYPE_OFFSET) & PROJECTILE_TYPE_MASK) |
        (projectileId & COMMON_ID_MASK)
    );
}


export function parseEntity(entity: number) {
    const entityType: EntityType = applyMask(entity, ENTITY_TYPE_MASK, ENTITY_TYPE_OFFSET);

    switch (entityType) {
        case EntityType.PLAYER:
            return parsePlayer(entity);

        case EntityType.OBJECT:
            return parseObject(entity);

        case EntityType.ITEM:
            return parseItem(entity);

        case EntityType.PROJECTILE:
            return parseProjectile(entity);

        default:
            throw new Error(`Unknown entity type ${(entityType as number).toString(2)}`);
    }
}
