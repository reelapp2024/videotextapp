import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    // Keep console error for debugging
    // eslint-disable-next-line no-console
    console.error('App crashed:', error, errorInfo);
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
          <h2 style={{ margin: 0, marginBottom: 8 }}>App crashed</h2>
          <div style={{ whiteSpace: 'pre-wrap', color: '#b91c1c' }}>{String(error?.stack || error?.message || error)}</div>
          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>
            Open DevTools console for full details.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

