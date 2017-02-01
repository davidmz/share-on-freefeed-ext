import qs from 'qs';
import classNames from 'classnames';

import trim from '../lib/trim';
import getPageInfo from './page-info';
import * as actions from '../lib/actions';

const className = 'share-on-freefeed-iframe';

export default class {
    iframe = null;
    dragStart;
    origin;

    constructor() {
        this.origin = chrome.runtime.getURL('').slice(0, -1);
    }

    setHeight(height) {
        const minHeight = 380;
        const maxHeight = document.documentElement.clientHeight;
        if (height < minHeight) {
            height = minHeight;
        }
        if (height > maxHeight) {
            height = maxHeight;
            actions.send(this.iframe.contentWindow, actions.WITH_SCROLLING, true);
        } else {
            actions.send(this.iframe.contentWindow, actions.WITH_SCROLLING, false);
        }
        this.iframe.style.height = `${height}px`;
    }

    show(images = null) {
        if (this.iframe) {
            return;
        }
        this.iframe = document.createElement('iframe');
        this.iframe.className = classNames(className, 'right', 'top');
        const pageInfo = getPageInfo();
        const q = {
            title: trim(pageInfo.title),
            url: window.location.href,
            origin: window.location.origin,
            selection: trim(pageInfo.selection),
            images: images ? images : pageInfo.images
        };
        this.iframe.src = chrome.runtime.getURL('pages/popup.html') + '?' + qs.stringify(q);
        document.body.appendChild(this.iframe);
    }

    hide() {
        if (this.iframe.parentNode) {
            this.iframe.parentNode.removeChild(this.iframe);
        }
        this.iframe = null;
    }

    onDragStart(point) {
        const r = this.iframe.getBoundingClientRect();
        this.dragStart = {x: r.left - point.x, y: r.top - point.y};
    }

    onDrag(point) {
        let x = this.dragStart.x + point.x;
        let y = this.dragStart.y + point.y;

        const r = this.iframe.getBoundingClientRect();
        const docEl = document.documentElement;
        const snapSize = 10;

        const snap = {
            left: x < snapSize,
            top: y < snapSize,
            right: x > docEl.clientWidth - r.width - snapSize,
            bottom: y > docEl.clientHeight - r.height - snapSize
        };

        this.iframe.style.left = snap.left ? '0' : (snap.right ? 'auto' : x + 'px');
        this.iframe.style.right = snap.right ? '0' : 'auto';
        this.iframe.style.top = snap.top ? '0' : (snap.bottom ? 'auto' : y + 'px');
        this.iframe.style.bottom = snap.bottom ? '0' : 'auto';
        this.iframe.className = classNames(className, snap);
    }

    addImage(url) {
        actions.send(this.iframe.contentWindow, actions.ADD_IMAGE, url);
    }
}
