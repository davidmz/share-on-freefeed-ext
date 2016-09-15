export default class {
    imageSrc = null;
    rect = null;
    frame = null;
    /** @type {Array.<HotZone>} */
    hotZones = [];
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

        this.initHotZones();
        setInterval(() => this.initHotZones(), 500);
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
        const rect = e.target.getBoundingClientRect();
        if (rect.width < 20 && rect.height < 20) {
            return;
        }
        this.show(new HotZone(src, rect));
    }

    /**
     * @param {HotZone} hotZone
     */
    show(hotZone) {
        this.imageSrc = hotZone.src;
        this.rect = hotZone.rect;
        this.frame.style.left = (this.rect.left - 6) + 'px';
        this.frame.style.top = (this.rect.top - 6) + 'px';
        this.frame.style.width = this.rect.width + 'px';
        this.frame.style.height = this.rect.height + 'px';
        this.frame.style.backgroundImage = `url(${this.imageSrc})`;
        this.frame.classList.add('-visible');
    }

    docMouseMove(e) {
        if (!this.rect) {
            const zone = this.hotZones.find(z => inRect(e, z.rect));
            if (zone) {
                this.show(zone);
            }
            return;
        }
        if (!inRect(e, this.rect)) {
            this.clear();
        }
    }

    initHotZones() {
        if (location.hostname === '500px.com') {
            /** @type {HTMLImageElement} */
            const mainImage = document.querySelector('.main_container img.photo');
            if (mainImage) {
                this.hotZones = [HotZone.fromImage(mainImage)];
            } else {
                this.hotZones = [];
            }
        }
    }
}


/**
 *
 * @param {MouseEvent} e
 * @param {ClientRect} rect
 */
function inRect(e, rect) {
    return e.clientX >= rect.left - 1
        && e.clientX <= rect.right + 1
        && e.clientY >= rect.top - 1
        && e.clientY <= rect.bottom + 1
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

    if (location.hostname === '500px.com') {
        if (el.nodeName === 'A' && el.classList.contains('photo_link')) {
            return getImageSrc(el.querySelector(':scope > img'));
        }
        if (el.nodeName === 'DIV' && el.classList.contains('nsfw_placeholder_content')) {
            return getImageSrc(el.previousElementSibling);
        }
    }

    return null;
}

class HotZone {
    /** @type {string} */
    src;
    /** @type {ClientRect} */
    rect;

    /**
     * @param {string} src
     * @param {ClientRect} rect
     */
    constructor(src, rect) {
        this.src = src;
        this.rect = rect;
    }

    /**
     *
     * @param {HTMLImageElement} img
     * @return {HotZone}
     */
    static fromImage(img) {
        return new HotZone(img.currentSrc || img.src, img.getBoundingClientRect())
    }
}