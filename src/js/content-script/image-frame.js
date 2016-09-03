export default class {
    imageSrc = null;
    rect = null;
    frame = null;
    onClick = () => {};

    constructor() {
        this.frame = document.body.appendChild(document.createElement('div'));
        this.frame.className = 'share-on-freefeed-image-frame';

        document.addEventListener('mouseover', this.docMouseOver.bind(this));
        document.addEventListener('mousemove', this.docMouseMove.bind(this));
        window.addEventListener('scroll', this.clear.bind(this));
        window.addEventListener('resize', this.clear.bind(this));

        this.frame.addEventListener('click', e => {
            e.stopPropagation();
            this.onClick(this.imageSrc);
        });
    }

    clear() {
        this.imageSrc = null;
        this.rect = null;
        this.frame.classList.remove('-visible');
    };

    docMouseOver(e) {
        const src = getImageSrc(e.target);
        if (src === null) {
            return;
        }
        this.rect = e.target.getBoundingClientRect();
        if (this.rect.width < 20 && this.rect.height < 20) {
            this.clear();
            return;
        }
        this.imageSrc = src;
        this.frame.style.left = (this.rect.left - 6) + 'px';
        this.frame.style.top = (this.rect.top - 6) + 'px';
        this.frame.style.width = this.rect.width + 'px';
        this.frame.style.height = this.rect.height + 'px';
        this.frame.style.backgroundImage = `url(${this.imageSrc})`;
        this.frame.classList.add('-visible');
    }

    docMouseMove(e) {
        if (!this.rect) {
            return;
        }

        if (
            e.clientX < this.rect.left - 1
            || e.clientX > this.rect.right + 1
            || e.clientY < this.rect.top - 1
            || e.clientY > this.rect.bottom + 1
        ) {
            this.clear();
        }
    }
}

function getImageSrc(el) {
    if (!el) {
        return null;
    }

    if (el.nodeName == 'IMG') {
        const src = el.currentSrc || el.src;
        return (src && /^https?:\/\//.test(src)) ? src : null;
    }

    if (location.hostname === 'www.instagram.com') {
        if (el.className === '_ovg3g') {
            return getImageSrc(el.previousElementSibling.firstElementChild);
        }
        if (el.className === '_c2kdw') {
            return getImageSrc(el.previousElementSibling.querySelector('img'));
        }
    }

    if (location.hostname === 'vk.com') {
        if (el.nodeName === 'A' && el.classList.contains('image_cover')) {
            const m = el.style.backgroundImage.match(/^url\("(https?:\/\/.+)"\)$/);
            if (m) {
                return m[1];
            }
        }
    }

    if (location.hostname === 'www.flickr.com') {
        if (el.nodeName === 'A' && el.classList.contains('overlay')) {
            const m = el.parentNode.parentNode.parentNode.style.backgroundImage.match(/^url\("(\/\/.+)"\)$/);
            if (m) {
                return location.protocol + m[1];
            }
        }
        if (el.nodeName === 'DIV' && el.classList.contains('photo-notes-scrappy-view')) {
            return getImageSrc(el.previousElementSibling.querySelector('img.main-photo'));
        }
    }

    return null;
}
