import React, {Component} from 'react';
import {observer} from 'mobx-react';
import {observable, action, computed, toJS} from 'mobx';
import qs from 'qs';
import xor from 'lodash.xor';
import uniq from 'lodash.uniq';

import trim from '../lib/trim';
import * as api from '../lib/api';

import UserBar from './user-bar';
import FeedSelector from './feed-selector';
import ImageList from './image-list';

import css from '../../styles/modules/share-form.css';

export default observer(['user', 'ui'],
    class extends Component {
        @observable postText = '';
        @observable commentText = '';
        @observable commentOpened = false;
        @observable feedSelector = false;
        @observable postError = '';

        @action changePostText = event => this.postText = event.target.value;
        @action changeCommentText = event => this.commentText = event.target.value;
        @action setPostError = error => this.postError = error;
        @action openComment = event => this.commentOpened = true;

        delImage = src => event => this.props.ui.delImage(src);

        @action showSelector = () => {
            const {user, ui} = this.props;
            const p = {
                allTargets: user.targets.slice(),
                favorites: user.favorites.slice(),
                selected: ui.selectedFeeds.slice(),
                done: this.hideSelector
            };
            this.feedSelector = <FeedSelector {...p} />;
        };

        @action hideSelector = (selected, favorites) => {
            const {user, ui} = this.props;
            ui.selectedFeeds = selected;
            this.feedSelector = false;
            if (xor(favorites, user.favorites).length > 0) {
                user.updateFavorites(uniq(favorites));
            }
        };

        @computed get selectedTargets() {
            const {user, ui} = this.props;
            return user.targets.filter(t => ui.isSelected(t.userName));
        }

        @computed get canPost() {
            return this.selectedTargets.length > 0 && trim(this.postText) !== '';
        }

        constructor(props) {
            super(props);
            const {user, ui} = this.props;
            ui.selectFeed(user.userName);

            if (location.search.charAt(0) === '?') {
                const {title, url, comment, images} = qs.parse(location.search.substr(1));
                this.postText = `${title || ''} \u2014 ${url}`;
                this.commentText = trim(comment || '');
                this.commentOpened = (this.commentText !== '');
                (images || []).forEach(src => ui.addImage(src));
            }
        }

        submit = event => {
            event.preventDefault();

            const {ui} = this.props;
            const postText = trim(this.postText);
            const commentText = trim(this.commentText);
            const feeds = this.selectedTargets.map(t => t.userName);
            this.setPostError('');
            ui.setBlocking();
            api.bookmarklet(postText, ui.images.peek(), commentText, feeds)
                .then(addr => ui.setPostAddress(addr))
                .catch(err => this.setPostError(err.toString()))
                .finally(() => ui.setBlocking(false));
        };

        render() {
            const destCount = this.selectedTargets.length;
            const destPreviews = this.selectedTargets.map((f, i) => (
                <span key={f.userName}>{preSep(i, destCount)}{targetPreview(f)}</span>
            ));

            return (
                <div>
                    <UserBar />
                    { this.feedSelector }
                    <form onSubmit={this.submit} className={css.bmkForm}>
                        <p>
                            <span className="link" onClick={this.showSelector}>To</span>:{' '}
                            {destCount ? destPreviews : <em>nowhere</em>}
                        </p>
                        <p>
                            Message<br/>
                            <textarea
                                value={this.postText}
                                onChange={this.changePostText}
                                className={css.textArea + ' ' + css['-main']}
                                ref={focusIt}
                            />
                        </p>
                        <ImageList srcList={this.props.ui.images.slice()} remover={this.delImage}/>
                        {this.commentOpened ?
                            <p>
                                First comment (optional)<br />
                                <textarea
                                    value={this.commentText}
                                    onChange={this.changeCommentText}
                                    className={css.textArea}
                                    ref={focusIt}
                                />
                            </p>
                            :
                            <p>
                                <span className="link" onClick={this.openComment}>Add comment (optional)</span>
                            </p>
                        }
                        <div className="formErrorBlock">{this.postError}</div>
                        <p>
                            <button
                                type="button"
                                className="button -default"
                                disabled={!this.canPost}
                                onClick={this.submit}
                            >Share
                            </button>
                        </p>
                    </form>
                </div>
            );
        }

    }
);


function preSep(i, cnt) {
    if (i === 0) {
        return false;
    } else if (i === cnt - 1) {
        return ' and ';
    } else {
        return ', ';
    }
}

function targetPreview(tgt) {
    return <span className={css.targetPreview} title={'@' + tgt.userName}>
            <img src={tgt.avatar}/>
        {tgt.screenName}
        </span>;
}

function focusIt(input) {
    if (input) {
        input.focus();
    }
}