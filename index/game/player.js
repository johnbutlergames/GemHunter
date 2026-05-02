class Player {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.x = 0;
        this.y = 0;
    }
    update() {
        
    }
    draw() {
        this.ctx.fillStyle = "blue";
        this.ctx.fillRect(this.x, this.y, 1, 1);
    }
}