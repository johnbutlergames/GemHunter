let game = new Game(canvas, ctx, Mouse);

let lastTime = performance.now();

function gameLoop(now) {
    let deltaTime = (now - lastTime) / 1000;
    lastTime = now;

    game.update(deltaTime);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.draw(deltaTime);

    Keys.down = {};
    Keys.up = {};
    Mouse.update();

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);