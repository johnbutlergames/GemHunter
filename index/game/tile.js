class Tile {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.discovered = false;
        this.discoverAnimation = 0;
    }
    update() {
        if (this.discovered) {
            this.discoverAnimation++;
        }
    }
}