const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// sprites
const downflapSprite = document.getElementById('yellowbird-downflap-sprite');
const midflapSprite = document.getElementById('yellowbird-midflap-sprite');
const upflapSprite = document.getElementById('yellowbird-upflap-sprite');
const pipeGreenSprite = document.getElementById('pipe-green-sprite');
const bgDaySprite = document.getElementById('background-day-sprite');
const floorSprite = document.getElementById('base-sprite');
const gameOverSprite = document.getElementById('game-over-sprite');
// number sprites
const zeroSprite = document.getElementById('zero-sprite');
const oneSprite = document.getElementById('one-sprite');
const twoSprite = document.getElementById('two-sprite');
const threeSprite = document.getElementById('three-sprite');
const fourSprite = document.getElementById('four-sprite');
const fiveSprite = document.getElementById('five-sprite');
const sixSprite = document.getElementById('six-sprite');
const sevenSprite = document.getElementById('seven-sprite');
const eightSprite = document.getElementById('eight-sprite');
const nineSprite = document.getElementById('nine-sprite');
const numberSprites = [zeroSprite, oneSprite, twoSprite, threeSprite, fourSprite, fiveSprite, sixSprite, sevenSprite, eightSprite, nineSprite];

// sounds
const wingSound = document.getElementById('wing-sound');
const pointSound = document.getElementById('point-sound');
const hitSound = document.getElementById('hit-sound');
const dieSound = document.getElementById('die-sound');

class Game {
    constructor() {
        this.state = null;
        this.score = 0;
        this.maxScore = localStorage.getItem('maxScore');

        this.floor = {
            h: 112,
            x: 0,
            u: -150
        }

        this.time = null;

        this.animationRequest = null;

        this.bird = new Bird(this.floor.h);
        this.pipes = [];
        for (let i = 0; i < 3; i++) {
            this.pipes.push(new Pipe(i, this.floor.h));
        }

        this.draw();
    }

    init() {
        this.state = 'READY';
        this.bird.setInitialMotion();
        if (this.maxScore === null) this.setMaxScore(0);
        requestAnimationFrame(game.update);
        document.addEventListener('keydown', startGame);
        canvas.addEventListener('mousedown', startGame);
    }

    // start game animation
    start(e) {
        game.state = 'RUNNING';
        document.removeEventListener('keydown', startGame);
        canvas.removeEventListener('mousedown', startGame);
        document.addEventListener('keydown', birdJump);
        canvas.addEventListener('mousedown', birdJump);
        game.bird.jump(e);
        game.bird.a = 800;
        game.pipes.forEach(pipe => pipe.u = -150);
        game.prevTime = null;
        game.dt = 0;
    }

    stop() {
        this.state = 'STOPPED';
        document.removeEventListener('keydown', birdJump);
        canvas.removeEventListener('mousedown', birdJump);
        this.pipes.forEach(pipe => pipe.u = 0);
        this.floor.u = 0;
    }

    handlePipeCollision() {
        this.stop();
        if (this.bird.v < 200) this.bird.v = 200;
        this.bird.dphi = 10;
    }

    handleFloorCollision() {
        this.stop();
        this.bird.v = 0;
        this.bird.a = 0;
        if (this.score >= this.maxScore) this.setMaxScore(this.score);
        this.displayGameOverMenu();
        document.addEventListener('keypress', restartGame);
        canvas.addEventListener('mousedown', restartGame);
    }

    restart() {
        document.removeEventListener('keypress', restartGame);
        canvas.removeEventListener('mousedown', restartGame);
        game.state = 'READY';
        game.bird.y = canvas.height / 2 - game.bird.h / 2;
        game.bird.setInitialMotion();
        game.bird.phi = 0;
        game.bird.dphi = 0;
        game.bird.jumpTime = 0;
        game.bird.img = midflapSprite;
        game.floor.u = -150;
        game.score = 0;
        game.pipes.forEach(pipe => pipe.setInitialPosition());
        document.addEventListener('keydown', startGame);
        canvas.addEventListener('mousedown', startGame);
    }

    // display game over menu
    displayGameOverMenu() {
        // darken canvas
        ctx.fillStyle = 'rgba(0,0,0,.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // draw game over sprite
        ctx.drawImage(gameOverSprite, canvas.width / 2 - gameOverSprite.width / 2, 100);

        // show score
        ctx.font = '20px Arial';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.fillText('Score', canvas.width / 2, 200);
        this.displaySpriteNumber(this.score, canvas.width / 2, 200 + 20);

        // show max score
        ctx.fillText('Best', canvas.width / 2, 300);
        this.displaySpriteNumber(this.maxScore, canvas.width / 2, 300 + 20);

        // show restart instructions
        ctx.fillText('Click or press space to restart.', canvas.width / 2, 450);
    }

    // display score
    displayScore() {
        this.displaySpriteNumber(this.score, canvas.width / 2, 50);
    }

