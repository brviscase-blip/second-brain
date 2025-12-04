import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Error Boundary Implementation to debug "White Screen" issues
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', color: '#ef4444', backgroundColor: '#020617', height: '100vh', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>System Error</h1>
          <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>The interface failed to load.</p>
          <pre style={{ backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px', overflow: 'auto', maxWidth: '90vw', fontSize: '0.8rem', color: '#cbd5e1' }}>
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => { localStorage.clear(); window.location.reload(); }}
            style={{ marginTop: '20px', padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Reset Database & Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const mount = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("Failed to find #root element");
    return;
  }
  
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
};

// Ensure DOM is ready before mounting to prevent "Target container is not a DOM element" errors
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}