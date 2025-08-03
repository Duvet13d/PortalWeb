// Update checker utility for Personal Portal
class UpdateChecker {
  constructor() {
    this.currentVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';
    this.githubRepo = import.meta.env.VITE_GITHUB_REPO || 'yourusername/PortalWeb';
    this.checkInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    this.lastCheckKey = 'personal-portal-last-update-check';
    this.updateAvailableKey = 'personal-portal-update-available';
  }

  // Check if an update is available
  async checkForUpdates(force = false) {
    try {
      // Skip if no valid GitHub repo is configured
      if (!this.githubRepo || this.githubRepo === 'yourusername/PortalWeb') {
        return {
          available: false,
          error: 'GitHub repository not configured',
          lastChecked: Date.now()
        };
      }

      const lastCheck = localStorage.getItem(this.lastCheckKey);
      const now = Date.now();
      
      // Skip check if not forced and checked recently
      if (!force && lastCheck && (now - parseInt(lastCheck)) < this.checkInterval) {
        return this.getStoredUpdateInfo();
      }

      // Fetch latest release from GitHub API
      const response = await fetch(`https://api.github.com/repos/${this.githubRepo}/releases/latest`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const releaseData = await response.json();
      const latestVersion = releaseData.tag_name.replace(/^v/, ''); // Remove 'v' prefix if present
      
      // Store last check time
      localStorage.setItem(this.lastCheckKey, now.toString());
      
      // Compare versions
      const updateAvailable = this.compareVersions(this.currentVersion, latestVersion) < 0;
      
      const updateInfo = {
        available: updateAvailable,
        currentVersion: this.currentVersion,
        latestVersion: latestVersion,
        releaseUrl: releaseData.html_url,
        releaseNotes: releaseData.body,
        publishedAt: releaseData.published_at,
        lastChecked: now
      };
      
      // Store update info
      localStorage.setItem(this.updateAvailableKey, JSON.stringify(updateInfo));
      
      return updateInfo;
    } catch (error) {
      console.warn('Update check failed:', error);
      return {
        available: false,
        error: error.message,
        lastChecked: Date.now()
      };
    }
  }

  // Get stored update information
  getStoredUpdateInfo() {
    try {
      const stored = localStorage.getItem(this.updateAvailableKey);
      return stored ? JSON.parse(stored) : { available: false };
    } catch (error) {
      console.warn('Failed to parse stored update info:', error);
      return { available: false };
    }
  }

  // Compare two version strings (returns -1, 0, or 1)
  compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }
    
    return 0;
  }

  // Initialize automatic update checking
  initAutoCheck() {
    // Check on page load
    this.checkForUpdates();
    
    // Set up periodic checking
    setInterval(() => {
      this.checkForUpdates();
    }, this.checkInterval);
    
    // Check when page becomes visible (user returns to tab)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        const lastCheck = localStorage.getItem(this.lastCheckKey);
        const now = Date.now();
        
        // Check if it's been more than 6 hours since last check
        if (!lastCheck || (now - parseInt(lastCheck)) > (6 * 60 * 60 * 1000)) {
          this.checkForUpdates();
        }
      }
    });
  }

  // Clear update notification
  dismissUpdate() {
    const updateInfo = this.getStoredUpdateInfo();
    updateInfo.dismissed = true;
    updateInfo.dismissedAt = Date.now();
    localStorage.setItem(this.updateAvailableKey, JSON.stringify(updateInfo));
  }

  // Check if update notification should be shown
  shouldShowUpdateNotification() {
    const updateInfo = this.getStoredUpdateInfo();
    
    if (!updateInfo.available) return false;
    if (updateInfo.dismissed) {
      // Show again after 7 days
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      return updateInfo.dismissedAt < weekAgo;
    }
    
    return true;
  }

  // Get update notification data for UI
  getUpdateNotificationData() {
    const updateInfo = this.getStoredUpdateInfo();
    
    if (!this.shouldShowUpdateNotification()) return null;
    
    return {
      message: `Personal Portal v${updateInfo.latestVersion} is available!`,
      currentVersion: updateInfo.currentVersion,
      latestVersion: updateInfo.latestVersion,
      releaseUrl: updateInfo.releaseUrl,
      releaseNotes: updateInfo.releaseNotes,
      publishedAt: new Date(updateInfo.publishedAt).toLocaleDateString()
    };
  }

  // Force refresh the application (for web apps)
  async refreshApplication() {
    try {
      // Clear caches if service worker is available
      if ('serviceWorker' in navigator && 'caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      // Reload the page
      window.location.reload(true);
    } catch (error) {
      console.warn('Failed to refresh application:', error);
      // Fallback to simple reload
      window.location.reload();
    }
  }
}

// Create singleton instance
const updateChecker = new UpdateChecker();

export default updateChecker;