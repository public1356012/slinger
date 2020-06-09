import * as cluster from 'cluster';

import options from './options';
import { Server, Client } from './server';
import { World, Cluster} from './world';
import { ack, disconnect, pong } from './protocol/server/message/connection';
import { newPlayers, positions, Position, NewPlayer, tick, aimAngles, Angle, AnonymousProjectile, anonymousProjectiles, IdentifiableProjectile, identifiableProjectiles, Despawn, despawns, Elimination, eliminations} from './protocol/server/message/world';
import { Direction, ItemAction, ItemSlot } from './protocol/client/message/action';
import { Player } from './objects';
import { Dir } from 'fs';


let zoneAmount = 100 * 1000 / options.z;
if (zoneAmount < 3)
    zoneAmount = 3;
const server = new Server(options.p);
const clients: { [id: number]: Client } = {};
const tickRate = 1000 / options.r;
const zoneSize = options.z;
const world: World = new World(zoneSize, tickRate);
let currId = 1;
let tickN = 0;
server.on('client', (client) => {
    let uusername = "???";
    const id = currId;
    currId++;
    client.protocol.on('invalidByte', () => {
        if (!(id in world.players))
            world.removePlayer(id, 0);
        delete clients[id];
        console.log(`Client (${uusername}) disconnected without notice`);
    });
    client.protocol.on('connection.ping', () => {
        const fajneDane = pong();
        client.send(fajneDane);
    });
    client.protocol.on('action.item', (action, slot) => {
        if (!(id in world.players)) {
            delete clients[id];
            client.close();
        }
        else {
            if (action == ItemAction.SELECT) {
                if (slot == ItemSlot.ONE)
                    world.players[id].weaponType = 0;
                else if (slot == ItemSlot.TWO)
                    world.players[id].weaponType = 1;
                else if (slot == ItemSlot.THREE)
                    world.players[id].weaponType = 2;
            }
            else {
                world.use(id);
            }
        }
    });
    client.protocol.once('connection.connect', (username) => {
        clients[id] = client;
        console.log(`New client: ${username}`);
        uusername = username;
        const added = username + id;
        world.addPlayer(id, added);
        const fajneDane = ack(options.z, options.r, id, added);

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
                case Direction.FORWARD: world.changeVal(0, id, 0);
                    break;
                case Direction.FORWARD_RIGHT: world.changeVal(0, id, -Math.PI / 4);
                    break;
                case Direction.FORWARD_LEFT: world.changeVal(0, id, Math.PI / 4);
                    break;
                case Direction.BACKWARD_RIGHT: world.changeVal(0, id, -3 * Math.PI / 4);
                    break;
                case Direction.BACKWARD_LEFT: world.changeVal(0, id, 3 * Math.PI / 4);
                    break;
                case Direction.BACKWARD: world.changeVal(0, id, -Math.PI);
                    break;
                case Direction.RIGHT: world.changeVal(0, id, -Math.PI / 2);
                    break;
                case Direction.LEFT: world.changeVal(0, id, Math.PI / 2);
                    break;
            }
        }
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
            world.removePlayer(id, 0);
        delete clients[id];
        console.log(`Client (${uusername}) disconnected without notice`);
    });
});

server.start();

console.log(`Worker ${cluster.worker.id} listening on port ${options.p}`);
// eslint-disable-next-line no-constant-condition
const informedPlayers: { [id: number]: Set<number> } = { [0]: new Set() };
const setDestroyed: Set<number> = new Set();
setInterval(() => {
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
        const angles: Angle[] = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const neew = world.clusters[Math.floor(thisPlayer.x / zoneSize) + zoneAmount + i][Math.floor(thisPlayer.y / zoneSize) + zoneAmount + j];
                for (const elimin in neew.elimins)
                    elimins.push(neew.elimins[elimin]);
                for (const angle in neew.angles)
                    angles.push(neew.angles[angle]);
                for (const players in neew.newPlayers) {
                    newP.push(neew.newPlayers[players]);
                    pos.push(neew.positions[players]);
                }
                for (const projectile in neew.projectilIden) {
                    if (informedPlayers[projectile] == undefined)
                        informedPlayers[projectile] = new Set();
                    if (informedPlayers[projectile] == undefined || !informedPlayers[projectile].has(thisPlayer.id)) {
                        informedPlayers[projectile].add(thisPlayer.id);
                        projId.push(neew.projectilIden[projectile]);
                    }
                }
                for (const projectile in neew.projectiles) {
                    if (informedPlayers[projectile] == undefined)
                        informedPlayers[projectile] = new Set();
                    if (informedPlayers[projectile] == undefined || !informedPlayers[projectile].has(thisPlayer.id)) {
                        informedPlayers[projectile].add(thisPlayer.id);
                        proj.push(neew.projectiles[projectile]);
                    }
                }
            }
        }
        for (const despawnedProjectile in world.despawn) {
            if (informedPlayers[despawnedProjectile] != undefined && informedPlayers[despawnedProjectile].has(thisPlayer.id)) {
                setDestroyed.add(Number(despawnedProjectile));
                despawn.push(world.despawn[despawnedProjectile]);
            }
        }
        const ang = aimAngles(angles);
        const fajneDae = positions(pos);
        const faneDae = newPlayers(newP);
        const ticker = tick(tickN);
        client.send(faneDae);
        client.send(fajneDae);
        if (elimins[0] != undefined) {
            const dane = eliminations(elimins);
            client.send(dane);
        }
        if (despawn[0] != undefined) {
            const dane = despawns(despawn);
            client.send(dane);
        }
        if (projId[0] != undefined) {
            const dane = identifiableProjectiles(projId);
            client.send(dane);
        }
        if (proj[0] != undefined) {
            const dane = anonymousProjectiles(proj);
            client.send(dane);
        }
        client.send(ang);
        client.send(ticker);
    }
    world.oldNewsProjectiles();
    tickN++;
    tickN = tickN % 1000;
}, tickRate);

