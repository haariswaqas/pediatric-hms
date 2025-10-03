from django.urls import path
from ..views import (
    ChildGrowthChartView,
    GrowthPercentileView,
    GrowthVelocityView,
    GrowthForecastView,
    VitalsTrendPlotView  
)

urlpatterns = [
    path('children/<int:child_id>/growth-chart/', ChildGrowthChartView.as_view(), name='child-growth-chart'),
    path("children/<int:child_id>/growth-percentile/", GrowthPercentileView.as_view(), name="growth_percentile"),
    path("children/<int:child_id>/growth-velocity/", GrowthVelocityView.as_view(), name="growth_velocity"),
    path("children/<int:child_id>/growth-forecast/", GrowthForecastView.as_view(), name="growth_forecast"),
    path("children/<int:child_id>/vitals-plot/", VitalsTrendPlotView.as_view(), name="vitals_plot"),
]
