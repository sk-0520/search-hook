
browser.webRequest.onBeforeRequest.addListener(
    requestGoogle,
    {
        urls: [
            "*://www.google.com/*",
            "*://google.com/*",
        ]
    }
);

function requestGoogle(requestDetails) {
    console.log("Loading: " + requestDetails.url);
}


