import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import * as actions from "../lib/actions";

export default inject("user")(
  observer(
    class extends Component {
      render() {
        return (
          <span className="link" onClick={closePopup}>
            {this.props.title ? this.props.title : "cancel"}
          </span>
        );
      }
    }
  )
);

export function closePopup() {
  actions.send(window.parent, actions.POPUP_CLOSE);
}
