from django_celery_beat.models import PeriodicTask, IntervalSchedule
import json

VALID_PERIODS = {'days': IntervalSchedule.DAYS}

def set_drug_dispense_report_schedule(every: int, period: str, enabled: bool=True):
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
            'task': 'api.scheduled_tasks.report_task.generate_drug_dispense_report',
            'args': json.dumps([]),
            'enabled': enabled,
            'one_off': False,
            'clocked': None,
        }
    )

def get_drug_dispense_report_schedule():

    try:
        periodic_task = PeriodicTask.objects.get(
            name='PDF Drug Dispense Report'
        )
        interval = periodic_task.interval
        return {
            'every': interval.every,
            'period': interval.period,
            'enabled': periodic_task.enabled
        }
    except PeriodicTask.DoesNotExist:
        raise ValueError('drug dipense Report schedule not set')