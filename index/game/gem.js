class Gem {
    static {
        this.gemImage = new Image();
        this.gemImage.src = "assets/gems-20-20.png";
        this.collected = false;
    }
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.animation = 0;
    }
    collect() {
        this.collected = true;
    }
    update(dt) {
        this.animation += dt;
    }
    draw(ctx) {
        if (this.collected) return;
        ctx.save();
        ctx.translate(this.x + 0.5, this.y + 0.5);
        ctx.scale(0.7, 0.7);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(Gem.gemImage, 20 * this.type, 0, 20, 20, -0.5, -0.5, 1, 1);
        ctx.restore();
    }
}