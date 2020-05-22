/* eslint-disable max-len */

import type { EventEmitter } from 'events';

import { Direction, ItemAction, ItemSlot } from './message/action';
import { ItemEntity } from '../entity';

type ActionDirectionListener = (direction: Direction) => void;
type ActionAimAngleListener = (angle: number) => void;
type ActionItemListener = (action: ItemAction, slot: ItemSlot, item?: ItemEntity) => void;
type ActionUseSelectedItemListener = () => void;
type ConnectionPingListener = () => void;
type ConnectionPongListener = () => void;
type ConnectionConnectListener = (username: string) => void;
type ConnectionDisconnectListener = () => void;
type InvalidByteListener = () => void;

export default interface ClientEventEmitter extends EventEmitter {
    addListener(event: 'action.direction', listener: ActionDirectionListener): this;
    addListener(event: 'action.aimAngle', listener: ActionAimAngleListener): this;
    addListener(event: 'action.item', listener: ActionItemListener): this;
    addListener(event: 'action.useSelectedItem', listener: ActionUseSelectedItemListener): this;
    addListener(event: 'connection.ping', listener: ConnectionPingListener): this;
    addListener(event: 'connection.pong', listener: ConnectionPongListener): this;
    addListener(event: 'connection.connect', listener: ConnectionConnectListener): this;
    addListener(event: 'connection.disconnect', listener: ConnectionDisconnectListener): this;
    addListener(event: 'invalidByte', listener: InvalidByteListener): this;

    emit(event: 'action.direction', direction: Direction): boolean;
    emit(event: 'action.aimAngle', angle: number): boolean;
    emit(event: 'action.item', action: ItemAction, slot: number): boolean;
    emit(event: 'action.item', action: ItemAction.PICK_UP, slot: ItemSlot, item: ItemEntity): boolean;
    emit(event: 'action.useSelectedItem'): boolean;
    emit(event: 'connection.ping'): boolean;
    emit(event: 'connection.pong'): boolean;
    emit(event: 'connection.connect', username: string): boolean;
    emit(event: 'connection.disconnect'): boolean;
    emit(event: 'invalidByte'): boolean;

    on(event: 'action.direction', listener: ActionDirectionListener): this;
    on(event: 'action.aimAngle', listener: ActionAimAngleListener): this;
    on(event: 'action.item', listener: ActionItemListener): this;
    on(event: 'action.useSelectedItem', listener: ActionUseSelectedItemListener): this;
    on(event: 'connection.ping', listener: ConnectionPingListener): this;
    on(event: 'connection.pong', listener: ConnectionPongListener): this;
    on(event: 'connection.connect', listener: ConnectionConnectListener): this;
    on(event: 'connection.disconnect', listener: ConnectionDisconnectListener): this;
    on(event: 'invalidByte', listener: InvalidByteListener): this;

    once(event: 'action.direction', listener: ActionDirectionListener): this;
    once(event: 'action.aimAngle', listener: ActionAimAngleListener): this;
    once(event: 'action.item', listener: ActionItemListener): this;
    once(event: 'action.useSelectedItem', listener: ActionUseSelectedItemListener): this;
    once(event: 'connection.ping', listener: ConnectionPingListener): this;
    once(event: 'connection.pong', listener: ConnectionPongListener): this;
    once(event: 'connection.connect', listener: ConnectionConnectListener): this;
    once(event: 'connection.disconnect', listener: ConnectionDisconnectListener): this;
    once(event: 'invalidByte', listener: InvalidByteListener): this;

    prependListener(event: 'action.direction', listener: ActionDirectionListener): this;
    prependListener(event: 'action.aimAngle', listener: ActionAimAngleListener): this;
    prependListener(event: 'action.item', listener: ActionItemListener): this;
    prependListener(event: 'action.useSelectedItem', listener: ActionUseSelectedItemListener): this;
    prependListener(event: 'connection.ping', listener: ConnectionPingListener): this;
    prependListener(event: 'connection.pong', listener: ConnectionPongListener): this;
    prependListener(event: 'connection.connect', listener: ConnectionConnectListener): this;
    prependListener(event: 'connection.disconnect', listener: ConnectionDisconnectListener): this;
    prependListener(event: 'invalidByte', listener: InvalidByteListener): this;

    prependOnceListener(event: 'action.direction', listener: ActionDirectionListener): this;
    prependOnceListener(event: 'action.aimAngle', listener: ActionAimAngleListener): this;
    prependOnceListener(event: 'action.item', listener: ActionItemListener): this;
    prependOnceListener(event: 'action.useSelectedItem', listener: ActionUseSelectedItemListener): this;
    prependOnceListener(event: 'connection.ping', listener: ConnectionPingListener): this;
    prependOnceListener(event: 'connection.pong', listener: ConnectionPongListener): this;
    prependOnceListener(event: 'connection.connect', listener: ConnectionConnectListener): this;
    prependOnceListener(event: 'connection.disconnect', listener: ConnectionDisconnectListener): this;
    prependOnceListener(event: 'invalidByte', listener: InvalidByteListener): this;
}
