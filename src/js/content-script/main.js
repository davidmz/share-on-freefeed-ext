import Popup from './iframe';
import ImageFrame from './image-frame';

{
    // подключение CSS с учётом возможного отсутствия HEAD у документа (например, в PDF-вьювере)
    if (!document.head && document.getElementsByTagName("head").length === 0) {
        document.documentElement.insertBefore(document.createElement('head'), document.documentElement.firstChild);
    }
    require('../../styles/content-script.css');
}

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

