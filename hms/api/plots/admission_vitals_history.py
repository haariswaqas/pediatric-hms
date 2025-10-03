from django.http import HttpResponse
import matplotlib.pyplot as plt
import io
from django.shortcuts import get_object_or_404
from ..models import Child, AdmissionVitalRecordHistory

def child_vitals_plot(request, child_id):
    child = get_object_or_404(Child, id=child_id)

    histories = AdmissionVitalRecordHistory.objects.filter(
        admission_vital_record__admission__child=child
    ).order_by('updated_at')

    if not histories.exists():
        return HttpResponse("No vitals found for this child.", status=404)

    timestamps = [entry.updated_at for entry in histories]
    temperature = [entry.temperature for entry in histories]
    heart_rate = [entry.heart_rate for entry in histories]
    respiratory_rate = [entry.respiratory_rate for entry in histories]
    oxygen_saturation = [entry.oxygen_saturation for entry in histories]

    fig, ax = plt.subplots(figsize=(12, 6))
    ax.plot(timestamps, temperature, label='Temperature (°C)', marker='o')
    ax.plot(timestamps, heart_rate, label='Heart Rate (bpm)', marker='s')
    ax.plot(timestamps, respiratory_rate, label='Respiratory Rate (breaths/min)', marker='^')
    ax.plot(timestamps, oxygen_saturation, label='Oxygen Saturation (%)', marker='x')

    ax.set_title(f'Vitals Over Time for {child.first_name} {child.last_name}')
    ax.set_xlabel('Time')
    ax.set_ylabel('Vitals')
    ax.legend()
    ax.grid(True)
    plt.xticks(rotation=45)

    buffer = io.BytesIO()
    plt.tight_layout()
    plt.savefig(buffer, format='png')
    plt.close(fig)
    buffer.seek(0)

    return HttpResponse(buffer.getvalue(), content_type='image/png')
