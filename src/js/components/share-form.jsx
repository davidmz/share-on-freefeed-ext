import React, {Component} from 'react';
import {findDOMNode} from 'react-dom';
import {inject, observer} from 'mobx-react';
import {observable, action, computed} from 'mobx';
import qs from 'qs';
import xor from 'lodash.xor';
import uniq from 'lodash.uniq';
import Textarea from 'react-textarea-autosize';

import trim from '../lib/trim';
import * as api from '../lib/api';

import UserBar from './user-bar';
import FeedSelector from './feed-selector';
import ImageList from './image-list';

import css from '../../styles/modules/share-form.css';

export default inject('user', 'ui')(observer(
    class extends Component {
        @observable postText = '';
        @observable commentText = '';
        @observable commentOpened = false;
        @observable feedSelector = false;
        @observable postError = '';

        @action changePostText = event => this.postText = event.target.value;
        @action changeCommentText = event => this.commentText = event.target.value;
        @action setPostError = error => this.postError = error;
        @action openComment = () => {
            this.commentOpened = true;
            setTimeout(() => focusOn(this.commentInput), 0);
        };

        bodyInput = null;
        commentInput = null;

        setBodyInput = el => this.bodyInput = el;
        setCommentInput = el => this.commentInput = el;

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

        componentDidMount() {
            focusOn(this.bodyInput);
        }

        constructor(props) {
            super(props);
            const {user, ui} = this.props;
            ui.selectFeed(user.userName);

            if (location.search.charAt(0) === '?') {
                const {title, url, selection, images} = qs.parse(location.search.substr(1));
                (images || []).forEach(src => ui.addImage(src));

                let postText = url;
                if (title) {
                    postText = `${title} \u2014 ${postText}`;
                }
                if (selection) {
                    if (ui.settings.selectionPlacement === 'post') {
                        const quote = /[\u0400-\u04ff]/.test(selection) ? `\u00AB${selection}\u00BB` : `\u201C${selection}\u201D`;
                        postText = `${quote}\n\n${postText}`;
                    } else {
                        this.commentText = selection;
                        this.commentOpened = true;
                    }
                }
                this.postText = postText;
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
                            <Textarea
                                value={this.postText}
                                onChange={this.changePostText}
                                minRows={4}
                                maxRows={10}
                                className={css.textArea + ' ' + css['-main']}
                                ref={this.setBodyInput}
                            />
                        </p>
                        <ImageList srcList={this.props.ui.images.slice()} remover={this.delImage}/>
                        {this.commentOpened ?
                            <p>
                                First comment (optional)<br />
                                <Textarea
                                    value={this.commentText}
                                    onChange={this.changeCommentText}
                                    minRows={3}
                                    maxRows={6}
                                    className={css.textArea}
                                    ref={this.setCommentInput}
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
));


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

function focusOn(input) {
    if (input) {
        const el = (input instanceof Component) ? findDOMNode(input) : input;
        el.focus();
        el.setSelectionRange(0, 0);
        el.scrollTop = 0;
    }
}