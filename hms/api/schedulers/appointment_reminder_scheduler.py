from django_celery_beat.models import PeriodicTask, IntervalSchedule, CrontabSchedule
import json

VALID_PERIODS = {
    'days': IntervalSchedule.DAYS,
    # 'hours': IntervalSchedule.HOURS,
    # 'minutes': IntervalSchedule.MINUTES,
}

def set_appointment_reminder_schedule(every: int, period: str, enabled: bool=True):
    if period not in VALID_PERIODS:
        raise ValueError('Invalid period')
    
    interval, _ = IntervalSchedule.objects.get_or_create(
        every=every,
        period=VALID_PERIODS[period]
    )
    
    PeriodicTask.objects.update_or_create(
        name='Set Appointment Reminders',
        defaults={
            'interval': interval,
            'task': 'api.scheduled_tasks.appointment_reminder_task.send_appointment_reminder',
            'args': json.dumps([]),
            'enabled': enabled,
            'one_off': False,
            'clocked': None,
        }
    )


def get_appointment_reminder_schedule():
    try:
        task = PeriodicTask.objects.get(name='Set Appointment Reminders')
        return {
            'every': task.interval.every,
            'period': task.interval.period,
            'enabled': task.enabled,
        }
    except PeriodicTask.DoesNotExist:
        raise ValueError('Appointment reminder schedule not set')


def set_doctor_appointment_reminder_schedule(hour: int, minute: int, enabled: bool=True):
    crontab, _ = CrontabSchedule.objects.get_or_create(
        minute=minute,
        hour=hour,
        day_of_week='*',
        day_of_month='*',
        month_of_year='*',
        timezone='UTC'
    )
    
    PeriodicTask.objects.update_or_create(
        name='Set Doctor Appointment Reminders',
        defaults={
            'crontab': crontab,
            'task': 'api.scheduled_tasks.appointment_reminder_task.send_doctor_appointment_reminder_summary',
            'args': json.dumps([]),
            'enabled': enabled,
        }
    )


def get_doctor_appointment_reminder_schedule():
    try:
        task = PeriodicTask.objects.get(name='Set Doctor Appointment Reminders')
        return {
            'hour': int(task.crontab.hour),
            'minute': int(task.crontab.minute),
            'enabled': task.enabled,
        }
    except PeriodicTask.DoesNotExist:
        raise ValueError('Doctor appointment reminder schedule not set')
