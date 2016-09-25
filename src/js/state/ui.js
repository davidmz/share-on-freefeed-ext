import {
    observable,
    action
} from 'mobx';

class UIStatus {
    @observable isLoading = false;
    @observable isBlocking = false;
    @observable selectedFeeds = [];
    @observable images = [];
    @observable postAddress = null;
    @observable settings = {};

    @action setLoading(st) { this.isLoading = st; }

    @action setBlocking(b = true) { this.isBlocking = b; }

    @action setPostAddress(addr) { this.postAddress = addr; }

    @action setSettings(s) { this.settings = s; }

    @action addImage(img) {
        if (this.images.indexOf(img) === -1) {
            this.images.push(img);
        }
    }

    @action delImage(img) {
        const p = this.images.indexOf(img);
        if (this.images.indexOf(img) >= 0) {
            this.images.splice(p, 1);
        }
    }

    isSelected(feedName) { return (this.selectedFeeds.indexOf(feedName) >= 0); }

    @action selectFeed(feedName, selected = true) {
        const idx = this.selectedFeeds.indexOf(feedName);
        if (selected && idx === -1) {
            this.selectedFeeds.push(feedName);
        } else if (!selected && idx >= 0) {
            this.selectedFeeds.splice(idx, 1);
        }
    }

    @action logout() {
        this.selectedFeeds = [];
        this.images = [];
        this.postAddress = null;
    }

    @action reorderImage(srcIdx, refIdx) {
        const [it] = this.images.splice(srcIdx, 1);
        this.images.splice(refIdx, 0, it);
    }
}

export default new UIStatus();