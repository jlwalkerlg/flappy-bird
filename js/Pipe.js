import { drawRotatedImage } from './utils.js';
import { pipeGreenSprite, ctx } from './assets.js';

class Pipe {
  constructor(game, i, floorHeight) {
    this.game = game;
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
    return this.x + this.w - (this.u * this.game.dt) / 1000;
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
      prevPipe = this.game.pipes[this.game.pipes.length - 1];
    } else {
      prevPipe = this.game.pipes[pipeNo - 1];
    }
    this.x =
      prevPipe.x +
      prevPipe.w +
      this.randomNum(this.minSeparation, this.maxSeparation);
  }

  // reload new pipe height and gap after going off screen
  reloadVerticalPosition() {
    this.bottomOfTopPipe = this.randomNum(
      this.minHeight,
      canvas.height - this.floorHeight - this.minHeight - this.maxGap
    );
    this.topOfBottomPipe = this.randomNum(
      this.bottomOfTopPipe + this.minGap,
      this.bottomOfTopPipe + this.maxGap
    );
  }

  // draw pipe
  draw() {
    // draw pipe head separate from the pipe body so it does not become stretched/squashed

    // draw top pipe head
    drawRotatedImage(
      pipeGreenSprite,
      0,
      0,
      this.w,
      this.headHeight,
      this.x,
      this.bottomOfTopPipe - this.headHeight,
      this.w,
      this.headHeight,
      180
    );
    // draw top pipe body
    drawRotatedImage(
      pipeGreenSprite,
      0,
      this.headHeight,
      this.w,
      this.bodyHeight,
      this.x,
      0,
      this.w,
      this.bottomOfTopPipe - this.headHeight,
      180
    );
    // draw bottom pipe head
    ctx.drawImage(
      pipeGreenSprite,
      0,
      0,
      this.w,
      this.headHeight,
      this.x,
      this.topOfBottomPipe,
      this.w,
      this.headHeight
    );
    // draw bottom pipe body
    ctx.drawImage(
      pipeGreenSprite,
      0,
      this.headHeight,
      this.w,
      this.bodyHeight,
      this.x,
      this.topOfBottomPipe + this.headHeight,
      this.w,
      canvas.height - this.topOfBottomPipe - this.headHeight
    );
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

export default Pipe;
