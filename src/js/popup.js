import React from 'react';
import {render} from 'react-dom';

// common init
import 'iframe-resizer/js/iframeResizer.contentWindow';
import './lib/common';
import '../styles/popup.css';

import ui from './state/ui';

import Root from './components/root';


window.iFrameResizer = {
    messageCallback: ([action, data]) => {
        if (action == 'addImage') {
            ui.addImage(data);
        }
    }
};

chrome.storage.sync.get(null, settings => {
    ui.setSettings(settings);
    render(<Root />, document.getElementById('root'));
});
