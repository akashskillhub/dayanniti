import React, { Component } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

/**
 * A premium ErrorBoundary component to catch runtime/rendering errors 
 * and network/chunk loading failures gracefully.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error details (can hook up to an external service here)
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    // Reload the page to retry loading code chunks
    window.location.reload();
  };

  handleGoHome = () => {
    // Reset error state and navigate home
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Determine if it's a chunk loading failure (common with lazy loading and deploys)
      const isChunkError = 
        this.state.error && 
        (this.state.error.name === 'ChunkLoadError' || 
         this.state.error.message.includes('Loading chunk') ||
         this.state.error.message.includes('Failed to fetch dynamically imported module'));

      return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 bg-transparent relative overflow-hidden font-sans">
          {/* Decorative ambient background glows */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-200/40 rounded-full blur-[100px] -z-10 animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

          <div className="max-w-md w-full bg-white/60 backdrop-blur-xl border border-white/80 p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 text-center relative z-10 transition-all duration-500 hover:shadow-indigo-500/5">
            {/* Animated Icon Container */}
            <div className="w-20 h-20 bg-rose-50 border border-rose-100 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm group-hover:scale-110 transition-transform duration-300">
              <AlertOctagon className="w-10 h-10 text-rose-500 animate-bounce" />
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-4">
              {isChunkError ? 'Update Available' : 'Something Went Wrong'}
            </h2>
            
            <p className="text-slate-600 font-medium text-sm leading-relaxed mb-8">
              {isChunkError 
                ? 'We have updated the portal with new features and optimizations. Please refresh to load the latest version.'
                : 'An unexpected application error occurred. We have logged this issue and are working to resolve it.'}
            </p>

            {/* Error Detail accordion (subtle, collapsed by default) */}
            {this.state.error && (
              <details className="text-left bg-slate-50/80 border border-slate-100 rounded-2xl p-4 mb-8 text-xs font-mono text-slate-500 max-h-32 overflow-y-auto cursor-pointer">
                <summary className="font-bold text-slate-600 focus:outline-none mb-1">Technical details</summary>
                <div className="whitespace-pre-wrap break-all">{this.state.error.toString()}</div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReload}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                Reload Portal
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-white/80 border border-slate-200 hover:bg-white text-slate-700 font-black text-sm px-6 py-3.5 rounded-xl active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
              >
                <Home size={16} />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
