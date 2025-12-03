import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Octokit } from '@octokit/rest';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string;
  email: string;
}

interface AuthStore {
  accessToken: string | null;
  user: GitHubUser | null;
  octokit: Octokit | null;
  repoName: string | null;
  syncStatus: SyncStatus;
  lastSyncTime: number | null;
  syncError: string | null;
  
  setAuth: (token: string, user: GitHubUser) => void;
  logout: () => void;
  setRepoName: (name: string) => void;
  createRepository: () => Promise<void>;
  setSyncStatus: (status: SyncStatus, error?: string) => void;
  setLastSyncTime: (time: number) => void;
  getOctokit: () => Octokit | null;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      octokit: null,
      repoName: null,
      syncStatus: 'idle',
      lastSyncTime: null,
      syncError: null,

      setAuth: (token, user) => {
        const octokit = new Octokit({ auth: token });
        set({ accessToken: token, user, octokit });
      },

      logout: () => {
        set({ 
          accessToken: null, 
          user: null, 
          octokit: null, 
          repoName: null,
          syncStatus: 'idle',
          lastSyncTime: null,
          syncError: null
        });
      },

      setRepoName: (name) => {
        set({ repoName: name });
      },

      setSyncStatus: (status, error) => {
        set({ syncStatus: status, syncError: error || null });
      },

      setLastSyncTime: (time) => {
        set({ lastSyncTime: time });
      },

      getOctokit: () => {
        const state = get();
        if (!state.accessToken) return null;
        
        // Recreate octokit if it doesn't exist
        if (!state.octokit) {
          const octokit = new Octokit({ auth: state.accessToken });
          set({ octokit });
          return octokit;
        }
        
        return state.octokit;
      },

      createRepository: async () => {
        const { octokit, user, repoName } = get();
        if (!octokit || !user) return;

        try {
          const name = repoName || 'uncle-markdown-notes';
          await octokit.repos.createForAuthenticatedUser({
            name,
            description: 'My markdown notes from Uncle Markdown',
            private: true,
            auto_init: true
          });
          set({ repoName: name });
        } catch (error) {
          if (error && typeof error === 'object' && 'status' in error && error.status !== 422) { // 422 means repo already exists
            console.error('Failed to create repository:', error);
          }
        }
      }
    }),
    {
      name: 'uncle-markdown-auth',
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        repoName: state.repoName,
        syncStatus: state.syncStatus,
        lastSyncTime: state.lastSyncTime,
        syncError: state.syncError,
        // Exclude octokit - it will be recreated from token
      }),
    }
  )
);
