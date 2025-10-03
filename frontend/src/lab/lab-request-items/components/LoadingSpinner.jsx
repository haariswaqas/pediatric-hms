import React from "react";
import { TestTube } from "lucide-react";

export default function LoadingSpinner() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div className="text-center">
                <div className="relative">
                    <TestTube className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto animate-spin" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
                </div>
                <h2 className="mt-6 text-xl font-semibold text-gray-900 dark:text-white">
                    Loading Lab Request Items
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Please wait while we fetch the latest data...
                </p>
                <div className="mt-4 flex justify-center">
                    <div className="flex space-x-1">
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
}