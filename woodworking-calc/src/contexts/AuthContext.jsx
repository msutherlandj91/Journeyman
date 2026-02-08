import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthChange, logOut } from '../firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = null;

    onAuthChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    }).then((unsub) => {
      unsubscribe = unsub;
    }).catch((error) => {
      console.error('Auth initialization error:', error);
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      await logOut();
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
