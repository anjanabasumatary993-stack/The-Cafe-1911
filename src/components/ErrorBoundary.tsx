import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CAFE 1911 Application Error caught by boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0c0b0a] text-[#faf7f2] flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#14110f] border border-[#2d241e] p-8 space-y-6">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#c5a880]/10 border border-[#c5a880]/40 flex items-center justify-center text-[#c5a880]">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl text-[#faf7f2]">CAFE 1911 Hospitality</h2>
              <p className="text-xs text-[#e8e2d5]/70 leading-relaxed font-light">
                An unexpected interface issue occurred. Click below to refresh the experience.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-[#0c0b0a] border border-[#2d241e] text-[11px] text-red-300 font-mono text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </div>
            )}

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="w-full py-3 text-xs uppercase tracking-[0.2em] font-medium text-[#0c0b0a] bg-[#c5a880] hover:bg-[#dfcaa7] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload Website</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
