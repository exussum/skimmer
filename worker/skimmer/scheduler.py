from datetime import datetime

from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger

from skimmer.actors import cleanup_messages, queue_update_channels, refresh_channel

SCHEDULE = [(queue_update_channels, "*/1 0-4,10-23 * * *"), (cleanup_messages, "0 0-4,10-23 * * *")]


def scheduler():
    scheduler = BlockingScheduler()
    for f, c in SCHEDULE:
        scheduler.add_job(f.send, CronTrigger.from_crontab(c), next_run_time=datetime.now())
    scheduler.start()
