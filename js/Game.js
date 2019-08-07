import Bird from './Bird.js';
import Pipe from './Pipe.js';
import {
  ctx,
  floorSprite,
  upflapSprite,
  numberSprites,
  downflapSprite,
  midflapSprite,
  hitSound,
  gameOverSprite,
  pointSound,
  dieSound,
} from './assets.js';

let game;

class Game {
  constructor() {
    game = this;
    this.state = null;
    this.score = 0;
    this.maxScore = localStorage.getItem('maxScore');

    this.floor = {
      h: 112,
      x: 0,
      u: -150,
    };

    this.time = null;

    this.animationRequest = null;

    this.bird = new Bird(this, this.floor.h);
    this.pipes = [];
    for (let i = 0; i < 3; i++) {
      this.pipes.push(new Pipe(this, i, this.floor.h));
    }

    this.draw();
  }

  init() {
    this.state = 'READY';
    this.bird.setInitialMotion();
    if (this.maxScore === null) this.setMaxScore(0);
    requestAnimationFrame(game.update);
    document.addEventListener('keydown', game.startGame);
    canvas.addEventListener('mousedown', game.startGame);
  }

  // start game animation
  start(e) {
    game.state = 'RUNNING';
    document.removeEventListener('keydown', game.startGame);
    canvas.removeEventListener('mousedown', game.startGame);
    document.addEventListener('keydown', game.birdJump);
    canvas.addEventListener('mousedown', game.birdJump);
    game.bird.jump(e);
    game.bird.a = 800;
    game.pipes.forEach(pipe => (pipe.u = -150));
    game.prevTime = null;
    game.dt = 0;
  }

  stop() {
    this.state = 'STOPPED';
    document.removeEventListener('keydown', game.birdJump);
    canvas.removeEventListener('mousedown', game.birdJump);
    this.pipes.forEach(pipe => (pipe.u = 0));
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
    document.addEventListener('keypress', game.restartGame);
    canvas.addEventListener('mousedown', game.restartGame);
  }

  restart() {
    document.removeEventListener('keypress', game.restartGame);
    canvas.removeEventListener('mousedown', game.restartGame);
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
    document.addEventListener('keydown', game.startGame);
    canvas.addEventListener('mousedown', game.startGame);
  }

  // display game over menu
  displayGameOverMenu() {
    // darken canvas
    ctx.fillStyle = 'rgba(0,0,0,.7)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // draw game over sprite
    ctx.drawImage(
      gameOverSprite,
      canvas.width / 2 - gameOverSprite.width / 2,
      100
    );

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
    const digits = String(num)
      .split('')
      .map(n => Number(n));
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
      ctx.drawImage(
        sprite,
        x - totalWidth / 2 + offset,
        y,
        sprite.width * scale,
        sprite.height * scale
      );
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
    ctx.drawImage(
      floorSprite,
      this.floor.x,
      canvas.height - this.floor.h,
      canvas.width,
      this.floor.h
    );
    ctx.drawImage(
      floorSprite,
      this.floor.x + canvas.width,
      canvas.height - this.floor.h,
      canvas.width,
      this.floor.h
    );
  }

  startGame(e) {
    if (e.key) {
      if (e.key === ' ') {
        game.start(e);
      }
    } else {
      game.start(e);
    }
  }

  birdJump(e) {
    if (e.key) {
      if (e.key === ' ') {
        game.bird.jump(e);
      }
    } else {
      game.bird.jump(e);
    }
  }

  restartGame(e) {
    if (e.key) {
      if (e.key === ' ') {
        game.restart(e);
      }
    } else {
      game.restart(e);
    }
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

export default Game;
