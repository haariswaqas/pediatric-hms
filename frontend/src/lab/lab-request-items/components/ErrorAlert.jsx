import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorAlert({ error }) {
    const handleRetry = () => {
        window.location.reload();
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-4">
                        <AlertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    Oops! Something went wrong
                </h2>
                
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    We encountered an error while loading the lab request items. Please try again.
                </p>
                
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                    <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                        Error Details:
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                        {error}
                    </p>
                </div>
                
                <button
                    onClick={handleRetry}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
                >
                    <RefreshCw className="h-5 w-5" />
                    Try Again
                </button>
            </div>
        </div>
    );
}