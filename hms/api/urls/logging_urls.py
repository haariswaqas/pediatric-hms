from django.urls import path
from api.views import SystemLogListView, SystemLogDeleteView

urlpatterns = [
    path('system-logs/', SystemLogListView.as_view(), name='system-log-list'),
    path('system-logs/<int:pk>/', SystemLogDeleteView.as_view(), name='system-log-delete'),
]
