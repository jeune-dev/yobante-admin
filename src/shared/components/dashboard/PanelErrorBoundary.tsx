import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props { children: ReactNode; panel: string; }
interface State { error: Error | null; }

export class PanelErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[Panel: ${this.props.panel}]`, error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="db-card" style={{ padding: '2rem', textAlign: 'center', color: '#991b1b', border: '1px solid #fecaca', borderRadius: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Erreur dans « {this.props.panel} »</div>
          <div style={{ fontSize: '0.85rem', color: '#b91c1c', marginBottom: 12 }}>{this.state.error.message}</div>
          <button
            onClick={() => this.setState({ error: null })}
            style={{ padding: '6px 16px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
          >
            Réessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
