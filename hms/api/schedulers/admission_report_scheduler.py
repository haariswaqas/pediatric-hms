

from django_celery_beat.models import PeriodicTask, IntervalSchedule
import json

def set_user_report_schedule(every: int, period: str, enabled: bool = True):
    """
    Create or update a periodic task with user-defined interval and status.

    Args:
        every (int): The interval value (e.g., 1, 2, 15).
        period (str): One of 'seconds', 'minutes', 'hours', 'days', 'weeks'.
        enabled (bool): Whether the task is enabled.
    """

    # Validate period
    valid_periods = {
        'seconds': IntervalSchedule.SECONDS,
        'minutes': IntervalSchedule.MINUTES,
        'hours': IntervalSchedule.HOURS,
        
        
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
        name='PDF Admission Report',
        defaults={
            'interval': interval,
            'task': 'api.scheduled_tasks.admission_report_task.generate_admission_report',
            'args': json.dumps([]),
            'kwargs': json.dumps({'file_format':'pdf'}),
            'enabled': enabled,
        }
    )
    
    
def get_admission_report_schedule():
    """
    Retrieves the existing report schedule settings for the 'PDF Admission Report' task.
    Returns a dict with `every`, `period`, and `enabled`.
    Raises an exception if the schedule cannot be found.
    """
    try:
        periodic_task = PeriodicTask.objects.get(
            name='PDF Admission Report'
        )
        interval = periodic_task.interval
        return {
            'every': interval.every,
            'period': interval.period,
            'enabled': periodic_task.enabled
        }
    except PeriodicTask.DoesNotExist:
        raise ValueError('Report schedule not set')