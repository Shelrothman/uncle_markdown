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
  const { octokit, user, repoName, setSyncStatus, setLastSyncTime } = useAuthStore();
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const filesRef = useRef(files);

  // Update ref when files change
  useEffect(() => {
    filesRef.current = files;
  }, [files]);

  useEffect(() => {
    // Only auto-sync if user is authenticated
    if (!octokit || !user || !repoName) {
      return;
    }

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Set new timeout for sync
    syncTimeoutRef.current = setTimeout(async () => {
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
      }
    };
  }, [files, octokit, user, repoName, setSyncStatus, setLastSyncTime]);
}
