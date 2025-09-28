chrome.runtime.sendMessage({ action: "getDevMode" }, (response) => {
  const dev = response.devMode === true;
  console.log(dev, response.devMode);

  if(!dev) {
    // Your existing fetch logic here
    const rawHtml = document.documentElement.innerHTML;
    fetch("http://localhost:8000/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        html: rawHtml,
        requestedChecks: [
          "img_alt",
          "img_contrast",
          "page_contrast",
          "page_navigation",
          "page_skip_to_main",
        ],
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        data.forEach((n) => {
          console.log(n);
          const elem = document.querySelector(n.querySelector);
          if (!elem) return;
          if (n.querySelector != "body") {
            elem.outerHTML = n.replacementHTML;
          } else {
            elem.innerHTML = n.replacementHTML + elem.innerHTML;
          }
        });
      })
      .catch((error) => {
        console.error("Fetch failed:", error);
      });
  }
});
