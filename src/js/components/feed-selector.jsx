import React, { Component } from "react";
import { observer } from "mobx-react";
import { observable, action, toJS } from "mobx";
import classnames from "classnames";

import css from "../../styles/modules/feed-selector.css";

import SVGIcon from "./svg-icon";

export default observer(
  class extends Component {
    allTargets = [];
    @observable favorites = [];
    @observable selected = [];

    isFavored = (name) => this.favorites.indexOf(name) >= 0;
    isSelected = (name) => this.selected.indexOf(name) >= 0;

    constructor(props) {
      super(props);

      this.favorites = this.props.favorites;
      this.selected = this.props.selected;
      this.allTargets = this.props.allTargets.sort((a, b) => {
        if (a.isMyFeed && !b.isMyFeed) {
          return -1;
        } else if (!a.isMyFeed && b.isMyFeed) {
          return 1;
        }

        const [fa, fb] = [
          this.isFavored(a.userName),
          this.isFavored(b.userName),
        ];
        if (fa && !fb) {
          return -1;
        } else if (!fa && fb) {
          return 1;
        }

        if (a.userName < b.userName) {
          return -1;
        } else if (a.userName > b.userName) {
          return 1;
        }

        return 0;
      });
    }

    @action clickOn = (t) => () => {
      if (this.isSelected(t.userName)) {
        const p = this.selected.indexOf(t.userName);
        this.selected.splice(p, 1);
      } else {
        this.selected.push(t.userName);
      }
    };

    @action favOn = (t) => (event) => {
      event.stopPropagation();
      if (this.isFavored(t.userName)) {
        const p = this.favorites.indexOf(t.userName);
        this.favorites.splice(p, 1);
      } else {
        this.favorites.push(t.userName);
      }
    };

    done = () => {
      this.props.done(toJS(this.selected), toJS(this.favorites));
    };

    render() {
      return (
        <div className={css.feedSelector}>
          <div className={css.list}>
            {this.allTargets.map((t) => (
              <Item
                key={t.userName}
                target={t}
                isSelected={this.isSelected(t.userName)}
                isFavored={this.isFavored(t.userName)}
                onClick={this.clickOn(t)}
                onFav={this.favOn(t)}
              />
            ))}
          </div>
          <div className={css.btnBlock}>
            <button
              type="button"
              className="button -default -small"
              onClick={this.done}
            >
              Done
            </button>
          </div>
        </div>
      );
    }
  }
);

class Item extends Component {
  render() {
    const {
      target: { userName, screenName, avatar, isMyFeed },
      isFavored,
      isSelected,
    } = this.props;
    const className = classnames({
      [css.feed]: true,
      [css.isSelected]: isSelected,
      [css.isFavored]: isFavored,
    });

    return (
      <div className={className} onClick={this.props.onClick}>
        <div className={css.avatar}>
          <img src={avatar} />
        </div>
        <div className={css.texts}>
          <div className={css.screenName}>{screenName}</div>
          <div className={css.userName}>{userName}</div>
        </div>
        <div
          className={css.fav}
          onClick={this.props.onFav}
          hidden={isMyFeed}
          title="Fave group to place it on top"
        >
          <SVGIcon id={isFavored ? "filled" : "outlined"} />
        </div>
      </div>
    );
  }
}
