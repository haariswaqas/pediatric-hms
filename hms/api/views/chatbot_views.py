# chatbot/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from django.db import transaction
from ..chatbot import chatbot_model_client
from ..models import Conversation, Message
from ..serializers import ConversationListSerializer, ConversationDetailSerializer, MessageSerializer
from rest_framework.generics import ListAPIView, RetrieveAPIView
import uuid

class ChatProxyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Proxy message to model service, persist conversation + messages.
        Request JSON: { "message": "...", "session_id": "<optional>" }
        """
        user = request.user
        message = request.data.get('message')
        session_id = request.data.get('session_id')

        if not message:
            return Response({"detail": "Missing 'message' in request body."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            model_resp = chatbot_model_client.post_chat(message, session_id)
        except Exception as e:
            return Response({"detail": f"Model service error: {str(e)}"}, status=status.HTTP_502_BAD_GATEWAY)

        # model_resp expected to include: response, session_id, conversation_history (list of {role, content})
        session_id = model_resp.get('session_id')
        conversation_history = model_resp.get('conversation_history', [])

        if not session_id:
            # ensure we always have a session id
            session_id = str(uuid.uuid4())

        # Persist conversation and messages in DB
        with transaction.atomic():
            convo, created = Conversation.objects.get_or_create(user=user, session_id=session_id)

            # If the conversation was just created (or has no title), set the title from the first user message.
            # Use the first message whose role is 'user' if available, otherwise use the first message's content.
            if (created or not convo.title) and conversation_history:
                # find first user message
                first_user_msg = None
                for m in conversation_history:
                    if (m.get('role') or '').lower() == 'user' and m.get('content'):
                        first_user_msg = m.get('content')
                        break
                if not first_user_msg:
                    # fallback to first message content
                    first_user_msg = conversation_history[0].get('content') if conversation_history[0].get('content') else None

                if first_user_msg:
                    # Capitalize first letter, strip whitespace
                    convo.title = first_user_msg.strip().capitalize()

            # Replace local messages with the returned conversation_history to avoid duplication
            convo.messages.all().delete()
            messages_to_create = [
                Message(
                    conversation=convo,
                    role=(msg.get('role') or 'assistant'),
                    content=(msg.get('content') or '')
                )
                for msg in conversation_history
            ]
            # Bulk create messages
            Message.objects.bulk_create(messages_to_create)

            convo.save()

        return Response(model_resp, status=status.HTTP_200_OK)


class ChatClearView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, session_id):
        user = request.user
        # First attempt to clear on model service (if available)
        try:
            model_resp = chatbot_model_client.delete_session(session_id)
        except Exception as e:
            # If model service fails, return warning but still attempt to remove local data
            model_resp = None

        # Delete local conversation for this user with that session_id
        try:
            convo = Conversation.objects.get(user=user, session_id=session_id)
            convo.messages.all().delete()
            convo.delete()
            return Response({"message": f"Conversation {session_id} cleared"}, status=status.HTTP_200_OK)
        except Conversation.DoesNotExist:
            # If not found locally, still return 404
            return Response({"detail": "Session not found"}, status=status.HTTP_404_NOT_FOUND)


class SessionsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """
        Return both model-service active sessions (for ops debug) and user's local conversations.
        """
        try:
            model_sessions = chatbot_model_client.get_sessions()
        except Exception:
            model_sessions = {"active_sessions": []}

        user_convos = Conversation.objects.filter(user=request.user)
        serialized = ConversationListSerializer(user_convos, many=True).data
        return Response({
            "model_active_sessions": model_sessions.get('active_sessions', []),
            "user_conversations": serialized
        })


class ConversationListView(ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ConversationListSerializer

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user).order_by('-updated_at')


class ConversationDetailView(RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ConversationDetailSerializer
    lookup_field = 'session_id'
    lookup_url_kwarg = 'session_id'

    def get_queryset(self):
        # Only allow user to access own conversations
        return Conversation.objects.filter(user=self.request.user)
