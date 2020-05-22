import type ClientEventEmitter from '../event';

import { isByteMissing, areBytesMissing, applyMask } from '../../utils';
import { parseEntity, EntityType } from '../../entity';

export const enum ActionMessage {
    DIRECTION,
    AIM_ANGLE,
    ITEM,
}

export const enum Direction {
    FORWARD,
    FORWARD_RIGHT,
    FORWARD_LEFT,
    BACKWARD_RIGHT,
    BACKWARD_LEFT,
    BACKWARD,
    RIGHT,
    LEFT,
}

export const enum ItemAction {
    SELECT,
    USE,
    DROP,
    PICK_UP,
}

export const enum ItemSlot {
    ONE,
    TWO,
    THREE,
    FOUR,
}

export const DIRECTION_MASK           = 0b11100000;
export const DIRECTION_OFFSET         = 5;
export const USE_SELECTED_ITEM_MASK   = 0b00010000;
export const USE_SELECTED_ITEM_OFFSET = 4;

export const ITEM_ACTION_MASK   = 0b11000000;
export const ITEM_ACTION_OFFSET = 6;
export const ITEM_SLOT_MASK     = 0b00110000;
export const ITEM_SLOT_OFFSET   = 4;

export default function handleActionMessage(
    actionType: ActionMessage,
    buffer: Buffer,
    bufferOffset: number,
    eventEmitter: ClientEventEmitter,
): number {
    switch (actionType) {
        case ActionMessage.DIRECTION: {
            if (isByteMissing(buffer, bufferOffset))
                return -1;

            const byte = buffer.readUInt8(bufferOffset);

            const direction: Direction =
                applyMask(byte, DIRECTION_MASK, DIRECTION_OFFSET);
            const useSelectedItem =
                applyMask(byte, USE_SELECTED_ITEM_MASK, USE_SELECTED_ITEM_OFFSET);

            eventEmitter.emit('action.direction', direction);

            if (useSelectedItem)
                eventEmitter.emit('action.useSelectedItem');

            return 1;
        }

        case ActionMessage.AIM_ANGLE: {
            if (areBytesMissing(buffer, bufferOffset, 4))
                return -4;

            const angle = buffer.readFloatLE(bufferOffset);

            eventEmitter.emit('action.aimAngle', angle);

            return 4;
        }

        case ActionMessage.ITEM: {
            if (isByteMissing(buffer, bufferOffset))
                return -1;

            const byte = buffer.readUInt8(bufferOffset);

            const action: ItemAction = applyMask(byte, ITEM_ACTION_MASK, ITEM_ACTION_OFFSET);
            const slot: ItemSlot     = applyMask(byte, ITEM_SLOT_MASK, ITEM_SLOT_OFFSET);

            if (action === ItemAction.PICK_UP) {
                if (areBytesMissing(buffer, bufferOffset, 4))
                    return -5;

                const item = parseEntity(buffer.readInt32LE(bufferOffset + 1));

                if (item.type !== EntityType.ITEM)
                    eventEmitter.emit('invalidByte');
                else
                    eventEmitter.emit('action.item', action, slot, item);

                return 5;
            }
            else {
                eventEmitter.emit('action.item', action, slot);

                return 1;
            }
        }

        default:
            eventEmitter.emit('invalidByte');

            return 0;
    }
}
