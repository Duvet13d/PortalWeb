// Background script for Chrome extension
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings on first install
    chrome.storage.sync.set({
      'personal-portal-settings': {
        widgets: {
          clock: true,
          search: true,
          weather: false,
          spotify: false,
          notes: false
        },
        theme: 'dark',
        version: '1.0.0'
      }
    });
    
    // Open welcome page
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  } else if (details.reason === 'update') {
    // Handle updates
    checkForUpdates(details.previousVersion);
  }
});

// Check for updates and migrate settings if needed
function checkForUpdates(previousVersion) {
  chrome.storage.sync.get(['personal-portal-settings'], (result) => {
    const settings = result['personal-portal-settings'] || {};
    
    // Version-specific migrations
    if (compareVersions(previousVersion, '1.0.0') < 0) {
      // Migration logic for future updates
      settings.version = '1.0.0';
      chrome.storage.sync.set({ 'personal-portal-settings': settings });
    }
  });
}

// Simple version comparison
function compareVersions(a, b) {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);
  
  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;
    
    if (aPart < bPart) return -1;
    if (aPart > bPart) return 1;
  }
  
  return 0;
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open settings popup or new tab with Personal Portal
  chrome.tabs.create({
    url: chrome.runtime.getURL('index.html')
  });
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['personal-portal-settings'], (result) => {
      sendResponse(result['personal-portal-settings'] || {});
    });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set({
      'personal-portal-settings': request.settings
    }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Periodic update check (every 24 hours)
chrome.alarms.create('updateCheck', { periodInMinutes: 1440 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'updateCheck') {
    // Check for updates from GitHub releases
    fetch('https://api.github.com/repos/yourusername/PortalWeb/releases/latest')
      .then(response => response.json())
      .then(data => {
        const latestVersion = data.tag_name.replace('v', '');
        const currentVersion = chrome.runtime.getManifest().version;
        
        if (compareVersions(currentVersion, latestVersion) < 0) {
          // Show update notification
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon-48.png',
            title: 'Personal Portal Update Available',
            message: `Version ${latestVersion} is now available. Visit the Chrome Web Store to update.`
          });
        }
      })
      .catch(error => {
        console.log('Update check failed:', error);
      });
  }
});