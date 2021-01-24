import * as actions from "./lib/actions";

chrome.browserAction.onClicked.addListener((tab) =>
  chrome.tabs.sendMessage(tab.id, {
    action: actions.POPUP_OPEN,
    data: null,
  })
);

chrome.contextMenus.onClicked.addListener((info, tab) => {
  const images =
    info.mediaType &&
    info.mediaType === "image" &&
    info.srcUrl &&
    /^https?:\/\//.test(info.srcUrl)
      ? [info.srcUrl]
      : null;
  chrome.tabs.sendMessage(tab.id, { action: actions.POPUP_OPEN, data: images });
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
