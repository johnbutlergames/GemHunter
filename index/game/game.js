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
    }
}