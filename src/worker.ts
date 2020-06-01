import * as cluster from 'cluster';

import options from './options';
import { Server, Client } from './server';
import { World, Cluster} from './world';
import { ack, disconnect } from './protocol/server/message/connection';
import { newPlayers, positions, Position, NewPlayer, tick, aimAngles, Angle} from './protocol/server/message/world';
import { Direction } from './protocol/client/message/action';
import { Player } from './moje';

const server = new Server(options.p);
const clients: { [id: number]: Client } = {};
const zoneSize = 1000;
const world: World = new World(zoneSize);
let currId = 1;
let tickN = 0;
server.on('client', (client) => {
    let uusername = "???";
    const id = currId;
    currId++;
    client.protocol.on('invalidByte', () => console.log("Adsf"));
    client.protocol.once('connection.connect', (username) => {
        clients[id] = client;
        console.log(`New client: ${username}`);
        uusername = username;
        const added = username + id;
        world.addPlayer(id, added);
        const fajneDane = ack(100, 30, id, added);

        client.send(fajneDane);
    });
    client.protocol.on('action.direction', (direction) => {
        if (!(id in world.players)) {
            delete clients[id];
            client.close();
        }
        else {
            world.use(id);
            console.log(direction);
            switch (direction) {
                case 0: world.changeVal(0, id, 0);
                    break;
                case Direction.FORWARD_RIGHT: world.changeVal(0, id, Math.PI / 4);
                    break;
                case 2: world.changeVal(0, id, -Math.PI / 4);
                    break;
                case 3: world.changeVal(0, id, 3 * Math.PI / 4);
                    break;
                case 4: world.changeVal(0, id, -3 * Math.PI / 4);
                    break;
                case 5: world.changeVal(0, id, -Math.PI);
                    break;
                case 6: world.changeVal(0, id, Math.PI / 2);
                    break;
                case 7: world.changeVal(0, id, Math.PI / 2);
                    break;
            }
        }
        //const fajneDane = ack(100, 30, 777, direction + '123');

        //client.send(fajneDane);
    });
    client.protocol.on('action.aimAngle', (angle) => {
        world.changeVal(1, id, angle);
    });
    client.protocol.once('connection.disconnect', () => {
        console.log("fajnie zakonczone poloaczenie :)");
        delete clients[id];
        client.close();
    });

    client.on('close', () => {
        world.removePlayer(id);
        delete clients[id];
        console.log(`Client (${uusername}) disconnected without notice`);
    });
});

server.start();

console.log(`Worker ${cluster.worker.id} listening on port ${options.p}`);
// eslint-disable-next-line no-constant-condition

setInterval(() => {
    //console.log(`Cldisccted wt notice`);
    world.mainPart();
    for (const key in clients) {
        const client = clients[key];
        const thisPlayer = world.players[key];
        const pos: Position[] = [];
        const newP: NewPlayer[] = [];
        for (const player in world.players)
            pos.push({ playerId: world.players[player].id, x: world.players[player].x, y: world.players[player].y });
        //newP.push({ playerId: world.players[player].id, x: world.players[player].x ]);
        const neew = world.clusters[Math.floor(thisPlayer.x / zoneSize) + 1][Math.floor(thisPlayer.y / zoneSize) + 1];
        for (const players in neew.newPlayers) {
            newP.push(neew.newPlayers[players]);
        }
        const ang = aimAngles([{ angle: 0, playerId: thisPlayer.id }]);
        const fajneDae = positions(pos);
        const faneDae = newPlayers(newP);
        const ticker = tick(tickN);
        client.send(faneDae);
        client.send(ang);
        console.log(pos);
        //client.send(newPlayers([{ playerId: 777, username: "asd" }]));
        client.send(fajneDae);
        client.send(ticker);
    }
    tickN++;
    tickN = tickN % 1000;
}, 1000);
//tu wysyłaj.

