import React from 'react';
import {render} from 'react-dom';
import {autorun} from 'mobx';
import qs from 'qs';

// common init
import './lib/common';
import '../styles/popup.css';

import * as actions from './lib/actions';
import ui from './state/ui';
import user from './state/user';

import Root from './components/root';

chrome.storage.sync.get(null, settings => {
    ui.setSettings(settings);
    render(<Root />, document.getElementById('root'));
});

const {origin: parentOrigin} = qs.parse(location.search.substr(1));
window.addEventListener('message', ({origin, data: {action, data}}) => {
    if (origin !== parentOrigin) {
        return;
    }
    if (action === actions.ADD_IMAGE) {
        ui.addImage(data);
    }
    if (action === actions.WITH_SCROLLING) {
        ui.setScrolling(data);
    }
});


autorun(() => actions.send(window.parent, actions.FORM_IS_VISIBLE, user.isAuthorized && !ui.postAddress));
autorun(() => document.body.classList.toggle('with-scrolling', ui.withScrolling));

