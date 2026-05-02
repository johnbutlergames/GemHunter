class EnvironmentManager {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.tiles = [];
        this.biomes = [];
        this.tiles = [];
        this.player = new Player(this.game);
        this.player.y = 2;
        this.biomes.push(new Biome(0, 0, 3, true));
        this.currentBiome = this.biomes[0];
        this.leaveBiomeArrow = new LeaveBiomeArrow(this);

        for (let biome of this.biomes) biome.environment.initializeTiles();

        //for (let biome of this.biomes) biome.initialize();
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
        let x = this.currentBiome.x + 6 * direction.x;
        let y = this.currentBiome.y + 6 * direction.y;
        let biome = new Biome(x, y, 3, false);
        biome.environment.initializeTiles();
        this.biomes.push(biome);
        this.currentBiome.neighboringBiomes.push({ direction, biome });
        biome.neighboringBiomes.push({ direction: oppositeDirection, biome: this.currentBiome });
        this.currentBiome = biome;
    }
    addBiome(x, y) {
        let radius = this.biomes.reduce((a, b) => a + distTo(b.x, b.y, 0, 0) + b.r, 0);
        let dir = dirTo(0, 0, x, y);
        let move = distToMove(radius, dir);

        let biome = new Biome(move.x, move.y, Math.random() * 5 + 7);
        for (let n = 0; n < 20; n++) {
            let dist = Math.min(...this.biomes.map(e => distTo(e.x, e.y, biome.x, biome.y)));
            let dir = dirTo(biome.x, biome.y, 0, 0);
            let move = distToMove(Math.max(5, dist * 2 / 3), dir);
            biome.x += move.x;
            biome.y += move.y;
            if (this.biomes.some(e => distTo(e.x, e.y, biome.x, biome.y) < e.r + biome.r + 2)) break;
        }
        dir = dirTo(biome.x, biome.y, 0, 0);
        move = distToMove(5, dir);
        biome.x -= move.x;
        biome.y -= move.y;
        for (let n = 0; n < 10; n++) {
            for (let o of this.biomes) {
                let dist = distTo(biome.x, biome.y, o.x, o.y);
                if (dist > o.r + biome.r + 2) continue;
                let collisionDist = o.r + biome.r + 2 - dist;
                let dir = dirTo(biome.x, biome.y, o.x, o.y);
                let move = distToMove(collisionDist, dir + 180);
                biome.x += move.x;
                biome.y += move.y;
            }
        }
        biome.initialize();
        this.biomes.push(biome);
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
            this.player.x += move.x;
            this.player.y += move.y;
            this.player.x = Math.max(this.player.x, this.currentBiome.x - this.currentBiome.r);
            this.player.x = Math.min(this.player.x, this.currentBiome.x + this.currentBiome.r - 1);
            this.player.y = Math.max(this.player.y, this.currentBiome.y - this.currentBiome.r);
            this.player.y = Math.min(this.player.y, this.currentBiome.y + this.currentBiome.r - 1);
        }
        this.leaveBiomeArrow.update();
    }
    draw(dt) {
        this.ctx.save();
        this.ctx.globalAlpha = 0.5;
        for (let biome of this.biomes) {
            if (biome.environment.tiles) {
                for (let tile of biome.environment.tiles) {
                    this.ctx.strokeStyle = "rgb(0,0,0)";
                    this.ctx.fillStyle = "rgba(200,0,0,0.5)";
                    this.ctx.fillRect(tile.x, tile.y, 1, 1);
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
        }
        this.ctx.restore();

        this.player.draw();
        this.leaveBiomeArrow.draw();
    }
}