    // display number using sprites
    displaySpriteNumber(num, x, y, scale) {
        if (!scale) scale = 1;
        // split number into separate digits
        const digits = String(num).split('').map(n => Number(n));
        // initialise total width of number to display
        let totalWidth = 0;
        // add width of each sprite to total display width
        for (var i = 0; i < digits.length; i++) {
            totalWidth += numberSprites[digits[i]].width * scale;
        }
        // initialise start offset from given position
        let offset = 0;
        // draw each sprite in center of canvas and increment offset by its width
        for (var i = 0; i < digits.length; i++) {
            let sprite = numberSprites[digits[i]];
            ctx.drawImage(sprite, x - totalWidth / 2 + offset, y, sprite.width * scale, sprite.height * scale);
            offset += sprite.width * scale;
        }
    }

    setMaxScore(score) {
        this.maxScore = score;
        localStorage.setItem('maxScore', score);
    }

    // clear canvas and draw game objects
    draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.pipes.forEach(pipe => pipe.draw());
        this.bird.draw();
        this.drawFloor();
    }

    updateFloor(dt) {
        this.floor.x += this.floor.u * dt;
        if (this.floor.x <= -canvas.width) {
            this.floor.x = 0;
        }
    }

    drawFloor() {
        ctx.drawImage(floorSprite, this.floor.x, canvas.height - this.floor.h, canvas.width, this.floor.h);
        ctx.drawImage(floorSprite, this.floor.x + canvas.width, canvas.height - this.floor.h, canvas.width, this.floor.h);
    }

    // game loop - update and draw game objects
    update(timestamp) {
        // initialise game.prevTime upon first animation frame
        if (!game.prevTime) game.prevTime = timestamp;
        // get time difference since last animation frame
        game.dt = timestamp - game.prevTime;
        game.prevTime = timestamp;

        // update game objects
        game.pipes.forEach(pipe => pipe.update(game.dt / 1000));
        game.bird.update(game.dt / 1000);
        game.updateFloor(game.dt / 1000);

        // draw game objects
        game.draw();

        // animate bird flapping unless it crashed
        if (game.state === 'RUNNING') {
            if (timestamp - game.bird.flightTime > 300) {
                game.bird.img = upflapSprite;
                game.bird.flightTime = timestamp;
            } else if (timestamp - game.bird.flightTime > 200) {
                game.bird.img = midflapSprite;
            } else if (timestamp - game.bird.flightTime > 100) {
                game.bird.img = downflapSprite;
            }
        }

        // if game is running and it has been more than .6 seconds since the last jump,
        // start rotating the bird clockwise
        if (game.state === 'RUNNING' && timestamp - game.bird.jumpTime > 600) {
            game.bird.dphi = 8;
        }

        // display score
        if (game.state === 'RUNNING') game.displayScore();

        // check if bird fell into floor
        if (game.bird.detectFall()) {
            if (game.state === 'RUNNING') {
                hitSound.play();
            }
            game.handleFloorCollision();
        }

        // check if bird collided with or passed pipe
        let i;
        for (i = 0; i < game.pipes.length; i++) {
            if (game.bird.detectCollision(game.pipes[i])) {
                if (game.state === 'RUNNING') {
                    hitSound.play();
                    dieSound.play();
                }
                game.handlePipeCollision();
            } else if (game.bird.detectPass(game.pipes[i])) {
                game.score++;
                pointSound.play();
            }
        }

        requestAnimationFrame(game.update);
    }
}

class Bird {
    constructor(floorHeight) {
        this.floorHeight = floorHeight;

        this.w = 30;
        this.h = 30;
        this.setInitialPosition();
        this.v = 0;
        this.a = 0;

        this.img = midflapSprite;
        this.flightTime = 0;
        this.jumpTime = 0;
        this.phi = 0;
        this.dphi = 0;
    }

    get right() {
        return this.x + this.w;
    }

    get bottom() {
        return this.y + this.h;
    }

    // set initial bird position
    setInitialPosition() {
        this.x = canvas.width * 0.4;
        this.y = canvas.height / 2 - this.h / 2;
    }

    // set initial bird velocity and acceleration
    setInitialMotion(dir) {
        if (!dir) dir = 1;
        this.a = -451 * dir;
        this.v = 91 * dir;
    }

    // draw bird
    draw() {
        drawRotatedImage(this.img, this.x, this.y, this.w, this.h, this.phi);
    }

    // make bird jump
    jump(e) {
        this.v = -280;
        this.jumpTime = e.timeStamp;
        this.phi = -20;
        this.dphi = 0;
        wingSound.currentTime = 0;
        wingSound.play();
    }

    // check if bird collided with a pipe
    detectCollision(pipe) {
        return (
            ((this.right > pipe.x && this.right < pipe.right) || (this.x > pipe.x && this.x < pipe.right)) &&
            (this.y < pipe.bottomOfTopPipe || this.bottom > pipe.topOfBottomPipe)
        );
    }

    // detect if bird passed a pipe
    detectPass(pipe) {
        // if bird was before pipe in previous frame, and is now after the pipe, bird passed pipe
        return ((this.x <= pipe.prevRight) && (this.x >= pipe.right));
    }

    detectFall() {
        return this.y + this.h >= canvas.height - this.floorHeight;
    }

