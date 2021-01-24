import React, { Component } from "react";
import { inject, observer } from "mobx-react";
import { observable, action, computed } from "mobx";

import trim from "../lib/trim";

import CancelLink from "./cancel-link";

import css from "../../styles/modules/login-form.css";

export default inject("user")(
  observer(
    class extends Component {
      @observable userName = "";
      @observable password = "";
      @observable remember = true;
      @observable postError = "";

      @action changeUserName = (event) => (this.userName = event.target.value);
      @action changePassword = (event) => (this.password = event.target.value);
      @action changeRemember = (event) =>
        (this.remember = event.target.checked);
      @action setPostError = (error) => (this.postError = error);

      @computed get canPost() {
        return trim(this.userName) !== "" && trim(this.password) !== "";
      }

      submit = (event) => {
        event.preventDefault();
        this.setPostError("");
        this.props.user
          .signIn(this.userName, this.password, this.remember)
          .catch((err) => this.setPostError(err.toString()));
      };

      render() {
        return (
          <div className={css.loginForm}>
            <form onSubmit={this.submit}>
              <p>Please sign in using your Freefeed.net login and password:</p>
              <p>
                Username
                <br />
                <input
                  type="text"
                  name="username"
                  value={this.userName}
                  onChange={this.changeUserName}
                />
              </p>
              <p>
                Password
                <br />
                <input
                  type="password"
                  name="password"
                  value={this.password}
                  onChange={this.changePassword}
                />
              </p>
              <p>
                <label>
                  <input
                    type="checkbox"
                    checked={this.remember}
                    onChange={this.changeRemember}
                  />{" "}
                  remember me
                </label>
              </p>
              <div className="formErrorBlock">{this.postError}</div>
              <p>
                <button
                  type="submit"
                  className="button -default"
                  disabled={!this.canPost}
                >
                  Sign In
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
