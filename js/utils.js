import { ctx } from './assets.js';

export function drawRotatedImage(img, sx, sy, sw, sh, dx, dy, dw, dh, deg) {
  if (arguments.length === 6) {
    [dx, dy, dw, dh, deg] = [sx, sy, sw, sh, dx];
  }

  ctx.save();
  ctx.translate(dx + dw / 2, dy + dh / 2);
  ctx.rotate((deg * Math.PI) / 180);

  if (arguments.length === 6) {
    ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
  } else {
    ctx.drawImage(img, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh);
  }

  ctx.restore();
}
