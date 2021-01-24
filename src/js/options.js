const selectionPlacementKey = "selectionPlacement";

chrome.storage.sync.get(null, ({ [selectionPlacementKey]: mode }) => {
  if (mode !== "comment") {
    mode = "post";
  }
  document.querySelector(`input[value="${mode}"]`).checked = true;
});

document.body.addEventListener("change", ({ target }) => {
  if (target.name === "selection-placement" && target.checked) {
    chrome.storage.sync.set({ [selectionPlacementKey]: target.value });
  }
});
