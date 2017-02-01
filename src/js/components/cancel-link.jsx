import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';

export default inject('user')(observer(
    class extends Component {
        render() {
            return <span className="link"
                         onClick={closePopup}>{this.props.title ? this.props.title : 'cancel'}</span>;
        }
    }
));

export function closePopup() {
    if ('parentIFrame' in window) {
        window['parentIFrame'].close();
    }
}