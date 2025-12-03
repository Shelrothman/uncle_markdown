import { useEffect, useRef } from 'react';
import { useFileStore } from '../store/fileStore';
import { useAuthStore } from '../store/authStore';
import { triggerSync } from '../utils/githubSync';

const SYNC_DELAY = 10000; // 10 seconds

/**
 * Hook that automatically syncs files to GitHub after changes
 */
export function useAutoSync() {
  const files = useFileStore((state) => state.files);
  const { getOctokit, user, repoName, setSyncStatus, setLastSyncTime, setAutoSyncPending } = useAuthStore();
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filesRef = useRef(files);

  // Update ref when files change
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    const octokit = getOctokit();
    
    // Only auto-sync if user is authenticated
    if (!octokit || !user || !repoName) {
      setAutoSyncPending(false);
      return;
    }

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Set pending flag
    setAutoSyncPending(true);

    // Set new timeout for sync
    syncTimeoutRef.current = setTimeout(async () => {
      setAutoSyncPending(false);
      setSyncStatus('syncing');
      
      const result = await triggerSync(octokit, user, repoName, filesRef.current);
      
      if (result.success) {
        setSyncStatus('synced');
        setLastSyncTime(Date.now());
      } else {
        setSyncStatus('error', result.error);
      }
    }, SYNC_DELAY);

    // Cleanup on unmount
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        setAutoSyncPending(false);
      }
    };
  }, [files, getOctokit, user, repoName, setSyncStatus, setLastSyncTime, setAutoSyncPending]);
}
