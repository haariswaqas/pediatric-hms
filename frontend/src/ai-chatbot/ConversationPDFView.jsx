import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchConversationPdf, clearConversationPdf } from "../store/chatbot/chatbotSlice";
import { FileText, Download, RefreshCw } from "lucide-react";

export default function ConversationPDFView() {
    const { conversationId } = useParams();
    const dispatch = useDispatch();
    const { conversationPdfs, loading, error } = useSelector((state) => state.chatbot);

    const fileUrl = conversationPdfs[conversationId];

    useEffect(() => {
        if (conversationId) {
            dispatch(fetchConversationPdf(conversationId));
        }

        return () => {
            if (conversationId) {
                dispatch(clearConversationPdf(conversationId));
            }
        };
    }, [conversationId, dispatch]);

    const handleDownloadPDF = () => {
        if (fileUrl) {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = `conversation-${conversationId}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const handleRefreshPDF = () => {
        if (conversationId) {
            dispatch(fetchConversationPdf(conversationId));
        }
    };

    if (loading && !fileUrl) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                    <div>Loading Conversation PDF...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <div className="text-red-600 mb-4">Failed to load PDF: {error}</div>
                <button
                    onClick={() => dispatch(fetchConversationPdf(conversationId))}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                </button>
            </div>
        );
    }

    if (!fileUrl) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <FileText className="w-16 h-16 text-gray-400 mb-4" />
                <div className="text-gray-600 mb-4">No PDF found for this conversation</div>
                <button
                    onClick={() => dispatch(fetchConversationPdf(conversationId))}
                    className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                </button>
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col bg-gray-50">
            {/* Header with controls */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Conversation PDF Viewer
                    </h2>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleRefreshPDF}
                            disabled={loading}
                            className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                            title="Refresh PDF"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>
                        
                        <button
                            onClick={handleDownloadPDF}
                            disabled={!fileUrl}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            <span>Download PDF</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 bg-white">
                <iframe
                    src={fileUrl}
                    title={`Conversation ${conversationId}`}
                    className="w-full h-full border-none"
                />
            </div>
        </div>
    );
}
