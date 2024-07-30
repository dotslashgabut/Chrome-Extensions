chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: "getPageUrl" });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "setPageUrl") {
    chrome.storage.local.set({ currentUrl: request.url });
  }
});