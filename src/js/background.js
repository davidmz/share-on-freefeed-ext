chrome.browserAction.onClicked.addListener(tab => chrome.tabs.sendMessage(tab.id, {action: 'TOGGLE', data: null}));

chrome.contextMenus.onClicked.addListener((info, tab) => {
    const images = (info.mediaType && info.mediaType === 'image' && info.srcUrl && /^https?:\/\//.test(info.srcUrl)) ? [info.srcUrl] : null;
    chrome.tabs.sendMessage(tab.id, {action: 'OPEN', data: {images}})
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({id: "page", title: "Share page on Freefeed", contexts: ["page"]});
    chrome.contextMenus.create({id: "selection", title: "Share \"%s\" on Freefeed", contexts: ["selection"]});
    chrome.contextMenus.create({id: "image", title: "Share image on Freefeed", contexts: ["image"]});
});

const notificationId = 'frf'

chrome.omnibox.onInputEntered.addListener(postText => {
  const localUser = JSON.parse(localStorage.getItem('user'));
  if (!localUser) {
    chrome.notifications.create(notificationId, {
      type:'basic',
      iconUrl: 'images/icon128.png',
      title: 'freefeed',
      message: 'Log in with extension to send messages to your feed'
    })
    return ;
  }

  chrome.notifications.create(notificationId, {
    type:'basic',
    iconUrl: 'images/icon128.png',
    title: 'freefeed',
    message: 'Sending message to your feed'
  })

  return fetch('https://freefeed.net/v1/bookmarklet', {
        mode: 'cors',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Authentication-Token': localUser.token,
        },
        method: 'POST',
        body: JSON.stringify({title: postText, meta: {feeds: [localUser.userName]}})
    })
      .then(_ => chrome.notifications.update(notificationId, {message: 'Successfully sent'}))
      .catch(_ => chrome.notifications.update(notificationId, {message: 'Error occured!'}));
    setTimeout(_ => chrome.notifications.clear(notificationId), 5000);
})