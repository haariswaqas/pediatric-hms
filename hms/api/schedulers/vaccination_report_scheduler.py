from django_celery_beat.models import PeriodicTask, IntervalSchedule
import json


def set_vaccination_report_schedule(every: int, period: str, enabled: bool = True):


    # Validate period
    valid_periods = {
        'seconds': IntervalSchedule.SECONDS,
        'minutes': IntervalSchedule.MINUTES,
        'hours': IntervalSchedule.HOURS,
        'days': IntervalSchedule.DAYS
        
        
    }

    if period not in valid_periods:
        raise ValueError("Invalid period. Must be one of: seconds, minutes, hours, days.")

    # Get or create interval schedule
    interval, _ = IntervalSchedule.objects.get_or_create(
        every=every,
        period=valid_periods[period]
    )

    # Create or update the periodic task
    PeriodicTask.objects.update_or_create(
        name='PDF Vaccination Report',
        defaults={
            'interval': interval,
            'task': 'api.scheduled_tasks.vaccination_records_task.generate_vaccination_report',
            'args': json.dumps([]),
            'kwargs': json.dumps({'file_format':'pdf'}),
            'enabled': enabled,
        }
    )
    
    
def get_vaccination_report_schedule():
    """
    Retrieves the existing report schedule settings for the 'PDF Admission Report' task.
    Returns a dict with `every`, `period`, and `enabled`.
    Raises an exception if the schedule cannot be found.
    """
    try:
        periodic_task = PeriodicTask.objects.get(
            name='PDF Vaccination Report'
        )
        interval = periodic_task.interval
        return {
            'every': interval.every,
            'period': interval.period,
            'enabled': periodic_task.enabled
        }
    except PeriodicTask.DoesNotExist:
        raise ValueError('Report schedule not set')