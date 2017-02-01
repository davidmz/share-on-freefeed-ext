import React, {Component} from 'react';
import {inject, observer} from 'mobx-react';
import {observable, action, autorun} from 'mobx';

import css from '../../styles/modules/view-post.css';

import UserBar from './user-bar';
import {closePopup} from './cancel-link';

const frontends = {
    'freefeed.net': 'https://freefeed.net/',
    'gamma.freefeed.net': 'https://gamma.freefeed.net/',
    'm.freefeed.net': 'https://m.freefeed.net/as/FreeFeed/',
    'myfeed.rocks': 'https://myfeed.rocks/as/FreeFeed/'
};

const lsFrontendKey = 'frontend';

export default inject('ui')(observer(
    class extends Component {
        @observable frontend = 'freefeed.net';

        @action changeFrontend = event => this.frontend = event.target.value;

        constructor(props) {
            super(props);

            const fr = localStorage.getItem(lsFrontendKey);
            if (fr && (fr in frontends)) {
                this.frontend = fr;
            }
        }

        goToPost = () => {
            localStorage.setItem(lsFrontendKey, this.frontend);
            const url = frontends[this.frontend] + this.props.ui.postAddress;
            window.open(url, '_blank');
            closePopup();
        };

        render() {
            return (
                <div>
                    <UserBar />
                    <div className={css.box}>
                        <p>Done! Now open your new post on your favorite frontend:</p>
                        <p>
                            <select className={css.select} value={this.frontend} onChange={this.changeFrontend}>
                                <option value="freefeed.net">freefeed.net</option>
                                <option value="gamma.freefeed.net">gamma.freefeed.net</option>
                                <option value="m.freefeed.net">m.freefeed.net</option>
                                <option value="myfeed.rocks">myfeed.rocks</option>
                            </select>
                        </p>
                        <p>
                            <button
                                type="button"
                                className="button -default"
                                onClick={this.goToPost}
                            >View post
                            </button>
                        </p>
                    </div>
                </div>
            );
        }
    }
));