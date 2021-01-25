import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { observable, action, computed } from "mobx";

import trim from "../lib/trim";

import CancelLink from "./cancel-link";

import css from "../../styles/modules/login-form.css";
import { API_ORIGIN } from "../lib/api";

const magicLink =
  API_ORIGIN +
  "/settings/app-tokens/create?title=Share%20on%20Freefeed%20Browser%20Extension&scopes=read-my-info%20manage-posts%20manage-profile";

export default inject("user")(
  observer(
    class extends Component {
      @observable token = "";
      @observable postError = "";

      @action changeToken = (event) => (this.token = event.target.value);
      @action setPostError = (error) => (this.postError = error);

      @computed get canPost() {
        return trim(this.token) !== "";
      }

      submit = (event) => {
        event.preventDefault();
        this.setPostError("");
        this.props.user
          .setToken(this.token)
          .catch((err) => this.setPostError(err.toString()));
      };

      render() {
        return (
          <div className={css.loginForm}>
            <form onSubmit={this.submit}>
              <p>
                Please{" "}
                <a href={magicLink} target="_blank">
                  create a FreeFeed access token
                </a>{" "}
                and enter it here:
              </p>
              <p>
                <textarea
                  name="token"
                  value={this.token}
                  onChange={this.changeToken}
                />
              </p>
              <div className="formErrorBlock">{this.postError}</div>
              <p>
                <button
                  type="submit"
                  className="button -default"
                  disabled={!this.canPost}
                >
                  Submit
                </button>{" "}
                or <CancelLink />
              </p>
            </form>
          </div>
        );
      }
    }
  )
);
