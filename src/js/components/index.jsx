import React, { Component } from "react";
import { inject, observer } from "mobx-react";

import AJAXIndicator from "./ajax-indicator";
import ShareForm from "./share-form";
import ViewPost from "./view-post";
import SVGIcon from "./svg-icon";
import ResizeTracker, { ELEMENT_RESIZE_EVENT } from "./resize-tracker";
import * as actions from "../lib/actions";
import { closePopup } from "./cancel-link";
import TokenForm from "./token-form";

@inject("user", "ui")
@observer
export default class extends Component {
  root = null;
  contentHeight = 0;

  onResized = () => {
    const height = this.root.offsetHeight;
    if (height === this.contentHeight) {
      return;
    }
    this.contentHeight = height;
    actions.send(window.parent, actions.POPUP_RESIZE, height);
  };

  setRoot = (el) => {
    if (el) {
      this.root = el;
      this.root.addEventListener(ELEMENT_RESIZE_EVENT, this.onResized);
      this.onResized(); // initial height
    } else {
      this.root.removeEventListener(ELEMENT_RESIZE_EVENT, this.onResized);
      this.root = null;
      this.contentHeight = 0;
    }
  };

  settingsClicked = () => {
    chrome.runtime.sendMessage({ action: "openSettings", data: null });
    closePopup();
  };

  render() {
    const { user, ui } = this.props;
    return (
      <div ref={this.setRoot}>
        <ResizeTracker>
          <AJAXIndicator />
          <div className={ui.isBlocking ? "ui-blocked" : ""}>
            {user.isAuthorized ? (
              ui.postAddress ? (
                <ViewPost />
              ) : (
                <ShareForm />
              )
            ) : (
              <TokenForm />
            )}
          </div>
          <div
            className="settings"
            title="Show settings"
            onClick={this.settingsClicked}
          >
            <SVGIcon id="settings" />
          </div>
        </ResizeTracker>
      </div>
    );
  }
}
