"use strict";
const __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) {
                d.__proto__ = b;
            }) ||
            function (d, b) {
                for (const p in b) {
                    if (b.hasOwnProperty(p))
                        d[p] = b[p];
                }
            };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() {
            this.constructor = d;
        }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
const redis = require("redis");
const Thing = /** @class */ (function () {
    function Thing(id, type, x, y, size) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.size = size;
    }
    Thing.prototype.insi1de = function (speed) {
        this.x = 2;
    };
    Thing.prototype.inside = function (x1, y1, x2, y2, r) {
        const a = (y1 - this.y) / (x1 - this.x);
        const deltaX = x2 - x1;
        const deltaY = y2 - y1;
        const b = Math.sqrt((r * r) / (1 + a * a));
        let newX = 0;
        let newY = 0;
        if (deltaX < 0)
            newX = x2 - b;
        else
            newX = x2 + b;
        const c = Math.sqrt((r * r * a * a) / (1 + a * a));
        if (deltaY < 0)
            newY = y2 - c;
        else
            newY = y2 + c;
        const a2 = deltaY / deltaX;
        const b2 = newY - a2 * newX;
        const aOpp = -1 / a2;
        const bOpp = this.y - aOpp * this.x;
        const finalX = (bOpp - b2) / (a2 - aOpp);
        const finalY = finalX * a2 + b2;
        if ((finalX - this.x) * (finalX - this.x) + (finalY - this.y) * (finalY - this.y) <= this.size * this.size) {
            if ((deltaX * (finalX - newX) <= 0) && (deltaY * (finalY - newY) <= 0))
                return true;
        }
        if ((newX - this.x) * (newX - this.x) + (newY - this.y) * (newY - this.y) <= this.size * this.size)
            return true;
        return false;
    };
    return Thing;
}());
const Player = /** @class */ (function (_super) {
    __extends(Player, _super);
    function Player(id, x, y, size) {
        const _this = _super.call(this, id, 1, x, y, size) || this;
        _this.id = id;
        _this.x = x;
        _this.y = y;
        _this.size = size;
        return _this;
    }
    return Player;
}(Thing));
const Obstacle = /** @class */ (function (_super) {
    __extends(Obstacle, _super);
    function Obstacle(id, x, y, size) {
        const _this = _super.call(this, id, 2, x, y, size) || this;
        _this.id = id;
        _this.x = x;
        _this.y = y;
        _this.size = size;
        return _this;
    }
    Obstacle.prototype.insi1d = function (x1, y1, x2, y2, r) {
        this.x = 0;
    };
    return Obstacle;
}(Thing));
const Projectile = /** @class */ (function (_super) {
    __extends(Projectile, _super);
    function Projectile(id, x, y, size) {
        const _this = _super.call(this, id, 3, x, y, size) || this;
        _this.id = id;
        _this.x = x;
        _this.y = y;
        _this.size = size;
        return _this;
    }
    return Projectile;
}(Thing));
const aa = new Player(1, 1, 1, 2);
console.log("b " + aa.inside(-3, -1, -1, 0, 1));
const client = redis.createClient({
    port: 6379,
    host: 'localhost',
});
client.set("blablabla", "44");
client.get("blablabla", function (err, value) {
    return console.log("blablabla = " + value + " :)");
});
client.quit();
