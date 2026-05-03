class Tile {
    static {
        this.cloudsImage = new Image();
        this.cloudsImage.src = "assets/clouds-25-25v2.png";
    }
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.imageN = ((x + y * 2) % 4 + 4) % 4;
        this.angle = Math.floor(Math.random() * 4) * 90;
        this.discovered = false;
        this.discoverAnimation = 0;
    }
    update() {
        if (this.discovered) {
            this.discoverAnimation++;
        }
    }
    drawBackground(ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(this.x, this.y, 1, 1);
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.lineWidth = 0.05;
        ctx.strokeRect(this.x, this.y, 1, 1);
    }
    drawCloudBackground(ctx) {
        let a = 1 - Math.max(Math.min(1, this.discoverAnimation / 50), 0);
        ctx.save();
        ctx.translate(this.x + 0.5, this.y + 0.5);
        ctx.scale(1.4 * a, 1.4 * a);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.globalAlpha = a;
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "rgb(100,100,100)";
        ctx.drawImage(Tile.cloudsImage, 25 * this.imageN, 50, 25, 25, -0.5, -0.5, 1, 1);
        ctx.restore();
    }
    drawCloud(ctx) {
        let a = 1 - Math.max(Math.min(1, this.discoverAnimation / 50), 0);
        ctx.save();
        ctx.translate(this.x + 0.5, this.y + 0.5);
        ctx.scale(1.4 * a, 1.4 * a);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.globalAlpha = a;
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "rgb(100,100,100)";
        ctx.drawImage(Tile.cloudsImage, 25 * this.imageN, 0, 25, 25, -0.5, -0.5, 1, 1);
        ctx.restore();
    }
}