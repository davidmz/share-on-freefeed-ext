export default function (image) {
    if (image.complete) {
        return Promise.resolve(image);
    }
    return new Promise(resolve => image.addEventListener('load', () => resolve(image)));
}
