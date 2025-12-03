import React from 'react';
import { useAuthStore } from '../store/authStore';
import './Footer.css';

const Footer: React.FC = () => {
  const { user, syncStatus, lastSyncTime, syncError } = useAuthStore();

  if (!user) return null;

  const formatLastSync = () => {
    if (!lastSyncTime) return '';
    const seconds = Math.floor((Date.now() - lastSyncTime) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
  };

  return (
    <footer className="app-footer">
      <div className="footer-right">
        {syncStatus === 'syncing' && (
          <div className="footer-sync syncing" title="Syncing to GitHub...">
            <span className="sync-icon">↻</span>
            <span className="sync-text">Syncing...</span>
          </div>
        )}
        {syncStatus === 'synced' && lastSyncTime && (
          <div className="footer-sync synced" title={`Last synced ${formatLastSync()}`}>
            <span className="sync-icon">✓</span>
            <span className="sync-text">Synced {formatLastSync()}</span>
          </div>
        )}
        {syncStatus === 'error' && (
          <div className="footer-sync error" title={syncError || 'Sync failed'}>
            <span className="sync-icon">✗</span>
            <span className="sync-text">Sync failed</span>
          </div>
        )}
        {syncStatus === 'idle' && (
          <div className="footer-sync idle" title="Not synced yet">
            <span className="sync-icon">○</span>
            <span className="sync-text">Not synced</span>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
