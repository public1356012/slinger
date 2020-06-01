import { EventEmitter } from 'events';
import * as net from 'net';

import { handleClientMessage } from './protocol/client/message';
import type ClientEventEmitter from './protocol/client/event';


type ClientCloseListener = (err: boolean) => void;
type ServerClientListener = (client: Client) => void;


export interface Client {
    once(event: 'close', listener: ClientCloseListener): this;
    on(event: 'close', listener: ClientCloseListener): this;
    off(event: 'close', listener: ClientCloseListener): this;
    emit(event: 'close', err: boolean): boolean;
}

export class Client extends EventEmitter {
    private tcpSocket: net.Socket;
    public protocol: ClientEventEmitter = new EventEmitter();

    constructor(tcpSocket: net.Socket) {
        super();

        this.tcpSocket = tcpSocket;

        let incompleteData: Buffer | undefined;

        this.tcpSocket.on('data', (data) => {
            let bufferOffset = 0;

            if (incompleteData) {
                data = Buffer.concat([incompleteData, data]);
                incompleteData = undefined;
            }

            do {
                const bytesRead = handleClientMessage(data, bufferOffset, this.protocol);

                if (bytesRead > 0) {
                    bufferOffset += bytesRead;
                }
                else {
                    incompleteData = Buffer.from(data, bufferOffset);

                    return;
                }
            } while (bufferOffset < data.byteLength && !incompleteData);
        });

        this.tcpSocket.on('close', (err) => {
            this.emit('close', err);
        });
    }

    send(data: Buffer) {
        this.tcpSocket.write(data);
    }

    close() {
        this.tcpSocket.end();
    }
}


export interface Server {
    once(event: 'client', listener: ServerClientListener): this;
    on(event: 'client', listener: ServerClientListener): this;
    off(event: 'client', listener: ServerClientListener): this;
}

export class Server extends EventEmitter {
    private tcpServer: net.Server;
    private port: number;

    constructor(port: number) {
        super();

        this.port = port;

        this.tcpServer = net.createServer((clientSocket) => {
            const client = new Client(clientSocket);

            this.emit('client', client);
        });
    }

    public start() {
        this.tcpServer.listen(this.port);
    }

    public stop() {
        this.tcpServer.close();
    }
}
