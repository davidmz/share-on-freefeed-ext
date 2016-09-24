import React, {Component} from 'react';
import {observer} from 'mobx-react';

import AJAXIndicator from './ajax-indicator';
import LoginForm from './login-form';
import ShareForm from './share-form';
import ViewPost from './view-post';

@observer(['user', 'ui'])
export default class extends Component {
    render() {
        const {user, ui} = this.props;
        return (
            <div>
                <AJAXIndicator />
                <div className={ui.isBlocking ? 'ui-blocked' : ''}>
                    {user.isAuthorized ? (ui.postAddress ? <ViewPost /> : <ShareForm/>) : <LoginForm/>}
                </div>
            </div>
        );
    }
}
