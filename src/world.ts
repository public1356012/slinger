import { Player, Obstacle, Projectile } from './moje';
import { newPlayers, positions, Position, NewPlayer, AnonymousProjectile, IdentifiableProjectile, Despawn, Elimination} from './protocol/server/message/world';
import { forgeProjectile } from './protocol/entity';
export class Cluster {
    public newPlayers: { [id: number]: NewPlayer } = {};
    public positions: { [id: number]: Position } = {};
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
    public clusters: Cluster[][] = [];
    public zoneSize = 1000;
    public projId = 2;
    public tickRate = 0;
    public oldNewsProjectiles() {
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
        this.clusters[0] = [];
        this.clusters[1] = [];
        this.clusters[1].push(new Cluster(0, zoneSize, -zoneSize, 0));
        this.clusters[1].push(new Cluster(0, zoneSize, 0, zoneSize));
        this.clusters[0].push(new Cluster(-zoneSize, 0, -zoneSize, 0));
        this.clusters[0].push(new Cluster(-zoneSize, 0, 0, zoneSize));
    }
    public mainPart() {
        //console.log(Object.keys(this.projectiles).length);
        for (const [i, projectile] of this.projectiles.entries()) {
            //console.log(projectile.x, projectile.y);
            projectile.ttl--;
            if (projectile.ttl <= 0) {
                this.projectiles.splice(i, 1);
                this.clusters[Math.floor(projectile.x / this.zoneSize) + 1][Math.floor(projectile.y / this.zoneSize) + 1].addDespawn(projectile.selfId);
                delete this.clusters[Math.floor(projectile.x / this.zoneSize) + 1][Math.floor(projectile.y / this.zoneSize) + 1].projectiles[projectile.selfId];
                continue;
            }
            const [x, y] = projectile.position();
            const [x2, y2] = projectile.move();
            let collision = false;
            //console.log(x, y, x2, y2);
            for (const key in this.players) {
                const player = this.players[key];
                if (player.id != projectile.id && player.inside(x, y, x2, y2, projectile.size)) {
                    // console.log("AAAAAAAAAAAAAAA");
                    //  console.log(player.hp);
                    console.log(player.hp);
                    if (player.takeDamage(projectile.damage)) {
                        this.clusters[Math.floor(player.x / this.zoneSize) + 1][Math.floor(player.y / this.zoneSize) + 1].addElimination(player.id, projectile.id);
                        this.removePlayer(player.id);
                        //delete this.players[key];
                    }
                    this.projectiles.splice(i, 1);
                    this.clusters[Math.floor(projectile.x / this.zoneSize) + 1][Math.floor(projectile.y / this.zoneSize) + 1].addDespawn(projectile.selfId);
                    delete this.clusters[Math.floor(projectile.x / this.zoneSize) + 1][Math.floor(projectile.y / this.zoneSize) + 1].projectiles[projectile.selfId]; //
                    collision = true;
                    break;
                }
            }
            if (collision)
                break;
            for (const obstacle of this.obstacles) {
                if (obstacle.inside(x, y, x2, y2, projectile.size)) {
                    //Destroy self.
                    this.projectiles.splice(i, 1);
                    this.clusters[Math.floor(projectile.x / this.zoneSize) + 1][Math.floor(projectile.y / this.zoneSize) + 1].addDespawn(projectile.selfId);
                    delete this.clusters[Math.floor(projectile.x / this.zoneSize) + 1][Math.floor(projectile.y / this.zoneSize) + 1].projectiles[projectile.selfId];//
                    collision = true;
                    break;
                }
            }
            if (collision)
                break;
            projectile.switchPosition(x2, y2);
        }

        for (const key in this.players) {
            const player = this.players[key];
            if (player.useIntention) {
                this.projectiles.push(new Projectile(player.id, this.projId, player.x, player.y, 3));
                this.clusters[Math.floor(player.x / this.zoneSize) + 1][Math.floor(player.y / this.zoneSize) + 1].addNewProjectile(this.projId, player.id, player.angle);
                this.clusters[Math.floor(player.x / this.zoneSize) + 1][Math.floor(player.y / this.zoneSize) + 1].addProjectile(this.projId++, player.x, player.y, player.angle);//
                player.useIntention = false;
            }
            if (!player.moveIntention)
                continue;
            const [x2, y2] = player.move();
            const [x, y] = player.position();
            let death = false;
            for (const [i, projectile] of this.projectiles.entries()) { //
                if (player.id != projectile.id && projectile.inside(x, y, x2, y2, player.size)) {
                    if (player.takeDamage(projectile.damage)) {
                        death = true;
                        this.clusters[Math.floor(player.x / this.zoneSize) + 1][Math.floor(player.y / this.zoneSize) + 1].addElimination(player.id, projectile.id);
                        this.removePlayer(player.id);
                        //delete this.players[key];
                    }
                    this.clusters[Math.floor(projectile.x / this.zoneSize) + 1][Math.floor(projectile.y / this.zoneSize) + 1].addDespawn(projectile.selfId);
                    delete this.clusters[Math.floor(projectile.x / this.zoneSize) + 1][Math.floor(projectile.y / this.zoneSize) + 1].projectiles[projectile.selfId]; //
                    this.projectiles.splice(i, 1);
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
            const temperX = Math.floor(x / this.zoneSize) + 1;
            const temperY = Math.floor(y / this.zoneSize) + 1;
            const [Xer, Yer] = this.clusters[temperX][temperY].inside(x2, y2);
            if (Xer != 0 || Yer != 0) {
                const name =  this.clusters[temperX][temperY].newPlayers[key].username;
                delete this.clusters[temperX][temperY].newPlayers[key];
                delete this.clusters[temperX][temperY].positions[key];
                this.clusters[Math.floor(temperX + Xer)][temperX + Yer].addNewPlayer(player.id, name);
                this.clusters[Math.floor(temperX + Xer)][temperX + Yer].addPosition(player.id, player.x, player.y);
                console.log("Bang");
            }
            else {
                delete this.clusters[temperX][temperY].positions[key];
                this.clusters[temperX][temperY].addPosition(player.id, x2, y2);
            }
            player.switchPosition(x2, y2);
            player.moveIntention = false;
        }
    }
    public addPlayer(id: number, name: string) {
        //this.players[id] = (new Player(id, Math.random() * 100, Math.random() * 100, 3));
        const tempX = 50;
        const tempY = 50;
        this.clusters[Math.floor(tempX / this.zoneSize) + 1][Math.floor(tempY / this.zoneSize) + 1].addNewPlayer(id, name);
        this.clusters[Math.floor(tempX / this.zoneSize) + 1][Math.floor(tempY / this.zoneSize) + 1].addPosition(id, tempX, tempY);
        //this.clusters[Math.floor(tempX / this.zoneSize) + 1][Math.floor(tempY / this.zoneSize) + 1].addPosition(id, tempX, tempY);
        this.players[id] = (new Player(id, tempX, tempY, 20));
    }
    public removePlayer(id: number) {
        delete this.clusters[Math.floor(this.players[id].x / this.zoneSize) + 1][Math.floor(this.players[id].y / this.zoneSize) + 1].newPlayers[id];
        delete this.clusters[Math.floor(this.players[id].x / this.zoneSize) + 1][Math.floor(this.players[id].y / this.zoneSize) + 1].positions[id];
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
            }
                break;
            case 2: this.players[id].angle = value;
                break;
        }
    }
}
