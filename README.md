# slinger - a scalable MMO game


## The repository

This repository is designated for server development.


## slinger

slinger is inteded to be an "io game", just like the very popular game [agar.io](http://agar.io).

#### Game objective

The game objective is to gather as many points as possible by defeating other players and NPCs.

#### Gameplay

Players will spawn in a random place on the map, wielding a slinger. They will be able to obtain new weapons by picking up items from randomly spawning chests scattered across the map. Once a player dies or leaves the game, they lose everything.

#### Environment

The gameplay will take place in a 2D world enriched by various obstacles.


## Our objective

We strive for the following:

* **One big 2D world**
* Serving a **multitude of players**
* **Scalability**, meaning supporting more players is as simple running another server instance on a separate CPU core (assuming we use [Node.js](https://github.com/nodejs), which is mentioned [below](#achiving-our-objective))


## Achiving our objective

To achive our objective, we are planning on employing [Node.js](https://github.com/nodejs), known for its high I/O throughput, alongside [Redis](https://github.com/antirez/redis/) utilized to share game state among `Node` processes, although it may seem **crazy** (which, quite frankly, it is).


## Client side platforms

Despite io games' nature of targeting web browsers, slinger ought to support many client side platforms by exposing a bare TCP socket.
