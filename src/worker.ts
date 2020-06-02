import * as cluster from 'cluster';

import options from './options';
import { Server, Client } from './server';
import { World, Cluster} from './world';
import { ack, disconnect } from './protocol/server/message/connection';
import { newPlayers, positions, Position, NewPlayer, tick, aimAngles, Angle, AnonymousProjectile, anonymousProjectiles, IdentifiableProjectile, identifiableProjectiles, Despawn, despawns, Elimination, eliminations} from './protocol/server/message/world';
import { Direction } from './protocol/client/message/action';
import { Player } from './moje';

const server = new Server(options.p);
const clients: { [id: number]: Client } = {};
const tickRate = 1000 / 30;
const zoneSize = 1000;
const world: World = new World(zoneSize, tickRate);
let currId = 1;
let tickN = 0;
server.on('client', (client) => {
    let uusername = "???";
    const id = currId;
    currId++;
    client.protocol.on('invalidByte', () => {
        if (!(id in world.players))
            world.removePlayer(id);
        delete clients[id];
        console.log(`Client (${uusername}) disconnected without notice`);
    });
    client.protocol.on('action.item', (action) => {
        if (!(id in world.players)) {
            delete clients[id];
            client.close();
        }
        else {
            world.use(id);
        }
    });
    client.protocol.once('connection.connect', (username) => {
        clients[id] = client;
        console.log(`New client: ${username}`);
        uusername = username;
        const added = username + id;
        world.addPlayer(id, added);
        const fajneDane = ack(zoneSize, tickRate, id, added);

        client.send(fajneDane);
    });
    client.protocol.on('action.useSelectedItem', () => {
        if (!(id in world.players)) {
            delete clients[id];
            client.close();
        }
        else {
            world.use(id);
        }
    });
    client.protocol.on('action.direction', (direction) => {
        if (!(id in world.players)) {
            delete clients[id];
            client.close();
        }
        else {
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
                case 7: world.changeVal(0, id, -Math.PI / 2);
                    break;
            }
        }
        //const fajneDane = ack(100, 30, 777, direction + '123');

        //client.send(fajneDane);
    });
    client.protocol.on('action.aimAngle', (angle) => {
        if (!(id in world.players)) {
            delete clients[id];
            client.close();
        }
        else {
            world.changeVal(1, id, angle);
        }
    });
    client.protocol.once('connection.disconnect', () => {
        console.log("fajnie zakonczone poloaczenie :)");
        delete clients[id];
        client.close();
    });

    client.on('close', () => {
        if (world.players[id] != undefined)
            world.removePlayer(id);
        delete clients[id];
        console.log(`Client (${uusername}) disconnected without notice`);
    });

    //client.tcpSocket.on('data', () => console.log("adsf"));
});

server.start();

console.log(`Worker ${cluster.worker.id} listening on port ${options.p}`);
// eslint-disable-next-line no-constant-condition

setInterval(() => {
    //console.log(`Cldisccted wt notice`);
    world.mainPart();
    for (const key in clients) {
        if (!(key in world.players)) {
            clients[key].close();
            delete clients[key];
            continue;
        }
        const client = clients[key];
        const thisPlayer = world.players[key];
        const pos: Position[] = [];
        const newP: NewPlayer[] = [];
        const proj: AnonymousProjectile[] = [];
        const projId: IdentifiableProjectile[] = [];
        const despawn: Despawn[] = [];
        const elimins: Elimination[] = [];
        // for (const player in world.players)
        //     pos.push({ playerId: world.players[player].id, x: world.players[player].x, y: world.players[player].y });
        //newP.push({ playerId: world.players[player].id, x: world.players[player].x ]);
        const neew = world.clusters[Math.floor(thisPlayer.x / zoneSize) + 1][Math.floor(thisPlayer.y / zoneSize) + 1];
        for (const players in neew.newPlayers) {
            newP.push(neew.newPlayers[players]);
            pos.push(neew.positions[players]);
        }
        for (const projectile in neew.projectiles)
            proj.push(neew.projectiles[projectile]);
        for (const projectile in neew.projectilIden)
            projId.push(neew.projectilIden[projectile]);
        for (const desP in neew.despawn)
            despawn.push(neew.despawn[desP]);
        for (const elimin in neew.elimins)
            elimins.push(neew.elimins[elimin]);
        const ang = aimAngles([{ angle: thisPlayer.angle, playerId: thisPlayer.id }]);
        //console.log(pos);
        const fajneDae = positions(pos);
        const faneDae = newPlayers(newP);
        const ticker = tick(tickN);
        client.send(faneDae);
        client.send(fajneDae);
        if (elimins[0] != undefined) {
            const spokoDan = eliminations(elimins);
            client.send(spokoDan);
        }
        if (despawn[0] != undefined) {
            const spokoDan = despawns(despawn);
            client.send(spokoDan);
        }
        if (projId[0] != undefined) {
            const spokoDan = identifiableProjectiles(projId);
            client.send(spokoDan);
        }
        if (proj[0] != undefined) {
            const spokoDane = anonymousProjectiles(proj);
            //client.send(spokoDane);
        }
        client.send(ang);
        client.send(ticker);
    }
    world.oldNewsProjectiles();
    tickN++;
    tickN = tickN % 1000;
}, tickRate);
//tu wysyłaj.

