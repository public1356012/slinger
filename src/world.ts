import { Player, Obstacle, Projectile } from './moje';
import { newPlayers, positions, Position, NewPlayer, AnonymousProjectile, IdentifiableProjectile, Despawn, Elimination, Angle} from './protocol/server/message/world';
import { forgeProjectile } from './protocol/entity';
const zoneAmount = 5;
export class Cluster {
    public newPlayers: { [id: number]: NewPlayer } = {};
    public positions: { [id: number]: Position } = {};
    public angles: { [id: number]: Angle } = {};
    public projectiles: { [id: number]: AnonymousProjectile } = {};
    public projectilIden: { [id: number]: IdentifiableProjectile } = {};
    public despawn: { [id: number]: Despawn } = {};
    public elimins: { [id: number]: Elimination } = {};
    public xl: number;
    public xu: number;
    public yl: number;
    public yu: number;
    public constructor(xl: number, xu: number, yl: number, yu: number) {
        this.xl = xl;
        this.xu = xu;
        this.yl = yl;
        this.yu = yu;
    }
    public addElimination(idVictim: number, idKiller: number) {
        this.elimins[idVictim] = { victim: idVictim, villain: idKiller, weaponType: 0 };
    }
    public addDespawn(id: number) {
        this.despawn[id] = { entity: forgeProjectile(0, id) };
    }
    public addNewPlayer(id: number, name: string) {
        this.newPlayers[id] = { playerId: id, username: name };
    }
    public addAngle(id: number, angle: number) {
        this.angles[id] = { playerId: id, angle: angle };
    }
    public addProjectile(id: number, x: number, y: number, angle: number) {
        this.projectiles[id] = { projectileId: id, projectileType: 10, angle: angle, x: x, y: y };
    }
    public addNewProjectile(id: number, playerId: number, angle: number) {
        this.projectilIden[id] = { projectileType: 0, projectileId: id, playerId: playerId, angle: angle };
    }
    public addPosition(id: number, x: number, y: number) {
        this.positions[id] = { playerId: id, x: x, y: y };
    }
    public inside(x: number, y: number): number[] {
        let tempX = 0;
        let tempY = 0;
        if (x > this.xu)
            tempX += 1;
        else if (x < this.xl)
            tempX -= 1;
        if (y > this.yu)
            tempY += 1;
        else if (y < this.yl)
            tempY -= 1;
        return [tempX, tempY];
    }
}
export class World {
    public players: { [id: number]: Player } = {};
    public obstacles: Array<Obstacle> = [];
    public projectiles: Array<Projectile> = [];
    public despawn: { [id: number]: Despawn } = {};
    public clusters: Cluster[][] = [];
    public zoneSize = 1000;
    public projId = 2;
    public tickRate = 0;
    public oldNewsProjectiles() {
        this.despawn = {};
        for (const clust of this.clusters) {
            for (const er of clust) {
                er.projectilIden = {};
                er.despawn = {};
                er.elimins = {};
            }
        }
    }
    public constructor(zoneSize: number, tickRate: number) {
        this.zoneSize = zoneSize;
        this.tickRate = tickRate;
        for (let i = 0; i < zoneAmount * 2; i++) {
            this.clusters[i] = [];
            for (let j = 0; j < zoneAmount * 2; j++)
                this.clusters[i].push(new Cluster((i - zoneAmount) * zoneSize, (i - zoneAmount + 1) * zoneSize, (j - zoneAmount) * zoneSize, (j - zoneAmount + 1) * zoneSize));
        }
    }
    public deleteFrom() {
        this.clusters[0][0];
    }
    public mainPart() {
        for (const [i, projectile] of this.projectiles.entries()) {
            const [x, y] = projectile.position();
            const [x2, y2] = projectile.move();
            projectile.ttl--;
            if (projectile.ttl <= 0) {
                this.removeProjectile(x, y, projectile.selfId, i);
                continue;
            }
            let collision = false;
            for (const key in this.players) {
                const player = this.players[key];
                if (player.id != projectile.id && player.inside(x, y, x2, y2, projectile.size)) {
                    console.log(player.hp);
                    this.removeProjectile(x, y, projectile.selfId, i);
                    if (player.takeDamage(projectile.damage)) {
                        this.clusters[Math.floor(player.x / this.zoneSize) + zoneAmount][Math.floor(player.y / this.zoneSize) + zoneAmount].addElimination(player.id, projectile.id);
                        this.removePlayer(player.id, 1);
                    }
                    // this.projectiles.splice(i, 1);
                    // this.clusters[Math.floor(projectile.x / this.zoneSize) + 1][Math.floor(projectile.y / this.zoneSize) + 1].addDespawn(projectile.selfId);
                    // delete this.clusters[Math.floor(projectile.x / this.zoneSize) + 1][Math.floor(projectile.y / this.zoneSize) + 1].projectiles[projectile.selfId]; //
                    collision = true;
                    break;
                }
            }
            if (collision)
                break;
            for (const obstacle of this.obstacles) {
                if (obstacle.inside(x, y, x2, y2, projectile.size)) {
                    this.removeProjectile(x, y, projectile.selfId, i);
                    collision = true;
                    break;
                }
            }
            if (collision)
                break;
            this.changeClustersProjectile(x, y, x2, y2, projectile.id, projectile.angle);
            projectile.switchPosition(x2, y2);
        }

        for (const key in this.players) {
            const player = this.players[key];
            if (player.reload > 0)
                player.reload--;
            if (player.useIntention && player.reload < 1) {
                player.reload = 15;
                this.projectiles.push(new Projectile(player.id, this.projId, player.x, player.y, 3, player.angle));
                this.clusters[Math.floor(player.x / this.zoneSize) + zoneAmount][Math.floor(player.y / this.zoneSize) + zoneAmount].addNewProjectile(this.projId, player.id, player.angle);
                this.clusters[Math.floor(player.x / this.zoneSize) + zoneAmount][Math.floor(player.y / this.zoneSize) + zoneAmount].addProjectile(this.projId++, player.x, player.y, player.angle);//
            }
            player.useIntention = false;
            if (!player.moveIntention)
                continue;
            const [x2, y2] = player.move();
            const [x, y] = player.position();
            let death = false;
            for (const [i, projectile] of this.projectiles.entries()) { //
                if (player.id != projectile.id && projectile.inside(x, y, x2, y2, player.size)) {
                    if (player.takeDamage(projectile.damage)) {
                        death = true;
                        this.clusters[Math.floor(player.x / this.zoneSize) + zoneAmount][Math.floor(player.y / this.zoneSize) + zoneAmount].addElimination(player.id, projectile.id);
                        this.removePlayer(player.id, 1);
                    }
                    this.removeProjectile(projectile.x, projectile.y, projectile.selfId, i);
                }
            }
            if (death)
                break;
            for (const obstacle of this.obstacles) {
                if (obstacle.inside(x, y, x2, y2, player.size)) {
                    death = true;
                    break;
                }
            }
            if (death)
                break;
            this.changeClustersPlayer(x, y, x2, y2, player.id, player.angle);
            player.switchPosition(x2, y2);
            player.moveIntention = false;
        }
    }
    public changeClustersProjectile(x1: number, y1: number, x2: number, y2: number, id: number, angle: number) {
        const x = Math.floor(x1 / this.zoneSize) + zoneAmount;
        const y = Math.floor(y1 / this.zoneSize) + zoneAmount;
        const [Xer, Yer] = this.clusters[x][y].inside(x2, y2);
        if (Xer != 0 || Yer != 0) {
            delete this.clusters[x][y].projectiles[id];
            this.clusters[x + Xer][y + Yer].addProjectile(id, x2, y2, angle);
            console.log("Bang");
        }
        else {
            delete this.clusters[x][y].projectiles[id];
            this.clusters[x][y].addProjectile(id, x2, y2, angle);
        }
    }
    public changeClustersPlayer(x1: number, y1: number, x2: number, y2: number, id: number, angle: number) {
        const x = Math.floor(x1 / this.zoneSize) + zoneAmount;
        const y = Math.floor(y1 / this.zoneSize) + zoneAmount;
        const [Xer, Yer] = this.clusters[x][y].inside(x2, y2);
        if (Xer != 0 || Yer != 0) {
            const name =  this.clusters[x][y].newPlayers[id].username;
            delete this.clusters[x][y].newPlayers[id];
            delete this.clusters[x][y].positions[id];
            delete this.clusters[x][y].angles[id];
            this.clusters[x + Xer][y + Yer].addAngle(id, angle);
            this.clusters[x + Xer][y + Yer].addNewPlayer(id, name);
            this.clusters[x + Xer][y + Yer].addPosition(id, x2, y2);
            console.log("Bang");
        }
        else {
            delete this.clusters[x][y].positions[id];
            this.clusters[x][y].addPosition(id, x2, y2);
        }
    }
    public addDespawn(id: number) {
        this.despawn[id] = { entity: forgeProjectile(0, id) };
    }
    public removeProjectile(x1: number, y1: number, id: number, count: number) {
        const x = Math.floor(x1 / this.zoneSize) + zoneAmount;
        const y = Math.floor(y1 / this.zoneSize) + zoneAmount;
        this.projectiles.splice(count, 1);
        this.addDespawn(id);
        //this.clusters[x][y].addDespawn(id);
        delete this.clusters[x][y].projectiles[id];
    }
    public addPlayer(id: number, name: string) {
        const tempX = 50;
        const tempY = 50;
        this.clusters[Math.floor(tempX / this.zoneSize) + zoneAmount][Math.floor(tempY / this.zoneSize) + zoneAmount].addNewPlayer(id, name);
        this.clusters[Math.floor(tempX / this.zoneSize) + zoneAmount][Math.floor(tempY / this.zoneSize) + zoneAmount].addPosition(id, tempX, tempY);
        this.clusters[Math.floor(tempX / this.zoneSize) + zoneAmount][Math.floor(tempY / this.zoneSize) + zoneAmount].addAngle(id, 0);
        this.players[id] = (new Player(id, tempX, tempY, 20));
    }
    public removePlayer(id: number, type: number) {
        if (type == 0)
            this.clusters[Math.floor(this.players[id].x / this.zoneSize) + zoneAmount][Math.floor(this.players[id].y / this.zoneSize) + zoneAmount].addElimination(id, 0);
        delete this.clusters[Math.floor(this.players[id].x / this.zoneSize) + zoneAmount][Math.floor(this.players[id].y / this.zoneSize) + zoneAmount].newPlayers[id];
        delete this.clusters[Math.floor(this.players[id].x / this.zoneSize) + zoneAmount][Math.floor(this.players[id].y / this.zoneSize) + zoneAmount].angles[id];
        delete this.clusters[Math.floor(this.players[id].x / this.zoneSize) + zoneAmount][Math.floor(this.players[id].y / this.zoneSize) + zoneAmount].positions[id];
        delete this.players[id];
    }
    public use(id: number) {
        this.players[id].useIntention = true;
    }
    public changeVal(type: number, id: number, value: number) {
        switch (type) {
            case 0: {
                this.players[id].direction = value;
                this.players[id].moveIntention = true;
            }
                break;
            case 1: {
                this.players[id].angle = value;
                const x = Math.floor(this.players[id].x / this.zoneSize) + zoneAmount;
                const y = Math.floor(this.players[id].y / this.zoneSize) + zoneAmount;
                delete this.clusters[x][y].angles[id];
                this.clusters[x][y].addAngle(id, value);
            }
                break;
            case 2: this.players[id].angle = value;
                break;
        }
    }
}
