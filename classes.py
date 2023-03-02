class TimetableSource:
    __version__ = 0

    async def get_groups(self):
        raise NotImplementedError()

    async def get_new_ics(self, gid):
        raise NotImplementedError()

    async def generate_ical(self, tt):
        raise NotImplementedError()
