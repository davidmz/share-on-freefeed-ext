import qs from 'qs';
import iframeResizer from 'iframe-resizer/js/iframeResizer';
import classNames from 'classnames';

import trim from '../lib/trim';
import viewSize from '../lib/view-size';
import getPageInfo from './page-info';

const className = 'share-on-freefeed-iframe';

export default class {
    iframe = null;
    dragStart;

    toggle(images = null) {
        if (this.iframe) {
            this.hide();
        } else {
            this.show(images);
        }
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
            selection: trim(pageInfo.selection),
            images: images ? images : pageInfo.images
        };
        this.iframe.src = chrome.runtime.getURL('pages/popup.html') + '?' + qs.stringify(q);
        document.body.appendChild(this.iframe);
        iframeResizer({
            closedCallback: this.hide.bind(this),
            messageCallback: ({message}) => this.onMessage(message)
        }, this.iframe);
        document.body.classList.add('share-on-freefeed-with-iframe');
    }

    hide() {
        if (this.iframe.parentNode) {
            this.iframe.parentNode.removeChild(this.iframe);
        }
        this.iframe = null;
        document.body.classList.remove('share-on-freefeed-with-iframe');
    }

    sendMessage(msg) {
        this.iframe.iFrameResizer.sendMessage(msg);
    }

    onMessage({action, data}) {
        if (action === 'dragStart') {
            const r = this.iframe.getBoundingClientRect();
            this.dragStart = {x: r.left - data.x, y: r.top - data.y};
        }
        if (action === 'drag') {
            let x = this.dragStart.x + data.x;
            let y = this.dragStart.y + data.y;

            const r = this.iframe.getBoundingClientRect();
            const vs = viewSize();
            const snapSize = 10;

            const snap = {
                left: x < snapSize,
                top: y < snapSize,
                right: x > vs.width - r.width - snapSize,
                bottom: y > vs.height - r.height - snapSize
            };

            this.iframe.style.left = snap.left ? '0' : (snap.right ? 'auto' : x + 'px');
            this.iframe.style.right = snap.right ? '0' : 'auto';
            this.iframe.style.top = snap.top ? '0' : (snap.bottom ? 'auto' : y + 'px');
            this.iframe.style.bottom = snap.bottom ? '0' : 'auto';
            this.iframe.className = classNames(className, snap);
        }
    }
}
