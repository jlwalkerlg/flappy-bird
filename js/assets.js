// canvas
export const canvas = document.getElementById('canvas');
export const ctx = canvas.getContext('2d');

// sprites
export const downflapSprite = document.getElementById(
  'yellowbird-downflap-sprite'
);
export const midflapSprite = document.getElementById(
  'yellowbird-midflap-sprite'
);
export const upflapSprite = document.getElementById('yellowbird-upflap-sprite');
export const pipeGreenSprite = document.getElementById('pipe-green-sprite');
export const bgDaySprite = document.getElementById('background-day-sprite');
export const floorSprite = document.getElementById('base-sprite');
export const gameOverSprite = document.getElementById('game-over-sprite');

// number sprites
export const zeroSprite = document.getElementById('zero-sprite');
export const oneSprite = document.getElementById('one-sprite');
export const twoSprite = document.getElementById('two-sprite');
export const threeSprite = document.getElementById('three-sprite');
export const fourSprite = document.getElementById('four-sprite');
export const fiveSprite = document.getElementById('five-sprite');
export const sixSprite = document.getElementById('six-sprite');
export const sevenSprite = document.getElementById('seven-sprite');
export const eightSprite = document.getElementById('eight-sprite');
export const nineSprite = document.getElementById('nine-sprite');
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
export const wingSound = document.getElementById('wing-sound');
export const pointSound = document.getElementById('point-sound');
export const hitSound = document.getElementById('hit-sound');
export const dieSound = document.getElementById('die-sound');
