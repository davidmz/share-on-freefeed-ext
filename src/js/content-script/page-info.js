// looking for location change
let locationChanged = false;
{
    const [loc] = location.href.split('#', 2);
    const locPoll = setInterval(() => {
        const [loc2] = location.href.split('#', 2);
        if (loc2 !== loc) {
            locationChanged = true;
            clearInterval(locPoll);
        }
    }, 200);
}

const isImagePage = (document.images.length == 1 && document.images[0].src == location.href);

export default function () {
    return {
        title: getTitle(),
        selection: getSelectionText(),
        images: getImages()
    };
}

function getTitle() {
    if (isImagePage) {
        return '';
    }

    // Instagram
    if (location.hostname === 'www.instagram.com') {
        return document.title;
    }

    // Twitter status
    if (location.hostname === 'twitter.com' && /^\/[^\/]+\/status\/\d+/.test(location.pathname)) {
        return document.title.replace(/(\s+)(https:\/\/t.co\/\w+)/g, (match, space, link) => {
            const a = document.querySelector(`a[href="${link}"]`);
            if (a && a.dataset['expandedUrl']) {
                return space + a.dataset['expandedUrl'];
            }
            if (a && a.dataset['preEmbedded']) { // link to photo or video
                return '';
            }
            return match;
        });
    }

    if (!locationChanged) {
        const meta = document.querySelector('meta[property="og:title"]') || document.querySelector('meta[name="twitter:title"]');
        if (meta) {
            return meta.getAttribute('content');
        }
    }

    return document.title;
}

function getSelectionText() {
    let text = '';
    if ('getSelection' in window) {
        text = window.getSelection().toString();
    } else if (('selection' in document) && document.selection.type != 'Control') {
        text = document.selection.createRange().text;
    }
    return text;
}

function getImages() {
    if (isImagePage) {
        return [location.href];
    }

    // Twitter status
    if (location.hostname === 'twitter.com' && /^\/[^\/]+\/status\/\d+/.test(location.pathname)) {
        const images = document.querySelectorAll('.permalink-tweet .AdaptiveMedia img');
        return [...images].slice(0, 6).map(img => img.src).filter(src => /^https?:\/\//.test(src));
    }

    // Instagram photo
    if (location.hostname === 'www.instagram.com' && /^\/p\/[^\/]+/.test(location.pathname)) {
        const m = location.pathname.match(/^\/p\/[^\/]+/);
        return [`https://instagram.com${m[0]}/media/?size=l`];
    }

    if (/\.youtube\.com$/.test(location.hostname) || location.hostname === 'youtu.be') {
        return [];
    }

    if (location.hostname === '500px.com' && /^\/photo\/\d+/.test(location.pathname)) {
        const image = document.querySelector('.main_container img.photo');
        return image ? [image.src] : [];
    }

    if (!locationChanged) {
        const meta = document.querySelector('meta[property="og:image"]') || document.querySelector('meta[name="twitter:image:src"]');
        if (meta) {
            const src = meta.getAttribute('content');
            if (/^https?:\/\//.test(src)) {
                return [src];
            }
        }
    }
    return [];
}

