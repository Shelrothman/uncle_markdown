import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Octokit } from '@octokit/rest';

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
  
  setAuth: (token: string, user: GitHubUser) => void;
  logout: () => void;
  setRepoName: (name: string) => void;
  createRepository: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      octokit: null,
      repoName: null,

      setAuth: (token, user) => {
        const octokit = new Octokit({ auth: token });
        set({ accessToken: token, user, octokit });
      },

      logout: () => {
        set({ accessToken: null, user: null, octokit: null, repoName: null });
      },

      setRepoName: (name) => {
        set({ repoName: name });
      },

      createRepository: async () => {
        const { octokit, user, repoName } = get();
        if (!octokit || !user) return;

        try {
          const name = repoName || 'uncle-markdown-notes';
          await octokit.repos.createForAuthenticatedUser({
            name,
            description: 'My markdown notes from Uncle Markdown',
            private: false,
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
      name: 'uncle-markdown-auth'
    }
  )
);
