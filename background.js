browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "save") {
    browser.storage.local.set({ "clippySettings": request.data });
  } else if (request.action === "get") {
    return browser.storage.local.get("clippySettings");
  }
});
