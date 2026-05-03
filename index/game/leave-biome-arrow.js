class LeaveBiomeArrow {
    static {
        this.image = new Image();
        this.image.src = "assets/arrows-25-25.png"
    }
    constructor(environmentManager) {
        this.leaveAnimation = 0;
        this.environmentManager = environmentManager;
        this.game = environmentManager.game;
        this.ctx = this.game.ctx;
        this.cam = this.game.cam;
        this.mouse = this.game.mouse;
        this.player = this.environmentManager.player;
    }
    update(dt) {
        this.leaveAnimation += dt;
        this.currentBiome = this.environmentManager.currentBiome;
        if (!this.playerOnBiomeEdge()) return;
        if (!this.playerCanLeaveBiome()) return;
        this.updateMouseMovement();
        this.updateKeyboardMovement();
    }
    updateMouseMovement() {
        if (!this.mouse.click) return;
        if (this.game.cam.justMoved) return;
        let cors = this.game.cam.screenToGlobal(this.mouse.x, this.mouse.y);
        if (cors.x < this.hitbox.x) return;
        if (cors.y < this.hitbox.y) return;
        if (cors.x > this.hitbox.x + this.hitbox.w) return;
        if (cors.y > this.hitbox.y + this.hitbox.h) return;
        this.environmentManager.leaveBiome(this.getPlayerExitDirection());
    }
    updateKeyboardMovement() {
        let move;
        if (Keys.down.a || Keys.down.ArrowLeft) {
            move = { x: -1, y: 0 };
        }
        if (Keys.down.d || Keys.down.ArrowRight) {
            move = { x: 1, y: 0 };
        }
        if (Keys.down.w || Keys.down.ArrowUp) {
            move = { x: 0, y: -1 };
        }
        if (Keys.down.s || Keys.down.ArrowDown) {
            move = { x: 0, y: 1 };
        }
        let direction = this.getPlayerExitDirection();
        if (move && direction.x == move.x && direction.y == move.y) {
            this.environmentManager.leaveBiome(direction);
        }
    }
    get hitbox() {
        if (!this.playerOnBiomeEdge()) return null;
        if (!this.playerCanLeaveBiome()) return null;
        let direction = this.getPlayerExitDirection();
        return {
            x: this.player.x + 0.5 + direction.x * (1.5 + this.animation * 0.1) - 2,
            y: this.player.y + 0.5 + direction.y * (1.5 + this.animation * 0.1) - 2,
            w: 4,
            h: 4
        }
    }
    get animation() {
        return Math.round(Math.sin(this.leaveAnimation / 10));
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
    playerFacingAwayFromEdge() {
        let direction = this.getPlayerExitDirection();
        if (this.player.realDirection.x == -direction.x && this.player.realDirection.y == -direction.y) return true;
        return false;
    }
    playerCanLeaveBiome() {
        let direction = this.getPlayerExitDirection();
        if (!this.currentBiome.exits.some(e => e.x == direction.x && e.y == direction.y)) return false;
        if (this.currentBiome.neighboringBiomes.some(e => e.direction.x == direction.x && e.direction.y == direction.y)) return true;
        if (!this.environmentManager.biomeCache.length) return false;
        if (!this.environmentManager.biomeCache[0].initialized) return false;
        return true;
    }
    draw() {
        if (!this.playerOnBiomeEdge()) return;
        if (!this.playerCanLeaveBiome()) return;
        if (this.playerFacingAwayFromEdge()) return;
        let direction = this.getPlayerExitDirection();
        let angle = dirTo(0, 0, direction.x, direction.y);
        let hitbox = this.hitbox;
        this.ctx.save();
        this.ctx.translate(hitbox.x + hitbox.w / 2, hitbox.y + hitbox.h / 2);
        this.ctx.imageSmoothingEnabled = false;
        if (angle == 0) {
            this.ctx.drawImage(LeaveBiomeArrow.image, 0, 0, 25, 25, -0.5, -0.5, 1, 1);
        } else if (angle == 90) {
            this.ctx.drawImage(LeaveBiomeArrow.image, 75, 0, 25, 25, -0.5, -0.5, 1, 1);
        } else if (angle == 180) {
            this.ctx.drawImage(LeaveBiomeArrow.image, 50, 0, 25, 25, -0.5, -0.5, 1, 1);
        } else if (angle == 270) {
            this.ctx.drawImage(LeaveBiomeArrow.image, 25, 0, 25, 25, -0.5, -0.5, 1, 1);
        }
        this.ctx.restore();
    }
}