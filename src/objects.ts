import * as redis from 'redis';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';
import { readlink } from 'fs';
import { release } from 'os';

const tickRate = 1000 / 30;
export abstract class Thing {
    public speed = 20;
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
        return [this.x + this.speed * Math.cos(angle) / tickRate, this.y + this.speed * Math.sin(angle) / tickRate];
    }
    public move(): number[] {//different for player.
        return [this.x + this.speed * Math.cos(this.angle) / tickRate, this.y + this.speed * Math.sin(this.angle) / tickRate];
    }
    public inside(x1: number, y1: number, x2: number, y2: number, r: number): boolean {
        if (Math.sqrt((x2 - this.x) * (x2 - this.x) + (y2 - this.y) * (y2 - this.y)) <= (this.size + r))
            return true;
        if (Math.sqrt((x1 - this.x) * (x1 - this.x) + (y1 - this.y) * (y1 - this.y)) <= (this.size + r))
            return true;
        return false;

    }
}
export class Player extends Thing {
    public hp=10;
    public weaponType=1;
    public reload=5;
    public direction=0;
    public moveIntention=false;
    public useIntention=false;
    constructor(public id: number, public x: number, public y: number, public size: number) {
        super(id, 1, x, y, 20);
    }
    public move(): number[] {
        return [this.x + this.speed * Math.cos(this.angle + this.direction) / tickRate, this.y + this.speed * Math.sin(this.angle + this.direction) / tickRate];
    }
    public takeDamage(damage: number): boolean {
        this.hp -= damage;
        if (this.hp <= 0)
            return true;
        return false;
    }
}
export class Obstacle extends Thing {
    constructor(public id: number, public x: number, public y: number, public size: number) {
        super(id, 2, x, y, size);
    }
}
export class Projectile extends Thing {
    public damage=2;
    public ttl = 70;
    public speed=70;
    public selfId=0;
    constructor(public id: number, selfId: number, public x: number, public y: number, public size: number, angle: number, ttl: number) {
        super(id, 3, x, y, 3);
        this.ttl = ttl;
        this.angle = angle;
        this.selfId = selfId;
    }

}
