class Player {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.x = 0;
        this.y = 0;
    }
    update() {
        this.updateMovement();
        this.updateTileDiscovery();
    }
    updateTileDiscovery() {
        let currentBiome = this.game.environmentManager.currentBiome;
        if (!currentBiome?.environment) return;
        currentBiome.environment.discoverTiles(this.x, this.y);
    }
    updateMovement() {
        if (!this.game.mouse.click) return;
        if (this.game.cam.justMoved) return;
        let currentBiome = this.game.environmentManager.currentBiome;
        let cors = this.game.cam.screenToGlobal(this.game.mouse.x, this.game.mouse.y);
        let dir = dirTo(this.x, this.y, cors.x, cors.y);
        dir = Math.round(dir / 90) * 90;
        let move = distToMove(1, dir);
        move.x = Math.round(move.x);
        move.y = Math.round(move.y);
        let oldX = this.x;
        let oldY = this.y;
        this.x += move.x;
        this.y += move.y;
        this.x = Math.max(this.x, currentBiome.x - currentBiome.r);
        this.x = Math.min(this.x, currentBiome.x + currentBiome.r - 1);
        this.y = Math.max(this.y, currentBiome.y - currentBiome.r);
        this.y = Math.min(this.y, currentBiome.y + currentBiome.r - 1);
        if (oldX != this.x || oldY != this.y) this.game.mouse.click = false;
    }
    draw() {
        this.ctx.fillStyle = "blue";
        this.ctx.fillRect(this.x, this.y, 1, 1);
    }
}