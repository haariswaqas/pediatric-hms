from celery import shared_task
from ..models import User, SystemLog


@shared_task
def create_system_log_task(level, message, user_id=None):
    """
    Celery task to create a system log entry.
    """
    user = None
    if user_id is not None:
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            user = None

    SystemLog.objects.create(
        level=level,
        message=message,
        user=user
    )

