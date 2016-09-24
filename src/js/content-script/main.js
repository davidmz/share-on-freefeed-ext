import '../../styles/content-script.css';

import Popup from './iframe';
import ImageFrame from './image-frame';

const popup = new Popup();
const imageFrame = new ImageFrame();

imageFrame.onClick = src => popup.sendMessage(['addImage', src]);

chrome.runtime.onMessage.addListener(({action, data}) => {
    if (action === 'TOGGLE') {
        popup.toggle();
    } else if (action === 'OPEN') {
        popup.show(data.images);
    }
});

