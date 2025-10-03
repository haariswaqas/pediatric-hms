# chatbot/serializers.py
from rest_framework import serializers
from ..models import Conversation, Message

class MessageSerializer(serializers.ModelSerializer):
    formatted_content = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'role', 'content', 'formatted_content', 'created_at']

    def get_formatted_content(self, obj):
        """
        Convert plain assistant text into Markdown-friendly format.
        Example:
        - Adds line breaks for newlines
        - Converts numbered points into Markdown lists
        """
        if obj.role != 'assistant' or not obj.content:
            return obj.content

        # Replace plain newlines with double space + newline for Markdown line break
        lines = obj.content.split('\n')
        markdown_lines = []
        for line in lines:
            line = line.strip()
            if not line:
                continue
            # If line starts with a number or dash, keep as list
            if line[0].isdigit() or line.startswith('-'):
                markdown_lines.append(f"{line}  ")
            else:
                markdown_lines.append(f"{line}  ")
        return "\n".join(markdown_lines)


class ConversationListSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id', 'session_id', 'title', 'created_at', 'updated_at', 'last_message']

    def get_last_message(self, obj):
        last = obj.messages.last()
        if last:
            return {
                'role': last.role,
                'content': last.content,
                'formatted_content': MessageSerializer(last).get_formatted_content(last),
                'created_at': last.created_at
            }
        return None


class ConversationDetailSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ['id', 'session_id', 'title', 'created_at', 'updated_at', 'metadata', 'messages']
