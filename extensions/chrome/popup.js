// Popup script for Chrome extension
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    setupEventListeners();
});

function loadSettings() {
    chrome.runtime.sendMessage({ action: 'getSettings' }, (settings) => {
        if (settings && settings.widgets) {
            Object.keys(settings.widgets).forEach(widget => {
                const toggle = document.querySelector(`[data-widget="${widget}"]`);
                if (toggle) {
                    toggle.classList.toggle('active', settings.widgets[widget]);
                }
            });
        }
    });
}

function setupEventListeners() {
    // Widget toggles
    document.querySelectorAll('.toggle').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const widget = this.dataset.widget;
            const isActive = this.classList.contains('active');
            
            this.classList.toggle('active');
            
            // Save setting
            chrome.runtime.sendMessage({ action: 'getSettings' }, (settings) => {
                const updatedSettings = settings || { widgets: {} };
                if (!updatedSettings.widgets) updatedSettings.widgets = {};
                
                updatedSettings.widgets[widget] = !isActive;
                
                chrome.runtime.sendMessage({
                    action: 'saveSettings',
                    settings: updatedSettings
                }, (response) => {
                    if (response.success) {
                        // Notify all Personal Portal tabs to update
                        chrome.tabs.query({}, (tabs) => {
                            tabs.forEach(tab => {
                                if (tab.url && (tab.url.includes('chrome-extension://') || tab.url.includes('github.io'))) {
                                    chrome.tabs.sendMessage(tab.id, {
                                        action: 'settingsUpdated',
                                        settings: updatedSettings
                                    }).catch(() => {
                                        // Ignore errors for tabs that don't have content script
                                    });
                                }
                            });
                        });
                    }
                });
            });
        });
    });
    
    // Open Portal button
    document.getElementById('openPortal').addEventListener('click', function() {
        chrome.tabs.create({
            url: chrome.runtime.getURL('index.html')
        });
        window.close();
    });
    
    // Reset settings button
    document.getElementById('resetSettings').addEventListener('click', function() {
        const defaultSettings = {
            widgets: {
                clock: true,
                search: true,
                weather: false,
                spotify: false,
                notes: false
            },
            theme: 'dark',
            version: '1.0.0'
        };
        
        chrome.runtime.sendMessage({
            action: 'saveSettings',
            settings: defaultSettings
        }, (response) => {
            if (response.success) {
                loadSettings();
                
                // Notify all Personal Portal tabs to update
                chrome.tabs.query({}, (tabs) => {
                    tabs.forEach(tab => {
                        if (tab.url && (tab.url.includes('chrome-extension://') || tab.url.includes('github.io'))) {
                            chrome.tabs.sendMessage(tab.id, {
                                action: 'settingsUpdated',
                                settings: defaultSettings
                            }).catch(() => {
                                // Ignore errors for tabs that don't have content script
                            });
                        }
                    });
                });
            }
        });
    });
}