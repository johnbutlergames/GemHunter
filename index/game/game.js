class Game {
    constructor(canvas, ctx, mouse) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.mouse = mouse;
        this.cam = new Cam();
        this.cam.link(canvas, ctx, mouse);
        this.environmentManager = new EnvironmentManager(this);

        this.state = "idle";
        this.biomeTransition = null;
        this.loadingBiome = null;
    }
    update(dt) {
        if (this.state == "idle") this.updateIdleState(dt);
        if (this.state == "start biome load") this.startBiomeLoad(dt);
        if (this.state == "loading biome") this.updateLoadingBiomeState(dt);
        if (this.state == "start biome transition") this.startBiomeTransition(dt);
        if (this.state == "biome transition") this.updateBiomeTransitionState(dt);
        if (this.state == "start biome short transition") this.startBiomeShortTransition(dt);
        if (this.state == "biome short transition") this.updateBiomeTransitionState(dt);
    }
    updateIdleState(dt) {
        this.cam.update(dt);
        this.environmentManager.update(dt);
    }
    startBiomeLoad(dt) {
        this.state = "loading biome";
        this.loadingBiome = {
            animation: 0
        };
    }
    updateLoadingBiomeState(dt) {
        this.loadingBiome.animation++;
        if (this.environmentManager.targetBiome.initialized) {
            if (this.environmentManager.targetBiome.visited) {
                this.startBiomeShortTransition();
            } else {
                this.startBiomeTransition();
            }
        }
    }
    startBiomeTransition(dt) {
        this.state = "biome transition";
        this.biomeTransition = {
            animation: 0,
            ending: false
        };
    }
    startBiomeShortTransition(dt) {
        this.state = "biome short transition";
        this.biomeTransition = {
            animation: 0,
            short: true,
            ending: false
        };
    }
    updateBiomeTransitionState(dt) {
        this.biomeTransition.animation++;
        if (this.biomeTransition.animation > 100 && this.biomeTransition.ending) {
            this.endBiomeTransitionState();
            return;
        }
        if (this.biomeTransition.animation > 200 && !this.biomeTransition.ending && this.state == "biome short transition") {
            this.biomeTransition.ending = true;
            this.biomeTransition.animation = 0;
            this.environmentManager.switchBiome();
        }
        if (this.biomeTransition.animation > 1100 && !this.biomeTransition.ending) {
            this.biomeTransition.ending = true;
            this.biomeTransition.animation = 0;
            this.environmentManager.switchBiome();
        }
    }
    endBiomeTransitionState(dt) {
        this.biomeTransition = null;
        this.state = "idle";
    }
    draw(dt) {
        this.ctx.save();
        this.cam.alignViewport();

        this.environmentManager.draw(dt);

        this.ctx.restore();

        this.drawBiomeTransition();
    }
    drawBiomeTransition() {
        if (this.state != "biome transition" && this.state != "biome short transition") return;
        let direction = this.environmentManager.leaveBiomeDirection;
        let angle = dirTo(0, 0, direction.x, direction.y);
        let a = easeInOut(this.biomeTransition.animation / 100);
        if (this.biomeTransition.ending) {
            angle = (angle + 180) % 360;
            a = 1 - easeInOut(this.biomeTransition.animation / 100);
        }
        let gradientWidth = 1000;
        let translate = -a;
        let alpha = Math.min(a * 2, 1);
        let size = Math.max(this.canvas.width, this.canvas.height);

        this.ctx.save();
        if (angle == 0) {
            this.ctx.translate(this.canvas.width, 0);
            this.ctx.rotate(180 * Math.PI / 180);
        } else if (angle == 90) {
            this.ctx.translate(this.canvas.width, this.canvas.height);
            this.ctx.rotate(270 * Math.PI / 180);
        } else if (angle == 180) {
            this.ctx.translate(0, this.canvas.height);
            this.ctx.rotate(0 * Math.PI / 180);
        } else if (angle == 270) {
            this.ctx.translate(0, 0);
            this.ctx.rotate(90 * Math.PI / 180);
        }
        this.ctx.translate(0, (size + gradientWidth) * translate);

        this.ctx.globalAlpha = alpha;
        let grd = this.ctx.createLinearGradient(0, 0, 0, gradientWidth);
        grd.addColorStop(0, "rgba(0,0,0,0)");
        grd.addColorStop(1, "rgba(0,0,0,1)");
        this.ctx.fillStyle = grd;
        this.ctx.fillRect(0, 0, size, size + gradientWidth);
        this.ctx.restore();

        let gradientAnimation = easeInOut(this.biomeTransition.animation - 200) * (1 - easeInOut(this.biomeTransition.animation - 1000));
        let imageTransition = easeInOut((this.biomeTransition.animation - 200) / 150) * (1 - easeInOut((this.biomeTransition.animation - 900) / 100));
        let titleTransition = easeInOut((this.biomeTransition.animation - 300) / 200) * (1 - easeInOut((this.biomeTransition.animation - 700) / 200));
        this.ctx.save();
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        let image = this.environmentManager.targetBiome.image;
        if (image) {
            this.ctx.save();
            this.ctx.globalAlpha = imageTransition;
            let imageSize = 600;
            this.ctx.drawImage(image, -imageSize / 2, -imageSize / 2, imageSize, imageSize);
            this.ctx.restore();
            this.ctx.save();
            this.ctx.globalAlpha = gradientAnimation;
            let grd = this.ctx.createRadialGradient(0, 0, 0, 0, 0, imageSize * 0.7 * (imageTransition * 0.5 + 0.5));
            grd.addColorStop(0, "rgba(0,0,0,0)");
            grd.addColorStop(1, "rgba(0,0,0,1)");
            this.ctx.fillStyle = grd;
            this.ctx.fillRect(-imageSize / 2 - 2, -imageSize / 2 - 2, imageSize + 4, imageSize + 4);
            this.ctx.restore();
        }
        if (this.environmentManager.targetBiome.name) {
            this.ctx.save();
            this.ctx.globalAlpha = titleTransition;
            this.ctx.fillStyle = "white";
            this.ctx.font = "bold 100px Times New Roman";
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.fillText(this.environmentManager.targetBiome.name, 0, 0);
            this.ctx.restore();
        }
        this.ctx.restore();
    }
}