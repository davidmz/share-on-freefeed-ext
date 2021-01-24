import React, { Component } from "react";
import { Provider } from "mobx-react";

import user from "../state/user";
import ui from "../state/ui";

import Index from "./index";

export default class extends Component {
  render() {
    return (
      <Provider ui={ui} user={user}>
        <Index />
      </Provider>
    );
  }
}
