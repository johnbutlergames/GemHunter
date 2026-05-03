class Player {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.x = 0;
        this.y = 0;
    }
    update() {
        this.updateKeyboardMovement();
        this.updateMouseMovement();
        this.updateTileDiscovery();
    }
    updateTileDiscovery() {
        let currentBiome = this.game.environmentManager.currentBiome;
        if (!currentBiome?.environment) return;
        currentBiome.environment.discoverTiles(this.x, this.y);
    }
    updateKeyboardMovement() {
        let oldX = this.x;
        let oldY = this.y;
        if (Keys.down.a || Keys.down.ArrowLeft) {
            this.move({ x: -1, y: 0 });
        }
        if (Keys.down.d || Keys.down.ArrowRight) {
            this.move({ x: 1, y: 0 });
        }
        if (Keys.down.w || Keys.down.ArrowUp) {
            this.move({ x: 0, y: -1 });
        }
        if (Keys.down.s || Keys.down.ArrowDown) {
            this.move({ x: 0, y: 1 });
        }
        if (oldX != this.x || oldY != this.y) Keys.down = {};
    }
    updateMouseMovement() {
        if (!this.game.mouse.click) return;
        if (this.game.cam.justMoved) return;
        let cors = this.game.cam.screenToGlobal(this.game.mouse.x, this.game.mouse.y);
        let dir = dirTo(this.x, this.y, cors.x, cors.y);
        dir = Math.round(dir / 90) * 90;
        let move = distToMove(1, dir);
        move.x = Math.round(move.x);
        move.y = Math.round(move.y);

        this.move(move);

        let oldX = this.x;
        let oldY = this.y;

        if (oldX != this.x || oldY != this.y) this.game.mouse.click = false;
    }
    move(move) {
        let currentBiome = this.game.environmentManager.currentBiome;
        this.x += move.x;
        this.y += move.y;
        this.x = Math.max(this.x, currentBiome.x - currentBiome.r);
        this.x = Math.min(this.x, currentBiome.x + currentBiome.r - 1);
        this.y = Math.max(this.y, currentBiome.y - currentBiome.r);
        this.y = Math.min(this.y, currentBiome.y + currentBiome.r - 1);
    }
    draw() {
        this.ctx.fillStyle = "blue";
        this.ctx.fillRect(this.x, this.y, 1, 1);
    }
}