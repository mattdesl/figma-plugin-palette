import { ui as io } from 'figma-plugin-palette/util/io';
import { decodeImage, getPixels } from 'figma-plugin-palette/util/image';
import getRGBAPalette from 'get-rgba-palette';

// To speed up palette generation for large images...
const maxDimension = 1024;

(async () => {
  io.send('loaded');

  io.on('extract-palette', async ({ id, bytes, count = 5 }) => {
    const image = await decodeImage(bytes);
    const pixels = getPixels(image, { maxDimension });
    const palette = getRGBAPalette(pixels, count);
    io.send('palette', {
      id,
      palette
    });
  });
})();
