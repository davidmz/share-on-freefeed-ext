import * as actions from "./lib/actions";

function openPopup(tab, data = null) {
  chrome.tabs.executeScript(tab.id, { file: "content-script.js" }, () =>
    chrome.tabs.sendMessage(tab.id, { action: actions.POPUP_OPEN, data })
  );
}

chrome.browserAction.onClicked.addListener((tab) => openPopup(tab));

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const images =
    info.mediaType &&
    info.mediaType === "image" &&
    info.srcUrl &&
    /^https?:\/\//.test(info.srcUrl)
      ? [info.srcUrl]
      : null;
  openPopup(tab, images);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "page",
    title: "Share page on Freefeed",
    contexts: ["page"],
  });
  chrome.contextMenus.create({
    id: "selection",
    title: 'Share "%s" on Freefeed',
    contexts: ["selection"],
  });
  chrome.contextMenus.create({
    id: "image",
    title: "Share image on Freefeed",
    contexts: ["image"],
  });
});

chrome.runtime.onMessage.addListener(({ action, data }, sender, response) => {
  if (action === "openSettings") {
    chrome.runtime.openOptionsPage();
  }
});
