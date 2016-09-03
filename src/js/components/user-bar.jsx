import React, {Component} from 'react';
import {observer} from 'mobx-react';

import {closePopup} from './cancel-link';
import SVGIcon from './svg-icon';
import css from '../../styles/modules/user-bar.css';

export default observer(['user'],
    class extends Component {
        isDragged = false;

        constructor(props) {
            super(props);
            window.addEventListener('mouseout', e => {
                    if (e.relatedTarget === null) {
                        this.isDragged = false;
                    }
                }
            );
            window.addEventListener('mouseup', () => this.isDragged = false);
            window.addEventListener('mousemove', e => {
                    if (this.isDragged && 'parentIFrame' in window) {
                        window['parentIFrame'].sendMessage({action: 'drag', data: {x: e.screenX, y: e.screenY}});
                    }
                }
            );
        }

        logout = e => {
            e.stopPropagation();
            this.props.user.logout();
        };

        mouseDown = e => {
            if (e.target.className === 'link') {
                return;
            }
            e.preventDefault();
            this.isDragged = true;
            if ('parentIFrame' in window) {
                window['parentIFrame'].sendMessage({action: 'dragStart', data: {x: e.screenX, y: e.screenY}});
            }
        };

        render() {
            const {user} = this.props;
            return (
                <div className={css.userBar} onMouseDown={this.mouseDown}>
                    <div className={css.avatar}>
                        <img src={user.avatar}/>
                    </div>
                    <div className={css.name}>
                        {user.userName}
                        <span className={css.signOutBlock}>(<span className="link" onClick={this.logout}>sign out</span>)</span>
                    </div>
                    <div className={css.close}>
                        <SVGIcon id="close" onClick={closePopup} className="link"/>
                    </div>
                </div>
            );
        }
    }
);