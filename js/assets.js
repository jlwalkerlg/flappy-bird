import { createImage } from './utils.js';

// canvas
export const canvas = document.getElementById('canvas');
export const ctx = canvas.getContext('2d');

// sprites
export const downflapSprite = createImage(
  '../assets/sprites/yellowbird-downflap.png'
);
export const midflapSprite = createImage(
  '../assets/sprites/yellowbird-midflap.png'
);
export const upflapSprite = createImage(
  '../assets/sprites/yellowbird-upflap.png'
);
export const pipeGreenSprite = createImage('../assets/sprites/pipe-green.png');
export const bgDaySprite = createImage('../assets/sprites/background-day.png');
export const floorSprite = createImage('../assets/sprites/base.png');
export const gameOverSprite = createImage('../assets/sprites/gameover.png');

// number sprites
export const zeroSprite = createImage('../assets/sprites/0.png');
export const oneSprite = createImage('../assets/sprites/1.png');
export const twoSprite = createImage('../assets/sprites/2.png');
export const threeSprite = createImage('../assets/sprites/3.png');
export const fourSprite = createImage('../assets/sprites/4.png');
export const fiveSprite = createImage('../assets/sprites/5.png');
export const sixSprite = createImage('../assets/sprites/6.png');
export const sevenSprite = createImage('../assets/sprites/7.png');
export const eightSprite = createImage('../assets/sprites/8.png');
export const nineSprite = createImage('../assets/sprites/9.png');
export const numberSprites = [
  zeroSprite,
  oneSprite,
  twoSprite,
  threeSprite,
  fourSprite,
  fiveSprite,
  sixSprite,
  sevenSprite,
  eightSprite,
  nineSprite,
];

// sounds
export const wingSound = new Audio('../assets/audio/wing.wav');
export const pointSound = new Audio('../assets/audio/point.wav');
export const hitSound = new Audio('../assets/audio/hit.wav');
export const dieSound = new Audio('../assets/audio/die.wav');
