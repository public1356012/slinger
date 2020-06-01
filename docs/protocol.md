# Communication protocol

_This specification is a subject to change._

## Data types

All types are in **little-endian** byte order.

### Entity format

All entites are identfied by an **Entity** format.

The Entity format dictates that each identifiable entity be represented with 4 Bytes, and consist of minimum 2 parts:
- **EntityType** (mandatory) - entity type
- **EntitySubtype** - entity subtype
- **EntityId** (mandatory) - id identifying an entity across its type

The first byte specifies entity's **EntityType** [4 MSB] and an optional **EntitySubtype** [4 LSB].

**EntitySubtype** may span across multiple bytes. It doesn't have to fit in the 4 LSBs of the first byte.

The remaining 3 bytes have different meaning depending on the first byte.

<hr>

### Entity types

- 0 (PLAYER)
    + **PlayerType**s:
    + 0 (UNREGISTERED) - unregistered player
- 1 (OBJECT)
    + _reserved_
- 2 (ITEM)
    + **ItemType**s:
    + 0 (WEAPON)
    + 1 (CONSUMABLE)
- 3 (PROJECTILE)
    + _reserved_


#### Player
+ 0th byte - EntityType.PLAYER [4 MSB] | **PlayerType** [4 LSB]
+ 1st byte - _reserved_
+ 2nd and 3rd byte - **PlayerId** (id space shared by all **PlayerType**s)

#### Object
+ 0th byte - EntityType.OBJECT [4 MSB]
+ 1st byte - **ObjectType** - indentifies OBJECT's type, for example TELEPORT, CHEST, ...
+ 2nd and 3rd byte - **ObjectId** (unique id space for each **ObjectType**)

#### Item
+ 0th byte - EntityType.ITEM [4 MSB] | **ItemType** [4 LSB]
+ 1st byte - **ItemSubtype** - indentifies ITEM's subtype, for example WEAPON.AK_47, CONSUMABLE.HP_POTION, ...
+ 2nd and 3rd byte - **ItemId** (unique id space for each **ItemSubtype**)

#### Projectile
+ 0th byte - EntityType.PROJECTILE [4 MSB]
+ 1st byte - **ProjectileType** - indentifies PROJECTILE's type, for example BULLET_9MM, BOLT, ...
+ 2nd and 3rd byte - **ProjectileId** (unique id space for each **ProjectileType**)

<hr>

## Client-server communication

[4 bits] TYPE<br>
[4 bits] SUBTYPE<br>
[variable] OPTIONS

Types + subtypes + options:

* 0 (ACTION)
    - 0 (DIRECTION)
        + [3 bits] (DIRECTION) - signal movement direction relative to AIM_ANGLE
            + 0 - FORWARD
            + 1 - FORWARD_RIGHT
            + 2 - FORWARD_LEFT
            + 3 - BACKWARD_RIGHT
            + 4 - BACKWARD_LEFT
            + 5 - BACKWARD
            + 6 - RIGHT
            + 7 - LEFT
        + [1 bit] (USE_SELECTED_ITEM) - use selected item
            + 0 - IGNORE THIS FIELD
            + 1 - USE
        + [4 bits] _reserved_
    - 1 (AIM_ANGLE) - change aiming angle
        + {float} - angle given in radians
    - 2 (ITEM)
        + [2 bits] (ACTION)
            + 0 - SELECT
            + 1 - USE
            + 2 - DROP
            + 3 - PICK_UP
        + [2 bits] (ITEM_SLOT) - item slot number
        + [4 bits] _reserved_
        + {Item} - item to pick up (required only when ACTION == PICK_UP)
* 1 (CONNECTION)
    - 0 (PING) - ping server
    - 1 (PONG) - respond to server's ping
    - 2 (CONNECT) - request connection
        + {uint8} - username length (byte wise)
        + {UTF-8} - requested username
    - 3 (DISCONNECT) - signal disconnection
        + no options

## Server-client communication

[4 bits] TYPE<br>
[4 bits] SUBTYPE<br>
[variable] OPTIONS

Types + subtypes + options:
* 0 (WORLD)
    - 0 (TICK) - next server tick
        + {uint16} - server tick number
    - 1 (IDENTIFIABLE_PROJECTILES) - new projectiles originating from known origin
        + {uint8} - number of projectiles
            + {ProjectileType} - projectile type
            + {ProjectileId} - projectile id
            + {float} - angle given in radians
            + {PlayerId} - source player
    - 2 (ANONYMOUS_PROJECTILES) - projectiles of unknown origin
        + {uint8} - number of projectiles
            + {ProjectileType} - projectile type
            + {ProjectileId} - projectile id
            + {float} - angle given in radians
            + {float} - current _x_ coordinate
            + {float} - current _y_ coordinate
    - 3 (HITS) - projectile hits
        + {uint8} - number of hits
            + {Player | Object} - player/entity that got hit
            + {ProjectileId} - projectile id
            + {uint16} - damage dealt
    - 4 (ITEMS) - changes in players' selected items
        + {uint8} - number of players
            + {PlayerId} - player id
            + [1 Byte] {ItemType} - item type
            + {ItemSubtype} - item subtype
    - 5 (POSITIONS) - changes in surrounding players' positions
        + {uint8} - number of players
            + {PlayerId} - player id
            + {float} - current _x_ coordinate
            + {float} - current _y_ coordinate
    - 6 (AIM_ANGLES) - changes in surrounding players' aim angles
        + {uint8} - number of players
            + {PlayerId} - player id
            + {float} - angle given in radians
    - 7 (SPAWNS) - new surrounding OBJECTs/ITEMs spawns
        + {uint8} - number of entities
            + {Object | Item} - object/item that spawned
            + {float} - _x_ coordinate
            + {float} - _y_ coordinate
    - 8 (DESPAWNS) - disappearances of entities excluding PLAYERs
        + {uint8} - number of despawns
            + {Object | Item | Projectile} - object/item/projectile that disappeared
    - 9 (NEW_PLAYERS) - new players
        + {uint8} - number of players
        + {uint16} - total username length
            + {PlayerId} - player id
            + {uint8} - username length (byte wise)
            + {UTF-8} - username
    - 10 (ELIMINATIONS) - eliminations / disconnections of players
        + {uint8} - number of eliminations
            + {PlayerId} - eliminated player's id
            + {PlayerId} - eliminating player's id (PlayerId == 0 means disconnection)
            + {ItemSubtype} - WEAPON type used for elimination
* 1 (CONNECTION)
    - 0 (PING) - ping player
    - 1 (PONG) - respond to client's ping
    - 2 (ACK) - accept connection
        + {uint8} - username length (byte wise)
        + {float} - zone size
        + {uint8} - tick rate
        + {PlayerId} - player ID
        + {UTF-8} - assigned username (not necessarily requested username in case of a name conflict)
    - 3 (DISCONNECT) - disconnect player
        + {uint8} - reason code
