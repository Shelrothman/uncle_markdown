import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import './Header.css';

// For development, you'll need to set up GitHub OAuth App
// Instructions will be in the AI_AGENT_GUIDE.md

const Header: React.FC = () => {
  const { user, accessToken, logout, setAuth, createRepository } = useAuthStore();

  useEffect(() => {
    // Check for OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code && !accessToken) {
      // Exchange code for token via backend
      const exchangeCodeForToken = async () => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || '/api/auth';
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          if (!response.ok) {
            throw new Error('Failed to authenticate');
          }

          const data = await response.json();
          setAuth(data.access_token, data.user);
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Authentication error:', error);
        }
      };

      exchangeCodeForToken();
    }
  }, [accessToken, setAuth]);

  useEffect(() => {
    // Auto-create repository when user logs in
    if (user && !useAuthStore.getState().repoName) {
      createRepository();
    }
  }, [user, createRepository]);

  const handleLogin = () => {
    // GitHub OAuth login
    // You'll need to create a GitHub OAuth App and set the Client ID
    const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || 'YOUR_GITHUB_CLIENT_ID';
    const REDIRECT_URI = window.location.origin;
    const SCOPE = 'repo user';
    
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPE}`;
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="app-title">Uncle Markdown</h1>
      </div>
      <div className="header-right">
        {user ? (
          <>
            <div className="user-info">
              <img src={user.avatar_url} alt={user.login} className="user-avatar" />
              <span className="user-name">{user.login}</span>
            </div>
            <button onClick={logout} className="header-button">
              Logout
            </button>
          </>
        ) : (
          <button onClick={handleLogin} className="header-button primary">
            Login with GitHub
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
