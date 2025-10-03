from django.views import View
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from ..models import Child
from ..plots import (ChildGrowthPlot, generate_growth_forecast_chart, generate_growth_percentile_chart, generate_growth_velocity_chart, child_vitals_plot)
from ..permissions import AdmissionVitalRecordPermission, CanViewVitalsPlot
class ChildGrowthChartView(View):
    """Class-based view to generate child's growth chart."""

    def get(self, request, child_id):
        """Handle GET request and return the growth chart image."""
        child = get_object_or_404(Child, id=child_id)
        plot = ChildGrowthPlot(child)
        return plot.generate_plot()


class GrowthPercentileView(View):
    """View for rendering Growth Percentile Chart"""
    def get(self, request, child_id):
        child = Child.objects.get(pk=child_id)
        return generate_growth_percentile_chart(child)


class GrowthVelocityView(View):
    """View for rendering Growth Velocity Chart"""
    def get(self, request, child_id):
        child = Child.objects.get(pk=child_id)
        return generate_growth_velocity_chart(child)


class GrowthForecastView(View):
    """View for rendering Predictive Growth Forecast Chart"""
    def get(self, request, child_id):
        child = Child.objects.get(pk=child_id)
        return generate_growth_forecast_chart(child)
    

class VitalsTrendPlotView(View):
    permission_classes = [CanViewVitalsPlot]
    """View for rendering Vitals Trend Plot for a child across all admissions"""
    
    def get(self, request, child_id):
        child = get_object_or_404(Child, id=child_id)
        return child_vitals_plot(request, child_id)
