import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('App crash:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ color: 'white', background: 'black', padding: 20 }}>
          <h1>Something went wrong</h1>
          <pre style={{ color: 'red', whiteSpace: 'pre-wrap' }}>{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <AuthProvider>
      <App />
    </AuthProvider>
  </ErrorBoundary>,
)

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/Journeyman/sw.js')
      .then(registration => {
        console.log('SW registered:', registration);

        // Listen for sync messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'RETRY_SYNC') {
            window.dispatchEvent(new CustomEvent('retry-sync'));
          }
        });
      })
      .catch(error => console.error('SW registration failed:', error));
  });
}
