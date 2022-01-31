# Universe

## Multi-Player Game

This is a multi-player HTML5 game based on `pixi.js`, `socket.io` written in TypeScript.

![](./images/pic1.png)

## Project & Game goal

The main target to generate a framework named `uni.js`.

And finish the multi-player, infinity map, 2D sandbox game just like `Minecraft`.

## State Synchronization

The game system use client-side prediction & server reconciliation to implement synchronization of game actors.

This part is completely written in TypeScript, and it performs well.

reference: <https://www.gabrielgambetta.com/client-server-game-architecture.html>

## Start Developing

to start development, following the steps:

1. clone the repository firstly,

```bash
git clone --recurse-submodules https://github.com/uni-js/universe
```

2. install the project dependencies

```bash
yarn install
```

3. build the framework from git submodule:
```
yarn build:framework
```

4. then create a `.env` file, in the pronject root folder,
to specify data folder of the server and some other options.

its content is like:
```
DB_LOCATION=./data/
```

5. finally, run the commands:

```bash
yarn start:server # start developing server
yarn start:client # start developing client
```

then visit the client url to play the game under development.

## Contribute

the author keep maintaining this project,

if you are interested in it, the contribution is welcomed.

## LICENSE

The project is under MIT License.
