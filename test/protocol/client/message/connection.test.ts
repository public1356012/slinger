import * as chai from 'chai';
import { expect, spy } from 'chai';
import * as spies from 'chai-spies';
import { EventEmitter } from 'events';

import handleConnectionMessage, { ConnectionMessage } from './connection';

import type ClientEventEmitter from '../event';

chai.use(spies);

describe('Protocol.client.message.connection', () => {
    const eventEmitter: ClientEventEmitter = new EventEmitter();

    describe('PING', () => {
        it('should emit connection.ping', () => {
            const listener = spy();

            eventEmitter.once('connection.ping', listener);

            handleConnectionMessage(
                ConnectionMessage.PING,
                Buffer.from([]),
                0,
                eventEmitter,
            );

            expect(listener).to.have.been.called();
        });
    });

    describe('PONG', () => {
        it('should emit connection.pong', () => {
            const listener = spy();

            eventEmitter.once('connection.pong', listener);

            handleConnectionMessage(
                ConnectionMessage.PONG,
                Buffer.from([]),
                0,
                eventEmitter,
            );

            expect(listener).to.have.been.called();
        });
    });

    describe('CONNECT', () => {
        it('should return -1 if payload is incomplete', () => {
            const result = handleConnectionMessage(
                ConnectionMessage.CONNECT,
                Buffer.from([]),
                0,
                eventEmitter,
            );

            expect(result).to.eq(-1);
        });

        it('should return -(1 + usernameLength) if payload is incomplete', () => {
            const result = handleConnectionMessage(
                ConnectionMessage.CONNECT,
                Buffer.from([10]),
                0,
                eventEmitter,
            );

            expect(result).to.eq(-(1 + 10));
        });

        it('should return (1 + usernameLength) and emit connection.connect \
if payload is complete', () => {
            const username = 'nice player ☺️';
            const usernameLength = Buffer.byteLength(username);

            const buffer = Buffer.alloc(1 + usernameLength);

            buffer.writeUInt8(usernameLength, 0);
            buffer.write(username, 1);

            const listener = spy();

            eventEmitter.once('connection.connect', listener);

            const result = handleConnectionMessage(
                ConnectionMessage.CONNECT,
                buffer,
                0,
                eventEmitter,
            );

            expect(result).to.eq(1 + usernameLength);
            expect(listener).to.have.been.called.with.exactly(username);
        });
    });

    describe('DISCONNECT', () => {
        it('should emit connection.disconnect', () => {
            const listener = spy();

            eventEmitter.once('connection.disconnect', listener);

            handleConnectionMessage(
                ConnectionMessage.DISCONNECT,
                Buffer.from([]),
                0,
                eventEmitter,
            );

            expect(listener).to.have.been.called();
        });
    });
});
