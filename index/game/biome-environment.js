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
    discoverTiles(x, y) {
        for (let tile of this.tiles) {
            if (tile.discovered) continue;
            let dist = distTo(x, y, tile.x, tile.y);
            if (dist < 4) tile.discovered = true;
        }
    }
}