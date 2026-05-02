class LeaveBiomeArrow {
    constructor(environmentManager) {
        this.environmentManager = environmentManager;
        this.game = environmentManager.game;
        this.ctx = this.game.ctx;
        this.cam = this.game.cam;
        this.mouse = this.game.mouse;
        this.player = this.environmentManager.player;
    }
    update() {
        this.currentBiome = this.environmentManager.currentBiome;
        if (!this.playerOnBiomeEdge()) return;
        if (!this.playerCanLeaveBiome()) return;
        if (!this.mouse.click) return;
        if (this.game.cam.justMoved) return;
        let cors = this.game.cam.screenToGlobal(this.mouse.x, this.mouse.y);
        if (cors.x < this.hitbox.x) return;
        if (cors.y < this.hitbox.y) return;
        if (cors.x > this.hitbox.x + this.hitbox.w) return;
        if (cors.y > this.hitbox.y + this.hitbox.h) return;
        this.environmentManager.leaveBiome();
    }
    get hitbox() {
        if (!this.playerOnBiomeEdge()) return null;
        if (!this.playerCanLeaveBiome()) return null;
        let direction = this.getPlayerExitDirection();
        return {
            x: this.player.x + 0.5 + direction.x * 4 - 2,
            y: this.player.y + 0.5 + direction.y * 4 - 2,
            w: 4,
            h: 4
        }
    }
    playerOnBiomeEdge() {
        if (this.player.x == this.currentBiome.x - this.currentBiome.r) return true;
        if (this.player.x == this.currentBiome.x + this.currentBiome.r - 1) return true;
        if (this.player.y == this.currentBiome.y - this.currentBiome.r) return true;
        if (this.player.y == this.currentBiome.y + this.currentBiome.r - 1) return true;
        return false;
    }
    getPlayerExitDirection() {
        if (this.player.x == this.currentBiome.x - this.currentBiome.r) return { x: -1, y: 0 };
        if (this.player.x == this.currentBiome.x + this.currentBiome.r - 1) return { x: 1, y: 0 };
        if (this.player.y == this.currentBiome.y - this.currentBiome.r) return { x: 0, y: -1 };
        if (this.player.y == this.currentBiome.y + this.currentBiome.r - 1) return { x: 0, y: 1 };
        return null;
    }
    playerCanLeaveBiome() {
        let direction = this.getPlayerExitDirection();
        return this.currentBiome.exits.some(e => e.x == direction.x && e.y == direction.y);
    }
    draw() {
        if (!this.playerOnBiomeEdge()) return;
        if (!this.playerCanLeaveBiome()) return;
        let direction = this.getPlayerExitDirection();
        let angle = dirTo(0, 0, direction.x, direction.y);
        this.ctx.fillStyle = "green";
        let hitbox = this.hitbox;
        this.ctx.save();
        this.ctx.translate(hitbox.x + hitbox.w / 2, hitbox.y + hitbox.h / 2);
        this.ctx.rotate(angle * Math.PI / 180);
        this.ctx.fillRect(-0.5, -0.5, 1, 1);
        this.ctx.fillRect(-1, -2.5, 2, 2);
        this.ctx.restore();
    }
}