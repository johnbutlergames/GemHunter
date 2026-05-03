class Tile {
    static {
        this.cloudsImage = new Image();
        this.cloudsImage.src = "assets/clouds-25-25v2.png";
    }
    constructor(environment, x, y, image, variation) {
        this.environment = environment;
        this.x = x;
        this.y = y;
        this.imageN = ((x + y * 2) % 4 + 4) % 4;
        this.angle = Math.floor(Math.random() * 4) * 90;
        this.discovered = false;
        this.discoverAnimation = 0;
        this.image = image;
        this.variation = variation;
        this.flip = Math.floor(Math.random() * 2);
        this.size = 0.7 + Math.floor(Math.random() * 2) * 0.3;
        this.xOffset = Math.random() * 0.4 - 0.2;
        this.yOffset = Math.random() * 0.4 - 0.2;
        this.noise = noise(this.x * 2 + Math.random() * 0.1, this.y * 2 + Math.random() * 0.1, 500);
    }
    update(dt) {
        if (this.discovered) {
            this.discoverAnimation += dt;
        }
    }
    drawBackground(ctx) {
        ctx.save();
        ctx.fillStyle = "black";
        ctx.globalAlpha = this.noise;
        ctx.fillRect(this.x - 0.01, this.y - 0.01, 1.02, 1.02);
        ctx.restore();
    }
    drawTile(ctx) {
        if (this.image) {
            ctx.save();
            ctx.translate(this.x + 0.5 + this.xOffset, this.y + 0.5 + this.yOffset);
            ctx.scale(this.size, this.size);
            if (this.flip) ctx.scale(-1, 1);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(this.image, this.variation * 25, 0, 25, 25, -0.501, -0.501, 1.002, 1.002);
            ctx.restore();
        }
    }
    drawCloudBackground(ctx) {
        let a = 1 - Math.max(Math.min(1, this.discoverAnimation / 30), 0);
        ctx.save();
        ctx.translate(this.x + 0.5, this.y + 0.5);
        ctx.scale(1.4 * a, 1.4 * a);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.globalAlpha = a;
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "rgb(100,100,100)";
        ctx.drawImage(this.environment.cloudsImage, 25 * this.imageN, 50, 25, 25, -0.5, -0.5, 1, 1);
        ctx.restore();
    }
    drawCloud(ctx) {
        let a = 1 - Math.max(Math.min(1, this.discoverAnimation / 30), 0);
        ctx.save();
        ctx.translate(this.x + 0.5, this.y + 0.5);
        ctx.scale(1.4 * a, 1.4 * a);
        ctx.rotate(this.angle * Math.PI / 180);
        ctx.globalAlpha = a;
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = "rgb(100,100,100)";
        ctx.drawImage(this.environment.cloudsImage, 25 * this.imageN, 0, 25, 25, -0.5, -0.5, 1, 1);
        ctx.restore();
    }
}