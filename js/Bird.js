import { midflapSprite, wingSound } from './assets.js';
import { drawRotatedImage } from './utils.js';

class Bird {
  constructor(game, floorHeight) {
    this.game = game;
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
      ((this.right > pipe.x && this.right < pipe.right) ||
        (this.x > pipe.x && this.x < pipe.right)) &&
      (this.y < pipe.bottomOfTopPipe || this.bottom > pipe.topOfBottomPipe)
    );
  }

  // detect if bird passed a pipe
  detectPass(pipe) {
    // if bird was before pipe in previous frame, and is now after the pipe, bird passed pipe
    return this.x <= pipe.prevRight && this.x >= pipe.right;
  }

  detectFall() {
    return this.y + this.h >= canvas.height - this.floorHeight;
  }

  // update bird velocity and position
  update(dt) {
    if (this.game.state === 'READY') {
      if (
        (this.y + this.h / 2 > canvas.height / 2 &&
          this.y + this.h / 2 - this.v * dt < canvas.height / 2) ||
        (this.y + this.h / 2 < canvas.height / 2 &&
          this.y + this.h / 2 - this.v * dt > canvas.height / 2)
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

export default Bird;
