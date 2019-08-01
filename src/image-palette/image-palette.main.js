import { main as io } from 'figma-plugin-palette/util/io';

const TIMEOUT = 7500;
const PALETTE_COUNT = 5;

function getImageFill (node) {
  if (!node.fills || node.fills.length === 0) {
    return null;
  }

  const fills = node.fills;
  const fill = fills.find(fill => {
    return fill.type === 'IMAGE' && fill.imageHash;
  });
  return fill || null;
}

function getSelectedImageNodes () {
  const items = figma.currentPage.selection.map(node => {
    const children = typeof node.findAll === 'function'
      ? node.findAll(child => Boolean(getImageFill(child)))
      : [];
    const nodes = [ node, ...children ].filter(Boolean);
    const fills = nodes.map(n => getImageFill(n)).filter(Boolean);
    return fills.map(fill => {
      const image = figma.getImageByHash(fill.imageHash);
      return { node, fill, image };
    });
  }).reduce((a, b) => a.concat(b), []);

  // de-duplicate
  const uniques = [];
  const ids = {};
  items.forEach(item => {
    if (!(item.node.id in ids)) {
      ids[item.node.id] = true;
      uniques.push(item);
    }
  });
  return uniques;
}

async function retrievePalette (node, image) {
  const bytes = await image.getBytesAsync();
  const currentID = node.id;
  io.send('extract-palette', {
    count: PALETTE_COUNT,
    id: currentID,
    bytes
  });
  return new Promise((resolve, reject) => {
    let timeout = setTimeout(() => {
      reject(new Error(`Timed out on node ${currentID}`));
    }, TIMEOUT);

    io.on('palette', ({ palette, id }) => {
      if (id === currentID) {
        clearTimeout(timeout);
        resolve(palette);
      }
    });
  });
}

function createPaletteGroup (node, palette) {
  const interval = node.width / palette.length;
  const padding = node.width * 0.025;
  const cellSize = interval - padding;
  const nodes = palette.map((color, i) => {
    const ellipse = figma.createEllipse();
    // node.parent.appendChild(ellipse);
    ellipse.resize(cellSize, cellSize);
    ellipse.x = padding / 2 + node.x + i * (interval);
    ellipse.y = node.y + node.height + padding;

    const newFills = JSON.parse(JSON.stringify(ellipse.fills));
    newFills[0].color.r = color[0] / 255;
    newFills[0].color.g = color[1] / 255;
    newFills[0].color.b = color[2] / 255;
    ellipse.fills = newFills;
    ellipse.name = `Color${i}`;
    return ellipse;
  });

  const reversed = nodes.slice();
  reversed.reverse();
  reversed.forEach(n => node.parent.appendChild(n));

  const group = figma.group([ node, ...nodes ], node.parent);
  group.name = `${node.name} Palette`;
  return group;
}

(async () => {
  const selectedImages = getSelectedImageNodes();

  if (selectedImages.length === 0) {
    figma.closePlugin('You must select at least one image.');
  } else {
    // Show hidden decoder UI
    figma.showUI(__html__, { visible: false });

    // Make sure UI is fully loaded before sending bytes over
    await io.async('loaded');

    let groups = [];
    await selectedImages.reduce(async (promise, { node, image }) => {
      await promise;
      try {
        const palette = await retrievePalette(node, image);
        const group = createPaletteGroup(node, palette);
        groups.push(group);
      } catch (err) {
        console.error(err);
      }
    }, Promise.resolve());

    figma.currentPage.selection = groups;
    figma.closePlugin();
  }
})();
