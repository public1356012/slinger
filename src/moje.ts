import * as redis from 'redis';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';
import { readlink } from 'fs';
import { release } from 'os';


export abstract class Thing {
    public speed = 10;
    public angle=0;
    constructor(public id: number, public type: number, public x: number, public y: number, public size: number) {
    }
    public switchPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    public position(): number[] {
        return [this.x, this.y];
    }
    public moe(angle: number): number[] {
        return [this.x + this.speed * Math.cos(angle), this.y + this.speed * Math.sin(angle)];
    }
    public move(): number[] {//different for player.
        return [this.x + this.speed * Math.cos(this.angle), this.y + this.speed * Math.sin(this.angle)];
    }
    public inside(x1: number, y1: number, x2: number, y2: number, r: number): boolean {
        // const a = (y1 - this.y) / (x1 - this.x);
        // const deltaX = x2 - x1;
        // const deltaY = y2 - y1;
        // const b = Math.sqrt((r * r) / (1 + a * a));
        // let newX = 0;
        // let newY = 0;
        // let curX = 0;
        // let curY = 0;
        // if (deltaX < 0) {
        //     newX = x2 - b;
        //     curX = x1 - b;
        // }
        // else {
        //     newX = x2 + b;
        //     curX = x1 + b;
        // }
        // const c = Math.sqrt((r * r * a * a) / (1 + a * a));
        // if (deltaY < 0) {
        //     newY = y2 - c;
        //     curY = y1 - c;
        // }
        // else {
        //     newY = y2 + c;
        //     curY = y1 + c;
        // }
        // const a2 = deltaY / deltaX;
        // const b2 = newY - a2 * newX;
        // const aOpp = -1 / a2;
        // const bOpp = this.y - aOpp * this.x;
        // const finalX = (bOpp - b2) / (a2 - aOpp);
        // const finalY = finalX * a2 + b2;
        // if ((finalX - this.x) * (finalX - this.x) + (finalY - this.y) * (finalY - this.y) <= this.size * this.size) {
        //     if (((finalX - curX) * (finalX - newX) <= 0) && ((finalY - curY) * (finalY - newY) <= 0))
        //         return true;
        // }
        if ((x2 - this.x) * (x2 - this.x) + (y2 - this.y) * (y2 - this.y) <= this.size * this.size + r * r)
            return true;
        return false;

    }
}
export class Player extends Thing {
    public hp=111111;
    public direction=0;
    public moveIntention=false;
    public useIntention=false;
    constructor(public id: number, public x: number, public y: number, public size: number) {
        super(id, 1, x, y, size);
    }
    public DIE() {
        // Tell the loved ones.
    }
    public move(): number[] {
        return [this.x + this.speed * Math.cos(this.angle + this.direction), this.y + this.speed * Math.sin(this.angle + this.direction)];
    }
    public takeDamage(damage: number): boolean {
        this.hp -= damage;
        if (this.hp <= 0) {
            this.DIE();
            return true;
        }
        return false;
    }
}
export class Obstacle extends Thing {
    constructor(public id: number, public x: number, public y: number, public size: number) {
        super(id, 2, x, y, size);
    }
    public insi1d(x1: number, y1: number, x2: number, y2: number, r: number) {
        this.x = 0;
    }
}
export class Projectile extends Thing {
    public damage=2;
    public ttl = 5;
    public speed=0;
    constructor(public id: number, public x: number, public y: number, public size: number) {
        super(id, 3, x, y, size);
    }
}




// let players: Array<Player>;
// let obstacles: Array<Obstacle>;
// let projectiles: Array<Projectile>;


// for (const [i, projectile] of projectiles.entries()) {
//     const [x2, y2] = projectile.move();
//     const [x, y] = projectile.position();
//     let collision = false;
//     for (const [j, player] of players.entries()) {
//         if (player.inside(x, y, x2, y2, 1)) {
//             if (player.takeDamage(projectile.damage)) {
//                 //KILL, MAIN, BURN!
//                 players.splice(j, 1);
//             }
//             projectiles.splice(i, 1);
//             //Destroy self.
//             collision = true;
//             break;
//         }
//     }
//     if (collision)
//         break;
//     for (const obstacle of obstacles) {
//         if (obstacle.inside(x, y, x2, y2, 1)) {
//             //Destroy self.
//             projectiles.splice(i, 1);
//             collision = true;
//             break;
//         }
//     }
//     if (collision)
//         break;
//     projectile.switchPosition(x2, y2);
// }

// for (const player of players) {
//     const [x2, y2] = player.move();
//     const [x, y] = player.position();
//     let death = false;
//     for (const projectile of projectiles) {
//         if (projectile.inside(x, y, x2, y2, 1)) {
//             if (player.takeDamage(projectile.damage)) {
//                 death = false;
//                 //KILL, MAIN, BURN!
//             }
//         }
//     }
//     if (death)
//         break;
//     for (const obstacle of obstacles) {
//         if (obstacle.inside(x, y, x2, y2, 1)) {
//             death = true;
//             break;
//         }
//     }
//     if (death)
//         break;
//     player.switchPosition(x2, y2);
// }




















const client = redis.createClient({
    port: 6379,
    host: 'localhost',
});

client.set("blablabla", "44");

client.get("blablabla", (err, value) => console.log(`blablabla = ${value} :)`));

client.quit();

