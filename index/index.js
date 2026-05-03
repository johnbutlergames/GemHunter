let game = new Game(canvas, ctx, Mouse);

let lastTime = performance.now();

function gameLoop(now) {
    let deltaTime = (now - lastTime) / 1000;
    let deltaFrames = deltaTime * 60;
    lastTime = now;

    game.update(deltaFrames);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.draw(deltaFrames);

    Keys.down = {};
    Keys.up = {};
    Mouse.update();

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);