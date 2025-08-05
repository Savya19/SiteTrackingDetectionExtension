// Advanced tracker detection background script
// Load the Disconnect tracker list (services.json) at startup
let TRACKER_MAP = {};

async function loadTrackerList() {
  // For development, include services.json in the extension and fetch it locally
  const response = await fetch(chrome.runtime.getURL('services.json'));
  const data = await response.json();
  // Flatten the tracker list: { domain: { category, name, company } }
  for (const [category, trackers] of Object.entries(data)) {
    for (const [name, info] of Object.entries(trackers)) {
      if (info.domains) {
        info.domains.forEach(domain => {
          TRACKER_MAP[domain] = {
            category,
            name,
            company: info.displayName || name
          };
        });
      }
    }
  }
}

loadTrackerList();

// Helper to get the root domain from a hostname
function getRootDomain(hostname) {
  const parts = hostname.split('.');
  return parts.slice(-2).join('.');
}

// Listen for web requests and detect trackers
chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
    const url = new URL(details.url);
    const domain = url.hostname;
    // Check for exact or subdomain match
    let trackerInfo = null;
    if (TRACKER_MAP[domain]) {
      trackerInfo = TRACKER_MAP[domain];
    } else {
      // Try matching parent domains
      const root = getRootDomain(domain);
      if (TRACKER_MAP[root]) trackerInfo = TRACKER_MAP[root];
    }
    if (trackerInfo && details.tabId >= 0) {
      chrome.tabs.get(details.tabId, (tab) => {
        if (chrome.runtime.lastError || !tab || !tab.url) return;
        const origin = new URL(tab.url).origin;
        // Update storage: per-site and global
        chrome.storage.local.get(['siteTrackers', 'globalTrackers'], (data) => {
          const siteTrackers = data.siteTrackers || {};
          const globalTrackers = data.globalTrackers || {};
          // Per-site
          if (!siteTrackers[origin]) siteTrackers[origin] = {};
          const key = domain;
          if (!siteTrackers[origin][key]) {
            siteTrackers[origin][key] = { ...trackerInfo, count: 0 };
          }
          siteTrackers[origin][key].count++;
          // Global
          if (!globalTrackers[key]) {
            globalTrackers[key] = { ...trackerInfo, count: 0 };
          }
          globalTrackers[key].count++;
          chrome.storage.local.set({ siteTrackers, globalTrackers });
        });
      });
    }
  },
  { urls: ["<all_urls>"] },
  []
);

// Listen for popup requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'get_trackers' && request.origin) {
    chrome.storage.local.get(['siteTrackers'], (data) => {
      const trackers = data.siteTrackers && data.siteTrackers[request.origin]
        ? data.siteTrackers[request.origin]
        : {};
      sendResponse({ trackers });
    });
    return true;
  } else if (request.action === 'get_global_trackers') {
    chrome.storage.local.get(['globalTrackers'], (data) => {
      sendResponse({ trackers: data.globalTrackers || {} });
    });
    return true;
  } else if (request.action === 'clear_history') {
    chrome.storage.local.set({ siteTrackers: {}, globalTrackers: {} }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
