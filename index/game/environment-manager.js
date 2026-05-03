class EnvironmentManager {
    static BIOME_SIZE = 4
    static SKIP_BIOME_ANIMATION = false
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
        this.currentBiome.initializeExits();
        this.targetBiome = null;
        this.leaveBiomeDirection = null;
        this.currentBiome.environment.initializeTiles();
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

        if (this.targetBiome.initialized) {
            if (this.targetBiome.visited) {
                this.game.state = "start biome short transition";
            } else {
                this.game.state = "start biome transition";
            }
        } else {
            this.game.state = "start biome load";
        }
    }
    switchBiome() {
        this.currentBiome = this.targetBiome;
        this.targetBiome = null;
        let direction = this.leaveBiomeDirection;
        this.player.x += direction.x;
        this.player.y += direction.y;
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
            biome.environment.initializeTiles();
        } else {
            biome = new Biome(x, y, EnvironmentManager.BIOME_SIZE / 2, false);
            biome.initialize();
            biome.environment.initializeTiles();
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
        this.player.update();
        this.leaveBiomeArrow.update();
        this.updateBiomeCache();

        this.currentBiome.visited = true;
    }
    updateBiomeCache() {
        if (!this.allBiomesInitialized()) return;
        if (this.biomeCache.length) return;
        let biome = new Biome(null, null, EnvironmentManager.BIOME_SIZE / 2, false);
        biome.initialize();
        this.biomeCache.push(biome);
    }
    draw(dt) {
        for (let biome of this.biomes) {
            this.ctx.save();
            if (biome != this.currentBiome) {
                this.ctx.globalAlpha = 0.5;
            } else {
                this.ctx.globalAlpha = 1;
            }
            if (biome.image) {
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