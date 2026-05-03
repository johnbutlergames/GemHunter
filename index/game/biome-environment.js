class BiomeEnvironment {
    constructor(biome) {
        this.biome = biome;
        this.tiles = [];
    }
    async initializeTiles() {
        let biome = this.biome;
        let palette = await sniffImage(biome.image);
        let cloudsImage = Tile.cloudsImage;
        let colors = [
            ...palette.palette.dominant,
            palette.palette.foreground,
            palette.palette.ground,
            palette.palette.horizon,
            palette.palette.midground,
            palette.palette.sky
        ];
        colors = colors.sort((a, b) => {
            return hexToLightness(b) - hexToLightness(a);
        });
        this.cloudsImage = await recolorImage(
            Tile.cloudsImage,
            ["#c7c7c7", "#b4b4b4", "#848484", "#464646"],
            [colors[0], colors[1], colors[2], colors[7]]
        );

        for (let x = biome.x - biome.r; x < biome.x + biome.r; x++) {
            for (let y = biome.y - biome.r; y < biome.y + biome.r; y++) {
                this.tiles.push(new Tile(this, x, y));
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