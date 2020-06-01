import { Player, Obstacle, Projectile } from './moje';
import { newPlayers, positions, Position, NewPlayer } from './protocol/server/message/world';
export class Cluster {
    public newPlayers: { [id: number]: NewPlayer } = {};
    public positions: { [id: number]: Position } = {};
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
    public addNewPlayer(id: number, name: string) {
        this.newPlayers[id] = { playerId: id, username: name };
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
    public constructor(zoneSize: number) {
        this.zoneSize = zoneSize;
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
                continue;
            }
            const [x2, y2] = projectile.move();
            const [x, y] = projectile.position();
            let collision = false;
            for (const key in this.players) {
                const player = this.players[key];
                if (player.id != projectile.id && player.inside(x, y, x2, y2, 1)) {
                    // console.log("AAAAAAAAAAAAAAA");
                    //  console.log(player.hp);
                    if (player.takeDamage(projectile.damage))
                        delete this.players[key];
                    this.projectiles.splice(i, 1);
                    //Destroy self.
                    collision = true;
                    break;
                }
            }
            if (collision)
                break;
            for (const obstacle of this.obstacles) {
                if (obstacle.inside(x, y, x2, y2, 1)) {
                    //Destroy self.
                    this.projectiles.splice(i, 1);
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
            console.log(player.x, player.y);
            if (player.useIntention) {
                this.projectiles.push(new Projectile(player.id, player.x, player.y, 4));
                player.useIntention = false;
            }
            if (!player.moveIntention)
                continue;
            const [x2, y2] = player.move();
            const [x, y] = player.position();
            let death = false;
            for (const projectile of this.projectiles) {
                if (player.id != projectile.id && projectile.inside(x, y, x2, y2, 1)) {
                    if (player.takeDamage(projectile.damage)) {
                        death = true;
                        delete this.players[key];
                    }
                }
            }
            if (death)
                break;
            for (const obstacle of this.obstacles) {
                if (obstacle.inside(x, y, x2, y2, 1)) {
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
                this.clusters[Math.floor(temperX + Xer)][temperX + Yer].addNewPlayer(player.id, name);
                console.log("Bang");
            }
            player.switchPosition(x2, y2);
            console.log(player.x, player.y);
            player.moveIntention = false;
        }
    }
    public addPlayer(id: number, name: string) {
        //this.players[id] = (new Player(id, Math.random() * 100, Math.random() * 100, 3));
        const tempX = 50;
        const tempY = 50;
        this.clusters[Math.floor(tempX / this.zoneSize) + 1][Math.floor(tempY / this.zoneSize) + 1].addNewPlayer(id, name);
        //this.clusters[Math.floor(tempX / this.zoneSize) + 1][Math.floor(tempY / this.zoneSize) + 1].addPosition(id, tempX, tempY);
        this.players[id] = (new Player(id, tempX, tempY, 3));
    }
    public removePlayer(id: number) {
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
            case 1: this.players[id].angle = value;
                break;
            case 2: this.players[id].angle = value;
                break;
        }
    }
}
