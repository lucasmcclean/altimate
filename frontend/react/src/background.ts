chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background script received message:", request);
  if (request.action === "getDevMode") {
    chrome.storage.local.get('devMode', (result) => {
      const devMode = result.devMode === true;
      console.log("Background script sending response:", { devMode: devMode });
      sendResponse({ devMode: devMode });
    });
    return true; // Indicate that sendResponse will be called asynchronously
  }
});
