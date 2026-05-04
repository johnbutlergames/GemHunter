class SideBar {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;
        this.width = 400;
    }
    draw() {
        let backgroundColor0 = "rgba(200,200,200,0)";
        let backgroundColor = "rgba(200,200,200,1)";
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, this.width, this.canvas.height);

        let currentBiome = this.game.environmentManager.currentBiome;

        let image = currentBiome.image;
        if (image) {
            this.ctx.drawImage(image, 0, -50, this.width, this.width);
            let grd = this.ctx.createLinearGradient(0, 170, 0, 250);
            grd.addColorStop(0, backgroundColor0);
            grd.addColorStop(1, backgroundColor);
            this.ctx.fillStyle = grd;
            this.ctx.fillRect(0, 150, this.width, 400);
        }

        let name = currentBiome.name;
        let buffer = 30;
        let maxTextWidth = this.width - buffer * 2;
        if (name) {
            this.ctx.font = "bold 100px title";
            let width = this.ctx.measureText(name).width;

            let size = Math.min(50, 100 / (width / maxTextWidth))
            this.ctx.save();
            this.ctx.translate(this.width / 2, 120);
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillStyle = "white";
            this.ctx.font = `bold ${size}px title`;
            this.ctx.fillText(name, 0, 0);
            this.ctx.fillStyle = "black";
            this.ctx.font = `${size}px title`;
            this.ctx.fillText(name, 0, 0);
            this.ctx.restore();
        }

        let biomes = this.game.environmentManager.biomes;
        let x1 = Math.min(...biomes.map(e => e.x - e.r));
        let y1 = Math.min(...biomes.map(e => e.y - e.r));
        let x2 = Math.max(...biomes.map(e => e.x + e.r));
        let y2 = Math.max(...biomes.map(e => e.y + e.r));
        let w = x2 - x1;
        let h = y2 - y1;
        this.ctx.save();
        this.ctx.translate(this.width / 2 - (x1 + w / 2), 450 - (y1 + h / 2));
        for (let biome of biomes) {
            this.ctx.strokeStyle = "black";
            this.ctx.lineWidth = 1;
            this.ctx.save();
            this.ctx.scale(5,5);
            this.ctx.translate(biome.x * 1.2, biome.y * 1.2);
            if (biome == this.game.environmentManager.currentBiome) {
                let s = 1 + Math.round(Math.sin(this.game.t / 10)) * 0.05;
                this.ctx.scale(s, s);
            }
            this.ctx.strokeRect(-biome.r, -biome.r, biome.r * 2, biome.r * 2);
            if (biome.environment?.gem && !biome.environment.gem.collected) {
                this.ctx.scale(5, 5);
                this.ctx.imageSmoothingEnabled = false;
                biome.environment.gem.drawSprite(this.ctx);
            }
            this.ctx.restore();
        }
        this.ctx.restore();
    }
}