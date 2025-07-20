// Popup script for Firefox extension
document.addEventListener('DOMContentLoaded', function() {
    loadSettings();
    setupEventListeners();
});

function loadSettings() {
    browser.runtime.sendMessage({ action: 'getSettings' }).then((settings) => {
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
            browser.runtime.sendMessage({ action: 'getSettings' }).then((settings) => {
                const updatedSettings = settings || { widgets: {} };
                if (!updatedSettings.widgets) updatedSettings.widgets = {};
                
                updatedSettings.widgets[widget] = !isActive;
                
                return browser.runtime.sendMessage({
                    action: 'saveSettings',
                    settings: updatedSettings
                });
            }).then((response) => {
                if (response.success) {
                    // Notify all Personal Portal tabs to update
                    browser.tabs.query({}).then((tabs) => {
                        tabs.forEach(tab => {
                            if (tab.url && (tab.url.includes('moz-extension://') || tab.url.includes('github.io'))) {
                                browser.tabs.sendMessage(tab.id, {
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
    
    // Open Portal button
    document.getElementById('openPortal').addEventListener('click', function() {
        browser.tabs.create({
            url: browser.runtime.getURL('index.html')
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
        
        browser.runtime.sendMessage({
            action: 'saveSettings',
            settings: defaultSettings
        }).then((response) => {
            if (response.success) {
                loadSettings();
                
                // Notify all Personal Portal tabs to update
                browser.tabs.query({}).then((tabs) => {
                    tabs.forEach(tab => {
                        if (tab.url && (tab.url.includes('moz-extension://') || tab.url.includes('github.io'))) {
                            browser.tabs.sendMessage(tab.id, {
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