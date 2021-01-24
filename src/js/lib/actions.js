export const POPUP_RESIZE = "POPUP_RESIZE";
export const POPUP_OPEN = "POPUP_OPEN";
export const POPUP_CLOSE = "POPUP_CLOSE";
export const POPUP_DRAG = "POPUP_DRAG";
export const POPUP_DRAG_START = "POPUP_DRAG_START";
export const ADD_IMAGE = "ADD_IMAGE";
export const FORM_IS_VISIBLE = "FORM_IS_VISIBLE";
export const WITH_SCROLLING = "WITH_SCROLLING";

export function send(win, action, data = null) {
  win.postMessage({ action, data }, "*");
}
