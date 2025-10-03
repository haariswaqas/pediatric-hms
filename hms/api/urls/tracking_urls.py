from django.urls import path
from api.views import ChildGrowthHistoryView

urlpatterns = [
    path('children/<int:pk>/growth-history/', ChildGrowthHistoryView.as_view(), name='child-growth-history'),
]
