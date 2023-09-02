class TimetableSource:
    __version__ = 0

    async def get_groups(self):
        return {}

    async def get_teachers(self):
        return {}

    async def get_new_ics(self, ics_type, gid):
        raise NotImplementedError()

    async def generate_ical(self, tt):
        raise NotImplementedError()
