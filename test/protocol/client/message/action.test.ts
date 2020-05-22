import * as chai from 'chai';
import { expect, spy } from 'chai';
import * as spies from 'chai-spies';
import { EventEmitter } from 'events';

import { forgeItem, parseItem } from '../../entity';

import handleMessageAction, {
    ActionMessage,
    Direction,
    ItemAction,
    ItemSlot,
    DIRECTION_OFFSET,
    USE_SELECTED_ITEM_OFFSET,
    ITEM_ACTION_OFFSET,
    ITEM_SLOT_OFFSET,
} from './action';

import type ClientEventEmitter from '../event';


chai.use(spies);


describe('Protocol.client.message.action', () => {
    const eventEmitter: ClientEventEmitter = new EventEmitter();

    describe('DIRECTION', () => {
        it('should return -1 if payload is incomplete', () => {
            const result = handleMessageAction(
                ActionMessage.DIRECTION,
                Buffer.from([]),
                0,
                eventEmitter,
            );

            expect(result).to.eq(-1);
        });

        it('should return 1 and emit action.direction if payload is complete', () => {
            const listener = spy();

            eventEmitter.once('action.direction', listener);

            const result = handleMessageAction(
                ActionMessage.DIRECTION,
                Buffer.from([Direction.BACKWARD_LEFT << DIRECTION_OFFSET]),
                0,
                eventEmitter,
            );

            expect(result).to.eq(1);
            expect(listener).to.have.been.called.with.exactly(Direction.BACKWARD_LEFT);
        });

        it('should emit action.useSelectedItem if USE_SELECTED_ITEM bit is set', () => {
            const listener = spy();

            eventEmitter.once('action.useSelectedItem', listener);

            handleMessageAction(
                ActionMessage.DIRECTION,
                Buffer.from([1 << USE_SELECTED_ITEM_OFFSET]),
                0,
                eventEmitter,
            );

            expect(listener).to.have.been.called();
        });
    });

    describe('AIM_ANGLE', () => {
        it('should return -4 if payload is incomplete', () => {
            const buffer = Buffer.alloc(3);

            const result = handleMessageAction(
                ActionMessage.AIM_ANGLE,
                buffer,
                0,
                eventEmitter,
            );

            expect(result).to.eq(-4);
        });

        it('should return 4 and emit action.aimAngle if payload is complete', () => {
            const buffer = Buffer.alloc(4);

            buffer.writeFloatLE(1.0, 0);

            const listener = spy();

            eventEmitter.once('action.aimAngle', listener);

            const result = handleMessageAction(
                ActionMessage.AIM_ANGLE,
                buffer,
                0,
                eventEmitter,
            );

            expect(result).to.eq(4);
            expect(listener).to.have.been.called.with.exactly(1.0);
        });
    });

    describe('ITEM', () => {
        it('should return -1 if payload is incomplete', () => {
            const result = handleMessageAction(
                ActionMessage.ITEM,
                Buffer.from([]),
                0,
                eventEmitter,
            );

            expect(result).to.eq(-1);
        });

        it('should return -5 if ItemAction == PICK_UP and payload is incomplete', () => {
            const result = handleMessageAction(
                ActionMessage.ITEM,
                Buffer.from([ItemAction.PICK_UP << ITEM_ACTION_OFFSET]),
                0,
                eventEmitter,
            );

            expect(result).to.eq(-5);
        });

        it('should return 1 and emit action.item if payload is complete', () => {
            const listener = spy();

            eventEmitter.once('action.item', listener);

            const result = handleMessageAction(
                ActionMessage.ITEM,
                Buffer.from([
                    (ItemAction.USE << ITEM_ACTION_OFFSET) |
                    (ItemSlot.ONE << ITEM_SLOT_OFFSET)]),
                0,
                eventEmitter,
            );

            expect(result).to.eq(1);
            expect(listener).to.have.been.called.with.exactly(ItemAction.USE, ItemSlot.ONE);
        });

        it('should return 5 and emit action.item if ItemAction === PICK_UP and payload is \
complete', () => {
            const itemEntity = forgeItem({ type: 0, subtype: 1 }, 123);

            const buffer = Buffer.alloc(5);

            buffer.writeUInt8(
                (ItemAction.PICK_UP << ITEM_ACTION_OFFSET) |
                (ItemSlot.TWO << ITEM_SLOT_OFFSET), 0);
            buffer.writeInt32LE(itemEntity, 1);

            const listener = spy();

            eventEmitter.once('action.item', listener);

            const result = handleMessageAction(
                ActionMessage.ITEM,
                buffer,
                0,
                eventEmitter,
            );

            expect(result).to.eq(5);
            expect(listener).to.have.been.called.with.exactly(
                ItemAction.PICK_UP, ItemSlot.TWO, parseItem(itemEntity));
        });
    });
});
