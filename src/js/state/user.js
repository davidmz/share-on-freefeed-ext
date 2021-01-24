import { observable, computed, action, toJS } from "mobx";
import ui from "./ui";
import * as api from "../lib/api";

const defaultAvatar = chrome.runtime.getURL("images/default-userpic.png");

const lsUserKey = "user";
const frontPrefsKey = "me.davidmz.ShareExt";

let isRemembered = false;
let prefsToSave = false;
let prefsSaveInProgress = false;

class State {
  @observable id = "";
  @observable userName = "";
  @observable avatar = "";
  @observable token = "";
  @observable targets = [];
  @observable favorites = [];

  @computed get isAuthorized() {
    return this.id !== "";
  }

  constructor() {
    try {
      const saved = JSON.parse(localStorage.getItem(lsUserKey));
      const s = toJS(this);
      for (let k in s) {
        if (s.hasOwnProperty(k) && saved.hasOwnProperty(k)) {
          this[k] = saved[k];
        }
      }
      isRemembered = true;

      setTimeout(() => {
        api
          .whoami()
          .then((resp) => {
            if (this.isAuthorized) {
              // user may log out during request
              this.rcvWhoamiResponse(resp);
              localStorage.setItem(lsUserKey, JSON.stringify(toJS(this)));
            }
          })
          .catch((err) => this.logout());
      }, 0);
    } catch (e) {}
  }

  @action logout() {
    this.id = "";
    this.token = "";
    this.userName = "";
    this.avatar = "";
    this.targets = [];
    isRemembered = false;
    localStorage.removeItem(lsUserKey);
    ui.logout();
  }

  @action updateFavorites(favorites) {
    this.favorites = favorites;
    this.saveFrontPrefs();
    if (isRemembered) {
      localStorage.setItem(lsUserKey, JSON.stringify(toJS(this)));
    }
  }

  saveFrontPrefs() {
    if (prefsSaveInProgress) {
      prefsToSave = true;
    } else {
      prefsSaveInProgress = true;
      prefsToSave = false;
      api
        .saveFrontPrefs(frontPrefsKey, { favorites: toJS(this.favorites) })
        .finally(() => {
          prefsSaveInProgress = false;
          if (prefsToSave) {
            this.saveFrontPrefs();
          }
        });
    }
  }

  signIn(userName, password, remember) {
    ui.setBlocking();
    return api
      .startSession(userName, password)
      .then((resp) => {
        this.rcvSessionResponse(resp);
        return api.whoami();
      })
      .then((resp) => {
        this.rcvWhoamiResponse(resp);
      })
      .then(() => {
        isRemembered = remember;
        if (isRemembered) {
          localStorage.setItem(lsUserKey, JSON.stringify(toJS(this)));
        }
      })
      .finally(() => ui.setBlocking(false));
  }

  @action rcvSessionResponse({ authToken }) {
    this.token = authToken;
  }

  @action rcvWhoamiResponse({ users, subscribers }) {
    this.id = users.id;
    this.userName = users.username;
    this.avatar = users.profilePictureMediumUrl || defaultAvatar;

    this.targets = subscribers
      .filter((u) => u.type === "group")
      .filter(
        (g) =>
          g.isRestricted === "0" ||
          (g.administrators || []).indexOf(this.id) >= 0
      )
      .map(({ username, screenName, profilePictureMediumUrl }) => ({
        userName: username,
        screenName,
        avatar: profilePictureMediumUrl || defaultAvatar,
        isMyFeed: false,
      }));

    this.targets.unshift({
      userName: this.userName,
      screenName: "Your feed",
      avatar: this.avatar,
      isMyFeed: true,
    });

    const frontPrefs = users.frontendPreferences;
    if (frontPrefsKey in frontPrefs) {
      this.favorites = frontPrefs[frontPrefsKey]["favorites"];
    }
  }
}

export default new State();
