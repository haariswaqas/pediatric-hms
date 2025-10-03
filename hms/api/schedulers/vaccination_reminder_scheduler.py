# vaccination_reminder_scheduler.py

from django_celery_beat.models import PeriodicTask, IntervalSchedule
import json

VALID_PERIODS = {
    'days': IntervalSchedule.DAYS,
    # You can uncomment or extend support for more intervals if needed
    # 'hours': IntervalSchedule.HOURS,
    # 'minutes': IntervalSchedule.MINUTES,
}

def set_vaccination_reminder_schedule(every: int, period: str, enabled: bool = True):
    if period not in VALID_PERIODS:
        raise ValueError("Invalid period. Must be 'days'. (e.g., every 7 days or 2 days)")
    
    interval, _ = IntervalSchedule.objects.get_or_create(
        every=every,
        period=VALID_PERIODS[period]
    )

    # Create or update the periodic task for parents
    PeriodicTask.objects.update_or_create(
        name='Set Vaccination Reminders',
        defaults={
            'interval': interval,
            'task': 'api.scheduled_tasks.vaccination_reminder_task.send_vaccination_reminder',
            'args': json.dumps([]),
            'enabled': enabled,
        }
    )

def get_vaccination_reminder_schedule():
    try:
        task = PeriodicTask.objects.get(name='Set Vaccination Reminders')
        return {
            'every': task.interval.every,
            'period': task.interval.period,
            'enabled': task.enabled,
        }
    except PeriodicTask.DoesNotExist:
        raise ValueError('Vaccination reminder schedule not set')


def set_vaccination_reminder_for_medical_professionals_schedule(every: int, period: str, enabled: bool = True):
    if period not in VALID_PERIODS:
        raise ValueError("Invalid period. Must be 'days'. (e.g., every 7 days or 2 days)")
    
    interval, _ = IntervalSchedule.objects.get_or_create(
        every=every,
        period=VALID_PERIODS[period]
    )

    # Create or update the periodic task for medical professionals
    PeriodicTask.objects.update_or_create(
        name='Set Vaccination Reminders For Medical Professionals',
        defaults={
            'interval': interval,
            'task': 'api.scheduled_tasks.vaccination_reminder_task.vaccination_reminder_for_medical_professionals',
            'args': json.dumps([]),
            'enabled': enabled,
        }
    )
    
def get_vaccination_reminder_for_medical_professionals_schedule():
    try:
        task = PeriodicTask.objects.get(name='Set Vaccination Reminders For Medical Professionals')
        return {
            'every': task.interval.every,
            'period': task.interval.period,
            'enabled': task.enabled,
        }
    except PeriodicTask.DoesNotExist:
        raise ValueError('Medical professionals vaccination reminder schedule not set')

