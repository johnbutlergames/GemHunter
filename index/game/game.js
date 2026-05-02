class Game {
    constructor(canvas, ctx, mouse) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.mouse = mouse;
        this.cam = new Cam();
        this.cam.link(canvas, ctx, mouse);
        this.environmentManager = new EnvironmentManager(this);
    }
    update(dt) {
        this.cam.update(dt);
        this.environmentManager.update(dt);
    }
    draw(dt) {
        this.ctx.save();
        this.cam.alignViewport();

        this.environmentManager.draw(dt);

        this.ctx.restore();

        if (this.environmentManager.currentBiome.name) {
            this.ctx.lineJoin = "round";
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = "white";
            this.ctx.fillStyle = "black";
            this.ctx.font = "20px Times New Roman";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(this.environmentManager.currentBiome.name, this.canvas.width / 2, 100);
        }
    }
}