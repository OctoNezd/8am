class TimetableSource:
    __version__ = 0

    async def init(self):
        """
        Initialize the TimetableSource.

        This method should perform any necessary setup or initialization for the TimetableSource.

        Returns:
            None
        """
        return

    async def get_groups(self, query):
        """
        Retrieve groups based on the given query.

        This method retrieves a list of groups that match the given query.

        Parameters:
            query (str): The search query to filter groups.

        Returns:
            dict: A dictionary containing the groups, where the keys are group names and the values are group IDs.
        """
        return {}

    async def get_teachers(self, query):
        """
        Retrieve teachers based on the given query.

        This method retrieves a list of teachers that match the given query.

        Parameters:
            query (str): The search query to filter teachers.

        Returns:
            dict: A dictionary containing the teachers, where the keys are teacher names and the values are teacher IDs.
        """
        return {}

    async def get_new_ics(self, ics_type, gid):
        """
        Retrieve new ICS data for a specific type and group ID.

        This method retrieves new ICS data for the specified type and group ID.

        Parameters:
            ics_type (str): The type of ICS data to retrieve (e.g., "group", "teacher").
            gid (str): The group ID for which to retrieve ICS data.

        Raises:
            NotImplementedError: If the method is not implemented in the subclass.
        """
        raise NotImplementedError()

    async def generate_ical(self, tt):
        """
        Generate an ICAL file from the given timetable.

        This method generates an ICAL file from the given timetable.

        Parameters:
            tt (Timetable): The timetable object to generate the ICAL file from.

        Raises:
            NotImplementedError: If the method is not implemented in the subclass.
        """
        raise NotImplementedError()
