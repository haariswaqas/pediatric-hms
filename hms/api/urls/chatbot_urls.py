# chatbot/urls.py
from django.urls import path
from ..views import ChatProxyView, ChatClearView, SessionsView, ConversationListView, ConversationDetailView, ConversationPDFView

urlpatterns = [
    path('chatbot/chat/', ChatProxyView.as_view(), name='chat-proxy'),
    path('chatbot/chat/<str:session_id>/', ChatClearView.as_view(), name='chat-clear'),
    path('chatbot/sessions/', SessionsView.as_view(), name='chat-sessions'),
    path('chatbot/conversations/', ConversationListView.as_view(), name='conversation-list'),
    path('chatbot/conversations/<str:session_id>/', ConversationDetailView.as_view(), name='conversation-detail'),
    path('chatbot/conversations/<str:conversation_id>/pdf/', ConversationPDFView.as_view(), name='conversation-pdf'),
]