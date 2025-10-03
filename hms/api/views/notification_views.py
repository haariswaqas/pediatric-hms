from rest_framework.viewsets import ViewSet
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from ..models import Notification
from ..serializers import NotificationSerializer

class NotificationViewSet(ViewSet):
    """
    Viewset to manage notifications for logged-in users.
    """
    permission_classes = [IsAuthenticated]
    
  

    def list(self, request):
        """Get all unread notifications for the user."""
        notifications = Notification.objects.filter(
            recipient=request.user, is_read=False
        ).order_by('-timestamp')
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    def mark_as_read(self, request, pk=None):
        """Mark a specific notification as read."""
        try:
            notification = Notification.objects.get(pk=pk, recipient=request.user)
            notification.is_read = True
            notification.save()
            return Response({"message": "Notification marked as read."})
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found."}, status=404)
