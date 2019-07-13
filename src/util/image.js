let canvas, context;

function getTemporaryCanvasContext () {
  if (!canvas || !context) {
    canvas = document.createElement('canvas');
    context = canvas.getContext('2d');
  }
  return { canvas, context };
}

export function getPixels (image, opts = {}) {
  const { maxDimension = Infinity } = opts;
  let { width, height } = image;

  // rescale if necessary
  if (width > maxDimension || height > maxDimension) {
    const aspect = width / height;
    if (width >= height) {
      width = maxDimension;
      height = Math.floor(width / aspect);
    } else {
      height = maxDimension;
      width = Math.floor(height * aspect);
    }
  }

  const { canvas, context } = getTemporaryCanvasContext();
  canvas.width = width;
  canvas.height = height;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, width, height);

  return context.getImageData(0, 0, width, height).data;
}

export async function encodeImageData (imageData) {
  const { canvas, context } = getTemporaryCanvasContext();
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.putImageData(imageData, 0, 0);
  return encodeCanvas(canvas);
}

export async function encodeImage (image) {
  const { canvas, context } = getTemporaryCanvasContext();
  canvas.width = image.width;
  canvas.height = image.height;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);
  return encodeCanvas(canvas);
}

export async function encodeCanvas (canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      const reader = new window.FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result));
      reader.onerror = () => reject(new Error('Could not read from blob'));
      reader.readAsArrayBuffer(blob);
    });
  });
}

export async function decodeImage (bytes) {
  const blob = new window.Blob([bytes]);
  const url = URL.createObjectURL(blob);
  const image = await new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Could not decode bytes due to an error`));
    img.src = url;
  });
  window.URL.revokeObjectURL(blob);
  return image;
}
