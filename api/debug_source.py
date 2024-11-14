from datetime import datetime, timedelta
from ics import Calendar, Event

from . import classes


def datetime_range(start, end, delta):
    current = start
    while current < end:
        yield current
        current += delta


class DebugSource(classes.TimetableSource):

    async def get_groups(self):
        return {"1h": 0}

    def generate_ical(*_):
        today = datetime.utcnow().date()
        start = datetime(today.year, today.month, today.day)
        end = start + timedelta(1)
        dts = [dt for dt in datetime_range(start, end, timedelta(hours=1))]
        ics = Calendar()
        for event_start in dts:
            event_end = event_start + timedelta(hours=1)
            ics.events.add(
                Event(
                    name=f"{event_start} - {event_end}",
                    begin=event_start,
                    end=event_end,
                )
            )
        return str(ics)

    async def get_new_ics(self, *_):
        return self.generate_ical()
