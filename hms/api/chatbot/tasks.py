# chatbot/tasks.py
from celery import shared_task
from django.utils import timezone
from ..models import Conversation
from .chatbot_model_client import *

@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def summarize_conversation(self, conversation_id):
    """
    Create/update a rolling summary for the conversation.
    We call the model service with a summarization instruction that asks for a short
    bullet/paragraph summary that captures key facts and intent.
    """
    try:
        convo = Conversation.objects.get(pk=conversation_id)
    except Conversation.DoesNotExist:
        return {"error": "conversation not found"}

    # load recent messages (we can adjust how many we include in the summarization prompt)
    recent_msgs = list(convo.messages.order_by('id').values('role', 'content')[-50:])  # last 50 messages approx

    # Build summarization prompt. Adapt to your model-service API.
    summarization_instruction = (
        "You are a summarizer. Produce a concise summary of the conversation that captures "
        "the user's goals, key facts, and outstanding tasks, in 2-4 sentences. Use consistent "
        "naming for people, dates and actions."
    )

    # Build a single text blob for the model; if your model client supports a dedicated summary endpoint use that
    conversation_text = "\n".join([f"{m['role'].capitalize()}: {m['content']}" for m in recent_msgs])
    prompt = f"{summarization_instruction}\n\nConversation:\n{conversation_text}\n\nSummary:"

    try:
        # This assumes chatbot_model_client.post_chat can accept a 'message' and optional session id.
        # If you have a specialized summarization endpoint, call that instead.
        resp = post_chat(prompt, convo.session_id)
    except Exception as e:
        # optional: retry logic
        raise self.retry(exc=e)

    # Extract model output (this depends on model_resp shape)
    summary_text = resp.get('response') or (resp.get('conversation_history') and resp['conversation_history'][-1].get('content'))
    if not summary_text:
        return {"error": "no summary text returned"}

    convo.summary = summary_text.strip()
    convo.last_summary_at = timezone.now()
    convo.save(update_fields=['summary', 'last_summary_at'])

    return {"convo_id": conversation_id, "summary_len": len(convo.summary)}
