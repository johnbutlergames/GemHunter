class Player {
    static MOVE_TIME = 20
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.x = 0;
        this.y = 0;
        this.direction = { x: 1, y: 0 };

        this.gemsCollected = [];

        this.backImage = new Image();
        this.backImage.src = "assets/hero-back.png";
        this.frontImage = new Image();
        this.frontImage.src = "assets/hero-front.png";

        this.state = "idle";
    }
    update(dt) {
        if (this.state == "idle") {
            this.updateKeyboardMovement(dt);
            this.updateMouseMovement(dt);
        } else if (this.state == "moving animation") {
            this.updateMovingAnimation(dt);
        }
        this.updateTileDiscovery(dt);
    }
    updateTileDiscovery() {
        let currentBiome = this.game.environmentManager.currentBiome;
        if (!currentBiome?.environment) return;
        currentBiome.environment.discoverTiles(this.x, this.y);
    }
    updateKeyboardMovement(dt) {
        let oldX = this.x;
        let oldY = this.y;
        if (Keys.keys.a || Keys.keys.ArrowLeft) {
            this.move({ x: -1, y: 0 });
        } else if (Keys.keys.d || Keys.keys.ArrowRight) {
            this.move({ x: 1, y: 0 });
        } else if (Keys.keys.w || Keys.keys.ArrowUp) {
            this.move({ x: 0, y: -1 });
        } else if (Keys.keys.s || Keys.keys.ArrowDown) {
            this.move({ x: 0, y: 1 });
        }
        if (oldX != this.x || oldY != this.y) {
            this.animateMove(oldX, oldY, this.x, this.y);
            this.updateMovingAnimation(dt);
            Keys.down = {};
        }
    }
    updateMouseMovement(dt) {
        if (!this.game.mouse.down) return;
        if (this.game.cam.justMoved) return;
        let cors = this.game.cam.screenToGlobal(this.game.mouse.x, this.game.mouse.y);
        let dir = dirTo(this.x, this.y, cors.x, cors.y);
        let dist = distTo(this.x, this.y, cors.x - 0.5, cors.y - 0.5);
        if (dist < 1) return;
        dir = Math.round(dir / 90) * 90;
        let move = distToMove(1, dir);
        move.x = Math.round(move.x);
        move.y = Math.round(move.y);

        let oldX = this.x;
        let oldY = this.y;

        this.move(move);

        if (oldX != this.x || oldY != this.y) {
            this.animateMove(oldX, oldY, this.x, this.y);
            this.updateMovingAnimation(dt);
        }
    }
    move(move) {
        let currentBiome = this.game.environmentManager.currentBiome;
        this.x += move.x;
        this.y += move.y;
        this.x = Math.max(this.x, currentBiome.x - currentBiome.r);
        this.x = Math.min(this.x, currentBiome.x + currentBiome.r - 1);
        this.y = Math.max(this.y, currentBiome.y - currentBiome.r);
        this.y = Math.min(this.y, currentBiome.y + currentBiome.r - 1);

        this.direction.y = move.y;
        if (move.x) this.direction.x = move.x;
        this.realDirection = move;
    }
    animateMove(x1, y1, x2, y2) {
        this.state = "moving animation";
        this.movingAnimation = {
            time: 0,
            x1,
            y1,
            x2,
            y2
        };
    }
    updateMovingAnimation(dt) {
        this.movingAnimation.time += dt;
        let a = this.movingAnimation.time / Player.MOVE_TIME;
        this.x = this.movingAnimation.x1 * (1 - a) + this.movingAnimation.x2 * a;
        this.y = this.movingAnimation.y1 * (1 - a) + this.movingAnimation.y2 * a;

        if (this.movingAnimation.time >= Player.MOVE_TIME) {
            this.x = this.movingAnimation.x2;
            this.y = this.movingAnimation.y2;
            this.state = "idle";
        }
    }
    draw() {
        let sprite;
        if (this.direction.y == -1) {
            sprite = this.backImage;
        } else {
            sprite = this.frontImage;
        }
        let flip = false;
        if (this.direction.x == -1) flip = true;

        let a = 0;
        if (this.state == "moving animation") {
            if (this.movingAnimation.time < Player.MOVE_TIME / 2) a = 1;
        }

        this.ctx.save();
        this.ctx.imageSmoothingEnabled = false;
        ctx.translate(this.x + 0.5, this.y + 0.5);
        if (flip) this.ctx.scale(-1, 1);
        this.ctx.drawImage(sprite, a * 30, 0, 30, 30, -0.5, -0.5, 1, 1);
        this.ctx.restore();
    }
}