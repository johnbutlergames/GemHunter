class Tile {
    static {
        this.cloudsImage = new Image();
        this.cloudsImage.src = "assets/clouds-25-25v2.png";
        this.grassImage = new Image();
        this.grassImage.src = "assets/grass-25-25.png";
        this.deadGrassImage = new Image();
        this.deadGrassImage.src = "assets/grass-dead-25-25.png";
    }
    constructor(environment, x, y, color, image, deadImage, variation) {
        this.environment = environment;
        this.x = x;
        this.y = y;
        this.imageN = ((x + y * 2) % 4 + 4) % 4;
        this.angle = Math.floor(Math.random() * 4) * 90;
        this.discovered = false;
        this.discoverAnimation = 0;
        this.image = image;
        this.deadImage = deadImage;
        this.variation = variation;
        this.flip = Math.floor(Math.random() * 2);
        this.size = 0.7 + Math.floor(Math.random() * 2) * 0.3;
        this.xOffset = Math.random() * 0.2 - 0.1;
        this.yOffset = Math.random() * 0.2 - 0.1;
        this.noise = noise(this.x * 2 + Math.random() * 0.1, this.y * 2 + Math.random() * 0.1, 500);
        this.color = color;

        this.killTime = 0;
        this.dead = false;
    }
    update(dt) {
        if (this.discovered) {
            this.discoverAnimation += dt;
        }
        if (this.killTime) {
            this.killTime -= dt;
            if (this.killTime <= 0) {
                this.dead = true;
                this.killTime = 0;
                this.color = hexToGrayscale(this.color);
            }
        }
    }
    drawBackground(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.noise ** 2 * 2;
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
            if (this.dead) {
                ctx.drawImage(this.deadImage, this.variation * 25, 0, 25, 25, -0.501, -0.501, 1.002, 1.002);
            } else {
                ctx.drawImage(this.image, this.variation * 25, 0, 25, 25, -0.501, -0.501, 1.002, 1.002);
            }
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
        if (this.dead) {
            ctx.drawImage(this.environment.grayCloudsImage, 25 * this.imageN, 50, 25, 25, -0.5, -0.5, 1, 1);
        } else {
            ctx.drawImage(this.environment.cloudsImage, 25 * this.imageN, 50, 25, 25, -0.5, -0.5, 1, 1);
        }
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
        if (this.dead) {
            ctx.drawImage(this.environment.grayCloudsImage, 25 * this.imageN, 0, 25, 25, -0.5, -0.5, 1, 1);
        } else {
            ctx.drawImage(this.environment.cloudsImage, 25 * this.imageN, 0, 25, 25, -0.5, -0.5, 1, 1);
        }
        ctx.restore();
    }
}