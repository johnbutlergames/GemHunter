class BiomeEnvironment {
    constructor(biome) {
        this.biome = biome;
        this.tiles = [];
    }
    initializeTiles() {
        let biome = this.biome;
        for (let x = biome.x - biome.r; x < biome.x + biome.r; x++) {
            for (let y = biome.y - biome.r; y < biome.y + biome.r; y++) {
                this.tiles.push(new Tile(x, y));
            }
        }
    }
}