import { useState } from 'react';
import { signInWithGoogle, signInWithGithub } from '../supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Authentication Panel - Login/Logout UI
 */
export default function AuthPanel() {
  const { user, logout, loading } = useAuth();
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGithubSignIn = async () => {
    try {
      setError(null);
      await signInWithGithub();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      setError(null);
      await logout();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 text-sm">Loading...</div>
    );
  }

  if (user) {
    return (
      <div className="bg-[#1a1a1a] rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          {user.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-10 h-10 rounded-full"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-light text-white truncate">
              {user.displayName || user.email}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {user.email}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2 bg-red-500/20 text-red-400 rounded-full text-sm font-light hover:bg-red-500/30 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] rounded-2xl p-4 space-y-3">
      <div className="text-sm text-gray-400 text-center mb-2">
        Sign in to sync history across devices
      </div>

      {error && (
        <div className="text-xs text-red-400 text-center bg-red-500/10 p-2 rounded">
          {error}
        </div>
      )}

      <button
        onClick={handleGoogleSignIn}
        className="w-full py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-light hover:bg-blue-500/30 transition-colors"
      >
        Sign in with Google
      </button>

      <button
        onClick={handleGithubSignIn}
        className="w-full py-2 bg-gray-600/20 text-gray-300 rounded-full text-sm font-light hover:bg-gray-600/30 transition-colors"
      >
        Sign in with GitHub
      </button>
    </div>
  );
}