    // update bird velocity and position
    update(dt) {
        if (game.state === 'READY') {
            if (
                (this.y + this.h / 2 > canvas.height / 2 && this.y + this.h / 2 - this.v * dt < canvas.height / 2) ||
                (this.y + this.h / 2 < canvas.height / 2 && this.y + this.h / 2 - this.v * dt > canvas.height / 2)
            ) {
                this.y = canvas.height / 2 - this.h / 2;
                if (this.v > 0) {
                    this.setInitialMotion();
                } else {
                    this.setInitialMotion(-1);
                }
            }
        } else if (this.y < 0) {
            // if bird hits top of screen, set velocity and position to 0
            this.v = 0;
            this.y = 0;
        }
        // update velocity then position
        this.v += this.a * dt;
        this.y += this.v * dt;
        // rotate bird
        this.phi += this.dphi;
        // don't let bird angle go beyond 90 deg
        if (this.phi > 90) {
            this.phi = 90;
        }
    }
}

class Pipe {
    constructor(i, floorHeight) {
        this.pipeNo = i;
        this.floorHeight = floorHeight;

        this.headHeight = 27;
        this.bodyHeight = 320 - this.headHeight;

        this.minHeight = 40;
        this.minGap = 90;
        this.maxGap = 130;
        this.minSeparation = 150;
        this.maxSeparation = 180;

        this.w = 52;
        this.y = 0;
        this.u = 0;
        this.setInitialPosition();
    }

    get right() {
        return this.x + this.w;
    }

    get prevRight() {
        return this.x + this.w - this.u * game.dt / 1000;
    }

    // helper function to generate random number between a given min and max
    randomNum(min, max) {
        return min + Math.random() * (max - min);
    }

    setInitialPosition() {
        this.x = canvas.width * 2 + this.maxSeparation * this.pipeNo;
        this.reloadVerticalPosition();
    }

    // reload new pipe position after going off screen
    reloadPosition(pipeNo) {
        this.reloadHorizontalPosition(pipeNo);
        this.reloadVerticalPosition();
    }

    // reload new pipe x position after going off screen
    reloadHorizontalPosition(pipeNo) {
        let prevPipe;
        if (pipeNo === 0) {
            prevPipe = game.pipes[game.pipes.length - 1];
        } else {
            prevPipe = game.pipes[pipeNo - 1];
        }
        this.x = prevPipe.x + prevPipe.w + this.randomNum(this.minSeparation, this.maxSeparation);
    }

    // reload new pipe height and gap after going off screen
    reloadVerticalPosition() {
        this.bottomOfTopPipe = this.randomNum(this.minHeight, canvas.height - this.floorHeight - this.minHeight - this.maxGap);
        this.topOfBottomPipe = this.randomNum(this.bottomOfTopPipe + this.minGap, this.bottomOfTopPipe + this.maxGap);
    }

    // draw pipe
    draw() {
        // draw pipe head separate from the pipe body so it does not become stretched/squashed

        // draw top pipe head
        drawRotatedImage(pipeGreenSprite, 0, 0, this.w, this.headHeight, this.x, this.bottomOfTopPipe - this.headHeight, this.w, this.headHeight, 180);
        // draw top pipe body
        drawRotatedImage(pipeGreenSprite, 0, this.headHeight, this.w, this.bodyHeight, this.x, 0, this.w, this.bottomOfTopPipe - this.headHeight, 180);
        // draw bottom pipe head
        ctx.drawImage(pipeGreenSprite, 0, 0, this.w, this.headHeight, this.x, this.topOfBottomPipe, this.w, this.headHeight);
        // draw bottom pipe body
        ctx.drawImage(pipeGreenSprite, 0, this.headHeight, this.w, this.bodyHeight, this.x, this.topOfBottomPipe + this.headHeight, this.w, canvas.height - this.topOfBottomPipe - this.headHeight);
    }

    // update pipe position
    update(dt) {
        if (this.x < -this.w) {
            // if pipe goes offscreen, reset position
            this.reloadPosition(this.pipeNo);
        } else {
            this.x += this.u * dt;
        }
    }
}

let game;
window.addEventListener('load', () => {
    game = new Game();
    game.init();
});

function startGame(e) {
    if (e.key) {
        if (e.key === ' ') {
            game.start(e);
        }
    } else {
        game.start(e);
    }
}

function birdJump(e) {
    if (e.key) {
        if (e.key === ' ') {
            game.bird.jump(e);
        }
    } else {
        game.bird.jump(e);
    }
}

function restartGame(e) {
    if (e.key) {
        if (e.key === ' ') {
            game.restart(e);
        }
    } else {
        game.restart(e);
    }
}

function drawRotatedImage(img, sx, sy, sw, sh, dx, dy, dw, dh, deg) {
    if (arguments.length === 6) {
        [dx, dy, dw, dh, deg] = [sx, sy, sw, sh, dx];
    }
    ctx.save();
    ctx.translate(dx + dw / 2, dy + dh / 2);
    ctx.rotate(deg * Math.PI / 180);
    if (arguments.length === 6) {
        ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
    } else {
        ctx.drawImage(img, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);
    }
    ctx.restore();
}
