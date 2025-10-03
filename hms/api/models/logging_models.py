from django.db import models
from .auth_models import User


class SystemLog(models.Model):
    INFO = 'INFO'
    WARNING = 'WARNING'
    ERROR = 'ERROR'

    LEVEL_CHOICES = [
        (INFO, 'Info'),
        (WARNING, 'Warning'),
        (ERROR, 'Error'),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default=INFO)
    message = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        user_display = self.user.username if self.user else "System"
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M:%S')}] {self.level} by {user_display}: {self.message[:50]}"
