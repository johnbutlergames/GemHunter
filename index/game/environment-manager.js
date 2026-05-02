class EnvironmentManager {
    static BIOME_SIZE = 12
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.tiles = [];
        this.biomes = [];
        this.tiles = [];
        this.player = new Player(this.game);
        this.player.y = EnvironmentManager.BIOME_SIZE / 2 - 1;
        this.biomes.push(new Biome(0, 0, EnvironmentManager.BIOME_SIZE / 2, true));
        this.currentBiome = this.biomes[0];
        this.currentBiome.initialize();
        this.currentBiome.environment.initializeTiles();
        this.leaveBiomeArrow = new LeaveBiomeArrow(this);
    }
    get biomeNames() {
        let names = [];
        for (let biome of this.biomes) {
            if (biome.name) names.push(biome.name);
        }
        return names;
    }
    leaveBiome(direction) {
        this.player.x += direction.x;
        this.player.y += direction.y;
        let neighbor = this.currentBiome.neighboringBiomes.find(e => e.direction.x == direction.x && e.direction.y == direction.y);
        if (neighbor) {
            this.currentBiome = neighbor.biome;
            return;
        }

        let oppositeDirection = { x: -direction.x, y: -direction.y };
        this.currentBiome = this.createBiome(direction, this.currentBiome);
    }
    getNewBiomeCoordinates(biome, direction) {
        let x = biome.x + EnvironmentManager.BIOME_SIZE * direction.x;
        let y = biome.y + EnvironmentManager.BIOME_SIZE * direction.y;
        return { x, y };
    }
    reverseDirection(direction) {
        return { x: -direction.x, y: -direction.y };
    }
    createBiome(direction, current) {
        let { x, y } = this.getNewBiomeCoordinates(current, direction);
        let oppositeDirection = this.reverseDirection(direction);

        let biome = new Biome(x, y, EnvironmentManager.BIOME_SIZE / 2, false);
        biome.environment.initializeTiles();
        biome.initialize();
        this.biomes.push(biome);
        // add biome

        current.neighboringBiomes.push({ direction, biome });
        biome.neighboringBiomes.push({ direction: oppositeDirection, biome: current });
        // update neighbors for biome this one was created by

        for (let exit of biome.exits) {
            if (biome.neighboringBiomes.find(e => e.direction.x == exit.x && e.direction.y == exit.y)) continue;
            let cors = this.getNewBiomeCoordinates(biome, exit);
            for (let biome2 of this.biomes) {
                if (biome2.x != cors.x || biome2.y != cors.y) continue;
                biome.neighboringBiomes.push({ direction: exit, biome: biome2 });
                biome2.neighboringBiomes.push({ direction: this.reverseDirection(direction), biome });
            }
        }
        // check for already existing biomes that would neighbor this one

        return biome;
    }
    update(dt) {
        this.player.update();
        if (this.game.mouse.click && !this.game.cam.justMoved) {
            let cors = this.game.cam.screenToGlobal(this.game.mouse.x, this.game.mouse.y);
            let dir = dirTo(this.player.x, this.player.y, cors.x, cors.y);
            dir = Math.round(dir / 90) * 90;
            let move = distToMove(1, dir);
            move.x = Math.round(move.x);
            move.y = Math.round(move.y);
            let oldX = this.player.x;
            let oldY = this.player.y;
            this.player.x += move.x;
            this.player.y += move.y;
            this.player.x = Math.max(this.player.x, this.currentBiome.x - this.currentBiome.r);
            this.player.x = Math.min(this.player.x, this.currentBiome.x + this.currentBiome.r - 1);
            this.player.y = Math.max(this.player.y, this.currentBiome.y - this.currentBiome.r);
            this.player.y = Math.min(this.player.y, this.currentBiome.y + this.currentBiome.r - 1);
            if (oldX != this.player.x || oldY != this.player.y) this.game.mouse.click = false;
        }
        this.leaveBiomeArrow.update();
        this.currentBiome.environment.discoverTiles(this.player.x, this.player.y);
    }
    draw(dt) {
        for (let biome of this.biomes) {
            this.ctx.save();
            if (biome != this.currentBiome) {
                this.ctx.globalAlpha = 0.5;
            } else {
                this.ctx.globalAlpha = 1;
            }
            if(biome.image) {
                this.ctx.drawImage(biome.image, biome.x - biome.r, biome.y - biome.r, biome.r * 2, biome.r * 2);
            }
            if (biome.environment.tiles) {
                for (let tile of biome.environment.tiles) {
                    if (!tile.discovered) continue;
                    this.ctx.strokeStyle = "rgb(0,0,0)";
                    this.ctx.lineWidth = 0.1;
                    this.ctx.strokeRect(tile.x, tile.y, 1, 1);
                }
            }
            this.ctx.strokeStyle = "black";
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(biome.x - biome.r, biome.y - biome.r, biome.r * 2, biome.r * 2);

            if (biome.name) {
                this.ctx.lineJoin = "round";
                this.ctx.lineWidth = 0.2;
                this.ctx.strokeStyle = "white";
                this.ctx.fillStyle = "black";
                this.ctx.font = "2px Times New Roman";
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.strokeText(biome.name, biome.x, biome.y);
                this.ctx.fillText(biome.name, biome.x, biome.y);
            }
            this.ctx.restore();
        }

        this.player.draw();
        this.leaveBiomeArrow.draw();
    }
}