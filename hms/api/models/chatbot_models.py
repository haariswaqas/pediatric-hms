# chatbot/models.py
from django.db import models
from .auth_models import User

class Conversation(models.Model):
    """
    Represents a chat session for a user. session_id is the external session id
    returned by your model service (FastAPI). Keep it unique so we can join.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    session_id = models.CharField(max_length=128, unique=True)
    title = models.CharField(max_length=255, blank=True, null=True)  # optional friendly title
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    metadata = models.JSONField(default=dict, blank=True)  # store any model-side metadata if needed

    def __str__(self):
        return f"Conversation {self.session_id} ({self.user})"


class Message(models.Model):
    """
    Single message in a conversation. role: 'user' or 'assistant'
    """
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    role = models.CharField(max_length=32)  # 'user' | 'assistant'
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('created_at',)  # messages are returned chronologically

    def __str__(self):
        return f"{self.role}: {self.content[:50]}"
