import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import updateChecker from '../utils/updateChecker';

const UpdateNotification = () => {
  const [updateData, setUpdateData] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Check for updates on component mount
    const checkUpdates = async () => {
      await updateChecker.checkForUpdates();
      const notificationData = updateChecker.getUpdateNotificationData();
      
      if (notificationData) {
        setUpdateData(notificationData);
        setIsVisible(true);
      }
    };

    checkUpdates();

    // Set up periodic checks
    const interval = setInterval(checkUpdates, 60 * 60 * 1000); // Check every hour

    return () => clearInterval(interval);
  }, []);

  const handleDismiss = () => {
    updateChecker.dismissUpdate();
    setIsVisible(false);
  };

  const handleUpdate = () => {
    if (updateData?.releaseUrl) {
      window.open(updateData.releaseUrl, '_blank');
    } else {
      // Fallback to refresh for web app
      updateChecker.refreshApplication();
    }
  };

  const handleRefresh = () => {
    updateChecker.refreshApplication();
  };

  if (!updateData || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-4 right-4 z-50 max-w-sm"
      >
        <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-lg shadow-lg border border-red-400/30">
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <h3 className="font-semibold text-sm">Update Available</h3>
              </div>
              <button
                onClick={handleDismiss}
                className="text-white/80 hover:text-white transition-colors"
                aria-label="Dismiss notification"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <p className="text-sm mt-2 text-white/90">
              Version {updateData.latestVersion} is now available
            </p>
            
            <div className="flex items-center space-x-2 mt-3">
              <button
                onClick={handleUpdate}
                className="bg-white text-red-600 px-3 py-1 rounded text-xs font-medium hover:bg-gray-100 transition-colors"
              >
                View Release
              </button>
              <button
                onClick={handleRefresh}
                className="bg-white/20 text-white px-3 py-1 rounded text-xs font-medium hover:bg-white/30 transition-colors"
              >
                Refresh Now
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-white/80 hover:text-white transition-colors text-xs"
              >
                {isExpanded ? 'Less' : 'Details'}
              </button>
            </div>
          </div>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-white/20 p-4 bg-black/20"
              >
                <div className="text-xs space-y-2">
                  <div>
                    <span className="text-white/70">Current:</span> v{updateData.currentVersion}
                  </div>
                  <div>
                    <span className="text-white/70">Latest:</span> v{updateData.latestVersion}
                  </div>
                  <div>
                    <span className="text-white/70">Released:</span> {updateData.publishedAt}
                  </div>
                  {updateData.releaseNotes && (
                    <div>
                      <span className="text-white/70">Changes:</span>
                      <div className="mt-1 text-white/80 text-xs max-h-20 overflow-y-auto">
                        {updateData.releaseNotes.split('\n').slice(0, 3).map((line, index) => (
                          <div key={index}>{line}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UpdateNotification;