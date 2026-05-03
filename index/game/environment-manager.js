class EnvironmentManager {
    static BIOME_SIZE = 10
    static SKIP_BIOME_ANIMATION = true
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;
        this.tiles = [];
        this.biomes = [];
        this.tiles = [];
        this.player = new Player(this.game);
        this.player.y = EnvironmentManager.BIOME_SIZE / 2 - 1;
        this.biomes.push(new Biome(0, 0, EnvironmentManager.BIOME_SIZE / 2, true, 0));
        this.currentBiome = this.biomes[0];
        this.currentBiome.initialize();
        this.currentBiome.initializeExits();
        this.currentBiome.initializeTiles();
        this.targetBiome = null;
        this.leaveBiomeDirection = null;
        this.leaveBiomeArrow = new LeaveBiomeArrow(this);
        this.biomeCache = [];
    }
    get biomeNames() {
        let names = [];
        for (let biome of this.biomes) {
            if (biome.name) names.push(biome.name);
        }
        return names;
    }
    allBiomesInitialized() {
        return this.biomes.every(e => e.initialized);
    }
    leaveBiome(direction) {
        this.leaveBiomeDirection = direction;
        let neighbor = this.currentBiome.neighboringBiomes.find(e => e.direction.x == direction.x && e.direction.y == direction.y);
        if (neighbor) {
            this.targetBiome = neighbor.biome;
        } else {
            let oppositeDirection = { x: -direction.x, y: -direction.y };
            this.targetBiome = this.createBiome(direction, this.currentBiome);
        }

        if (EnvironmentManager.SKIP_BIOME_ANIMATION) {
            this.switchBiome();
            return;
        }

        if (this.targetBiome.visited) {
            this.game.state = "start biome short transition";
        } else {
            this.game.state = "start biome transition";
        }
    }
    switchBiome() {
        this.currentBiome = this.targetBiome;
        let direction = this.leaveBiomeDirection;
        this.player.x += direction.x;
        this.player.y += direction.y;
        this.player.state = "idle";
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

        let biome;
        if (this.biomeCache.length) {
            biome = this.biomeCache.pop();
            biome.x = x;
            biome.y = y;
            biome.initializeTiles();
        } else {
            biome = new Biome(x, y, EnvironmentManager.BIOME_SIZE / 2, false, this.biomes.length + this.biomeCache.length);
            biome.initialize();
            biome.initializeTiles();
        }
        biome.initializeExits();
        this.biomes.push(biome);
        // add biome from cache if available, otherwise create new

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
        this.player.update(dt);
        this.leaveBiomeArrow.update(dt);
        this.updateBiomeCache(dt);

        for (let tile of this.currentBiome.environment.tiles) {
            tile.update(dt);
        }
        if(this.currentBiome?.environment?.gem) {
            this.currentBiome.environment.gem.update(dt);
        }

        this.currentBiome.visited = true;
    }
    updateBiomeCache(dt) {
        if (this.biomes.length >= 5) {
            this.biomeCache = [];
            return;
        }
        if (!this.allBiomesInitialized()) return;
        if (this.biomeCache.length && !this.biomeCache[this.biomeCache.length - 1].initialized) return;
        if (this.biomeCache.length + this.biomes.length >= 5) return;
        let biome = new Biome(null, null, EnvironmentManager.BIOME_SIZE / 2, false, this.biomes.length + this.biomeCache.length);
        biome.initialize();
        this.biomeCache.push(biome);
    }
    draw(dt) {
        let biome = this.currentBiome;
        this.ctx.save();
        if (biome != this.currentBiome) {
            this.ctx.globalAlpha = 0.5;
        } else {
            this.ctx.globalAlpha = 1;
        }
        if (biome.environment.tiles) {
            let visibleTiles = biome.environment.tiles.filter(e => {
                let { x, y } = this.game.cam.globalToScreen(e.x, e.y);
                if (x < -100 || y < -100 || x > this.canvas.width + 100 || y > this.canvas.height + 100) return false;
                return true;
            })
            for (let tile of visibleTiles) {
                tile.drawBackground(this.ctx);
            }
            for (let tile of visibleTiles) {
                tile.drawTile(this.ctx);
            }

            if (biome.environment?.gem) biome.environment.gem.draw(ctx);

            for (let tile of visibleTiles) {
                tile.drawCloudBackground(this.ctx);
            }
            for (let tile of visibleTiles) {
                tile.drawCloud(this.ctx);
            }
        }

        this.ctx.restore();

        this.player.draw();
        this.leaveBiomeArrow.draw();
    }
}