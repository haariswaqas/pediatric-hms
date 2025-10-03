from rest_framework.generics import ListAPIView, DestroyAPIView
from ..permissions import IsAdminUser
from ..models import SystemLog
from ..serializers import SystemLogSerializer

class SystemLogListView(ListAPIView):
    queryset = SystemLog.objects.all().order_by('-timestamp')
    serializer_class = SystemLogSerializer
    permission_classes = [IsAdminUser]

class SystemLogDeleteView(DestroyAPIView):
    """
    Allows an admin to delete a single system log entry.
    """
    queryset = SystemLog.objects.all()
    serializer_class = SystemLogSerializer
    permission_classes = [IsAdminUser]
    lookup_field = 'pk'


from ..tasks import create_system_log_task

class LoggingViewSet:
    resource = None  # You can override this per viewset

    def log(self, level, action, instance):
        resource_name = self.resource or instance.__class__.__name__
        message = f"{resource_name} {action} by user {self.request.user.username} (id={self.request.user.id})"
        create_system_log_task.delay(
            level=level,
            message=message,
            user_id=self.request.user.id
        )

    def perform_create(self, serializer):
        instance = serializer.save()
        self.log("INFO", "created", instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        self.log("INFO", "updated", instance)

    def perform_destroy(self, instance):
        instance_id = instance.id
        instance.delete()
        self.log("WARNING", f"deleted (id={instance_id})", instance)
