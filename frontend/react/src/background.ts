chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "MAKE_ACCESSIBLE") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
          if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError.message);
          } else {
            sendResponse(response);
          }
        });
      }
    });
  }
  return true;
});
