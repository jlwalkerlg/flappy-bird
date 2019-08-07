import Game from './Game.js';

let game;
window.addEventListener('load', () => {
  game = new Game();
  game.init();
});
