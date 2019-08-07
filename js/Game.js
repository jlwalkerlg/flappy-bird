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

class Game {
  constructor() {
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

  init = () => {
    this.state = 'READY';
    this.bird.setInitialMotion();
    if (this.maxScore === null) this.setMaxScore(0);
    requestAnimationFrame(this.update);
    document.addEventListener('keydown', this.handleStartGame);
    canvas.addEventListener('mousedown', this.handleStartGame);
  };

  // start game animation
  start = e => {
    this.state = 'RUNNING';
    document.removeEventListener('keydown', this.handleStartGame);
    canvas.removeEventListener('mousedown', this.handleStartGame);
    document.addEventListener('keydown', this.handleBirdJump);
    canvas.addEventListener('mousedown', this.handleBirdJump);
    this.bird.jump(e);
    this.bird.a = 800;
    this.pipes.forEach(pipe => (pipe.u = -150));
    this.prevTime = null;
    this.dt = 0;
  };

  stop = () => {
    this.state = 'STOPPED';
    document.removeEventListener('keydown', this.handleBirdJump);
    canvas.removeEventListener('mousedown', this.handleBirdJump);
    this.pipes.forEach(pipe => (pipe.u = 0));
    this.floor.u = 0;
  };

  handlePipeCollision = () => {
    this.stop();
    if (this.bird.v < 200) this.bird.v = 200;
    this.bird.dphi = 10;
  };

  handleFloorCollision = () => {
    this.stop();
    this.bird.v = 0;
    this.bird.a = 0;
    if (this.score >= this.maxScore) this.setMaxScore(this.score);
    this.displayGameOverMenu();
    document.addEventListener('keypress', this.handleRestartGame);
    canvas.addEventListener('mousedown', this.handleRestartGame);
  };

  restart = () => {
    document.removeEventListener('keypress', this.handleRestartGame);
    canvas.removeEventListener('mousedown', this.handleRestartGame);
    this.state = 'READY';
    this.bird.y = canvas.height / 2 - this.bird.h / 2;
    this.bird.setInitialMotion();
    this.bird.phi = 0;
    this.bird.dphi = 0;
    this.bird.jumpTime = 0;
    this.bird.img = midflapSprite;
    this.floor.u = -150;
    this.score = 0;
    this.pipes.forEach(pipe => pipe.setInitialPosition());
    document.addEventListener('keydown', this.handleStartGame);
    canvas.addEventListener('mousedown', this.handleStartGame);
  };

  // display game over menu
  displayGameOverMenu = () => {
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
  };

  // display score
  displayScore = () => {
    this.displaySpriteNumber(this.score, canvas.width / 2, 50);
  };

  // display number using sprites
  displaySpriteNumber = (num, x, y, scale) => {
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
  };

  setMaxScore = score => {
    this.maxScore = score;
    localStorage.setItem('maxScore', score);
  };

  // clear canvas and draw game objects
  draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.pipes.forEach(pipe => pipe.draw());
    this.bird.draw();
    this.drawFloor();
  };

  updateFloor = dt => {
    this.floor.x += this.floor.u * dt;
    if (this.floor.x <= -canvas.width) {
      this.floor.x = 0;
    }
  };

  drawFloor = () => {
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
  };

  handleStartGame = e => {
    if (e.key) {
      if (e.key === ' ') {
        this.start(e);
      }
    } else {
      this.start(e);
    }
  };

  handleBirdJump = e => {
    if (e.key) {
      if (e.key === ' ') {
        this.bird.jump(e);
      }
    } else {
      this.bird.jump(e);
    }
  };

  handleRestartGame = e => {
    if (e.key) {
      if (e.key === ' ') {
        this.restart(e);
      }
    } else {
      this.restart(e);
    }
  };

  // game loop - update and draw game objects
  update = timestamp => {
    // initialise game.prevTime upon first animation frame
    if (!this.prevTime) this.prevTime = timestamp;
    // get time difference since last animation frame
    this.dt = timestamp - this.prevTime;
    this.prevTime = timestamp;

    // update game objects
    this.pipes.forEach(pipe => pipe.update(this.dt / 1000));
    this.bird.update(this.dt / 1000);
    this.updateFloor(this.dt / 1000);

    // draw game objects
    this.draw();

    // animate bird flapping unless it crashed
    if (this.state === 'RUNNING') {
      if (timestamp - this.bird.flightTime > 300) {
        this.bird.img = upflapSprite;
        this.bird.flightTime = timestamp;
      } else if (timestamp - this.bird.flightTime > 200) {
        this.bird.img = midflapSprite;
      } else if (timestamp - this.bird.flightTime > 100) {
        this.bird.img = downflapSprite;
      }
    }

    // if game is running and it has been more than .6 seconds since the last jump,
    // start rotating the bird clockwise
    if (this.state === 'RUNNING' && timestamp - this.bird.jumpTime > 600) {
      this.bird.dphi = 8;
    }

    // display score
    if (this.state === 'RUNNING') this.displayScore();

    // check if bird fell into floor
    if (this.bird.detectFall()) {
      if (this.state === 'RUNNING') {
        hitSound.play();
      }
      this.handleFloorCollision();
    }

    // check if bird collided with or passed pipe
    let i;
    for (i = 0; i < this.pipes.length; i++) {
      if (this.bird.detectCollision(this.pipes[i])) {
        if (this.state === 'RUNNING') {
          hitSound.play();
          dieSound.play();
        }
        this.handlePipeCollision();
      } else if (this.bird.detectPass(this.pipes[i])) {
        this.score++;
        pointSound.play();
      }
    }

    requestAnimationFrame(this.update);
  };
}

export default Game;
