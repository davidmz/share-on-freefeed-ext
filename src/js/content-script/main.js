import Popup from "./iframe";
import ImageFrame from "./image-frame";
import * as actions from "../lib/actions";

if (!window.__shareOnFreeFeedExt) {
  window.__shareOnFreeFeedExt = true;

  {
    // подключение CSS с учётом возможного отсутствия HEAD у документа (например, в PDF-вьювере)
    if (!document.head && document.getElementsByTagName("head").length === 0) {
      document.documentElement.insertBefore(
        document.createElement("head"),
        document.documentElement.firstChild
      );
    }
    require("../../styles/content-script.css");
  }

  const popup = new Popup();
  const imageFrame = new ImageFrame();

  imageFrame.onClick = (src) => popup.addImage(src);

  chrome.runtime.onMessage.addListener(({ action, data }) => {
    if (action === actions.POPUP_OPEN) {
      popup.show(data);
    }
  });

  window.addEventListener("message", ({ origin, data: { action, data } }) => {
    if (origin !== popup.origin) {
      return;
    }
    if (action === actions.POPUP_RESIZE) {
      popup.setHeight(data);
    }
    if (action === actions.POPUP_CLOSE) {
      popup.hide();
      document.body.classList.remove("share-on-freefeed-with-iframe");
    }
    if (action === actions.POPUP_DRAG_START) {
      popup.onDragStart(data);
    }
    if (action === actions.POPUP_DRAG) {
      popup.onDrag(data);
    }
    if (action === actions.FORM_IS_VISIBLE) {
      document.body.classList.toggle("share-on-freefeed-with-iframe", data);
    }
  });
}
