class BiomeEnvironment {
    constructor(biome) {
        this.biome = biome;
        this.tiles = [];
        this.killed = false;
    }
    kill() {
        if (this.killed) return;
        this.killed = true;
        for (let tile of this.tiles) {
            tile.killTime = 50 + Math.random() * 400;
        }
    }
    async initializeTiles() {
        let biome = this.biome;
        let palette = biome.palette;
        let slopColors = biome.slopColors;
        let cloudsImage = Tile.cloudsImage;
        let colors = [
            ...palette.dominant,
            palette.foreground,
            palette.ground,
            palette.horizon,
            palette.midground,
            palette.sky
        ];
        colors = colors.sort((a, b) => {
            return hexToLightness(b) - hexToLightness(a);
        });
        this.cloudsImage = await recolorImage(
            Tile.cloudsImage,
            ["#c7c7c7", "#b4b4b4", "#848484", "#464646"],
            [...[colors[0], colors[1], colors[2]].map(e => lightenHex(e, 0.4)), lightenHex(colors[7], 0.1)]
        );
        this.grayCloudsImage = await recolorImage(
            Tile.cloudsImage,
            ["#c7c7c7", "#b4b4b4", "#848484", "#464646"],
            [...["#c7c7c7", "#b4b4b4", "#848484"].map(e => lightenHex(e, 0.4)), lightenHex("#464646", 0.1)]
        );

        let size = EnvironmentManager.BIOME_SIZE;
        let x = biome.x + Math.floor(Math.random() * size / 2) - Math.round(size / 4);
        let y = biome.y + Math.floor(Math.random() * size / 2) - Math.round(size / 4);
        this.gemLocation = { x, y };
        this.gem = new Gem(x, y, this.biome.id);

        this.grassImage = await recolorImage(
            Tile.grassImage,
            ["#cccccc", "#bbbbbb", "#949494", "#878787", "#8f8f8f", "#adadad", "#7d7d7d", "#5f5f5f"],
            [biome.slopColors.grass || colors[0], biome.slopColors["grass-accent"] || colors[1], colors[1], colors[2], colors[2], colors[3], colors[3], colors[7]]
        );

        this.deadGrassImage = await recolorImage(
            Tile.deadGrassImage,
            ["#cccccc", "#bbbbbb", "#949494", "#878787", "#8f8f8f", "#adadad", "#7d7d7d", "#5f5f5f"],
            ["#cccccc", "#bbbbbb", "#949494", "#878787", "#8f8f8f", "#adadad", "#7d7d7d", "#5f5f5f"]
        );

        this.flowerImage = await recolorImage(
            Tile.flowerImage,
            ["#444444", "#5f5f5f", "#b0b0b0", "#767676"],
            [colors[4], colors[5], biome.slopColors["flower-primary"] || colors[0], biome.slopColors["flower-secondary"] || colors[1]]
        );
        this.deadFlowerImage = await recolorImage(
            Tile.deadFlowerImage,
            ["#444444", "#5f5f5f"],
            ["#444444", "#5f5f5f"]
        );

        let grassVariations = [0, 1, 2, 3];
        grassVariations.splice(Math.floor(Math.random() * grassVariations.length), 1);
        grassVariations.splice(Math.floor(Math.random() * grassVariations.length), 1);

        for (let x = biome.x - biome.r; x < biome.x + biome.r; x++) {
            for (let y = biome.y - biome.r; y < biome.y + biome.r; y++) {
                if (Math.random() < 0.4) {
                    let variation = Math.floor(Math.random() * 2);
                    if (Math.random() < 0.3) {
                        this.tiles.push(new Tile(this, x, y, colors[0], this.flowerImage, this.deadFlowerImage, grassVariations[variation]));
                    } else {
                        this.tiles.push(new Tile(this, x, y, colors[0], this.grassImage, this.deadGrassImage, grassVariations[variation]));
                    }
                } else {
                    this.tiles.push(new Tile(this, x, y, colors[0]));
                }
            }
        }
    }
    discoverTiles(x, y) {
        for (let tile of this.tiles) {
            if (tile.discovered) continue;
            let dist = distTo(x, y, tile.x, tile.y);
            if (dist < 4) tile.discovered = true;
        }
    }
}