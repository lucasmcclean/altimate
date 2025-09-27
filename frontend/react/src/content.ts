chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "MAKE_ACCESSIBLE") {
    const rawHtml = document.body.innerHTML;
    fetch('http://localhost:8000/debug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        html: rawHtml,
        requested_checks: request.accesibilityArr
      })
    })
    .then(response => response.json())
    .then(data => {
      sendResponse(data);
    })
    .catch(error => {
      console.error('Fetch failed:', error);
      sendResponse({ error: error.message });
    });
  }
  return true;
});
