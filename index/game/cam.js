class Cam {
    constructor(game) {
        this.game = game;
        this.x = 0;
        this.y = 0;
        this.zoom = 70;
    }
    link(canvas, ctx, mouse) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.mouse = mouse;
    }
    alignViewport() {
        this.ctx.translate(this.canvas.width / 2 + this.game.sideBar.width / 2, this.canvas.height / 2);
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(this.x, this.y);
    }
    screenToGlobal(x, y) {
        return {
            x: (x - this.canvas.width / 2 - this.game.sideBar.width / 2) / this.zoom - this.x,
            y: (y - this.canvas.height / 2) / this.zoom - this.y
        };
    }
    globalToScreen(x, y) {
        return {
            x: (x + this.x) * this.zoom + this.canvas.width / 2,
            y: (y + this.y) * this.zoom + this.canvas.height / 2
        };
    }
    update(dt) {
        if (!this.game.environmentManager.player) return;
        let follow = 0.03;

        let player = this.game.environmentManager.player;
        this.x = this.x * (1 - follow) - (player.x + 0.5) * follow;
        this.y = this.y * (1 - follow) - (player.y + 0.5) * follow;
    }
}

class MapCam extends Cam {
    constructor(game) {
        super(game);
        this.movingOrigin = null;
    }
    update(dt) {
        this.updateScroll(dt);
        this.updateMove(dt);
    }
    updateScroll(dt) {
        if (!this.mouse.scrollY) return;
        let scaleFactor = Math.max(Math.min(1 - this.mouse.scrollY * 0.002, 2), 0.5);
        if (Keys.keys.Control) scaleFactor = Math.max(Math.min(1 - this.mouse.scrollY * 0.0002, 2), 0.5);
        let oldZoom = this.zoom;
        let newZoom = this.zoom * scaleFactor;
        newZoom = Math.min(Math.max(newZoom, 0.1), 40);
        let deltaX = (this.mouse.x - this.canvas.width / 2) / newZoom - (this.mouse.x - this.canvas.width / 2) / oldZoom;
        let deltaY = (this.mouse.y - this.canvas.height / 2) / newZoom - (this.mouse.y - this.canvas.height / 2) / oldZoom;
        this.x += deltaX;
        this.y += deltaY;
        this.zoom = newZoom;
    }
    updateMove(dt) {
        if (this.mouse.startButtons[0]) {
            this.movingOrigin = { x: this.x, y: this.y, mouseX: this.mouse.x, mouseY: this.mouse.y };
        }
        if (this.mouse.buttons[0]) {
            let deltaX = this.mouse.x - this.movingOrigin.mouseX;
            let deltaY = this.mouse.y - this.movingOrigin.mouseY;
            let dist = distTo(0, 0, deltaX, deltaY);
            if (dist > 10 || this.justMoved) {
                this.justMoved = true;
                this.x = this.movingOrigin.x + deltaX / this.zoom;
                this.y = this.movingOrigin.y + deltaY / this.zoom;
            }
        } else if (this.movingOrigin) {
            this.movingOrigin = null;
        } else {
            this.justMoved = false;
        }
    }
}