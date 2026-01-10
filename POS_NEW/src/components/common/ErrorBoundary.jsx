import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                    <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full border-l-4 border-red-500">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Something went wrong</h1>
                        <div className="bg-red-50 p-4 rounded mb-6">
                            <p className="text-red-700 font-mono text-sm break-all">
                                {this.state.error && this.state.error.toString()}
                            </p>
                        </div>
                        {this.state.errorInfo && (
                            <details className="mb-6">
                                <summary className="cursor-pointer text-gray-600 font-medium mb-2">Stack Trace</summary>
                                <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto h-48">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                        >
                            <span>🗑️</span> Clear Data & Reload
                        </button>
                        <p className="mt-4 text-center text-sm text-gray-500">
                            Clicking above will clear all local data which often fixes corruption issues.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
