export default function (image) {
  if (image.complete) {
    return Promise.resolve(image);
  }
  return new Promise((resolve) =>
    image.addEventListener("load", () => resolve(image))
  );
}

export function imageMetadataLoaded(image) {
  return new Promise((resolve) => getDims(image, resolve)());
}

function getDims(image, resolve) {
  return function () {
    if (image.width && image.height) {
      resolve({ width: image.width, height: image.height });
    } else {
      setTimeout(getDims(image, resolve), 100);
    }
  };
}
