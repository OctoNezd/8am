import json
from datetime import datetime, timedelta
import aiohttp
from ics import Calendar, Event
from ics.grammar.parse import ContentLine
from collections import OrderedDict

from . import classes


LOCATIONS = """
1 	г. Москва, ул. Земляной Вал, д.73
2 	г. Москва, ул. Земляной Вал, д.71
5 	г. Москва, ул.Народного Ополчения, д.38, корп.2
8 	г.Москва, ул.Шаболовка, д.14, стр.9
9 	г.Москва, ул.Талалихина, д.31
10 	г.Москва, пр.3-й Хорошевский, д.1, к.3
11 	г.Москва, ул. Костомаровская набережная, д.29, корп.1
12 	г.Москва, ул. Костомаровская набережная, д.29, корп.2
13 	г. Москва, ул. Земляной Вал, д.71, к.2 (Университетский бассейн)
""".strip().split(
    "\n"
)
LOCATIONS = {
    placeId: address
    for placeId, address in [location.split(" \t") for location in LOCATIONS]
}
LINES = {
    "1": ["#EF161E", None],  # Сокольническая
    "2": ["#2DBE2C", None],  # Замоскворецкая
    "3": ["#0078BE", None],  # Арбатско-Покровская
    "4": ["#00BFFF", None],  # Филёвская
    "4А": ["#00BFFF", None],  # Филёвская
    "5": ["#8D5B2D", "🟤"],  # Кольцевая
    "6": ["#ED9121", "🟠"],  # Калужско-Рижская
    "7": ["#800080", "🟣"],  # Таганско-Краснопресненская
    "8": ["#FFD702", None],  # Калининская
    "8А": ["#FFD702", None],  # Солнцевская
    "8КС": ["#FFD702", None],  # Калининско-Солнцевская
    "9": ["#999999", None],  # Серпуховско-Тимирязевская
    "10": ["#99CC00", "🟢"],  # Люблинско-Дмитровская
    "11": ["#82C0C0", None],  # Большая кольцевая
    "11А": ["#82C0C0", None],  # Большая кольцевая
    "11К": ["#231F20", None],  # Каховская (историческая линия)
    "12": ["#A1B3D4", None],  # Бутовская
    "13": ["#9999FF", None],  # Московский монорельс
    "14": ["#FFFFFF", None],  # Московское центральное кольцо
    "15": ["#DE64A1", None],  # Некрасовская
    "16": ["#D8D8D8", None],  # Троицкая (временно)
    "17": ["#231F20", None],  # Рублёво-Архангельская (временно)
    "18": ["#231F20", None],  # Бирюлёвская (временно)
    "D1": ["#f6a600", None],  # МЦД-1
    "D2": ["#e74280", None],  # МЦД-2
    "D3": ["#e95b0c", None],  # МЦД-3
    "D4": ["#40b280", None],  # МЦД-4
    "D5": ["#77b729", None],  # МЦД-5
    "0": ["#231F20", None],  # для всех остальных планирующихся линий
}
NEAREST_METRO_STATIONS = {
    "1": dict(line="5", station="Таганская"),
    "2": dict(line="5", station="Таганская"),
    "5": dict(line="7", station="Октябрьское поле"),
    "8": dict(line="6", station="Шаболовская"),
    "9": dict(line="10", station="Крестьянская застава"),
    "10": dict(line="7", station="Беговая"),
    "11": dict(line="10", station="Чкаловская"),
    "12": dict(line="10", station="Чкаловская"),
    "13": dict(line="5", station="Таганская"),
}
TEAMS_URLS = {}


def force_metro_emojis():
    for ms in NEAREST_METRO_STATIONS.values():
        assert (
            LINES[ms["line"]][1] is not None
        ), f"Линия {ms['line']} используется шарагой, а эмодзи нет"


force_metro_emojis()

__version__ = "0.2.5p1"


async def get_teams_urls():
    global TEAMS_URLS
    try:
        async with aiohttp.ClientSession(
            base_url="https://mgutm.ru/", raise_for_status=True
        ) as session:
            async with session.get("/wp-json/prepods/v1/info") as resp:
                TEAMS_URLS = {link["name"]: link["url"] for link in await resp.json()}
    except aiohttp.client_exceptions.ClientResponseError:
        TEAMS_URLS = {}


class MgutmParser(classes.TimetableSource):
    def generate_ical(self, tt):
        print("downloaded timetable")
        cal = Calendar()
        for name in ["NAME", "X-WR-CALNAME"]:
            cal.extra.append(
                ContentLine(
                    name,
                    value=f"Расписание {tt['info']['group']['name']} (sharaga.octonezd.me)",
                )
            )
        cal.extra.append(ContentLine("X-PUBLISHED-TTL", value="PT12H"))
        cal.extra.append(
            ContentLine(
                "URL",
                value=f"webcal://sharaga.octonezd.me/group/{tt['info']['group']['groupID']}.ics",
            )
        )
        debug_info = Event(
            name="Отладочная информация",
            begin=datetime(1970, 1, 1),
            end=datetime(1970, 1, 1),
        )
        debug_info.description = f"Сгенерировано: {datetime.now()}\nВерсия генератора: {__version__}\ngid:{tt['info']['group']['groupID']}"
        cal.events.add(debug_info)
        for lesson in tt["rasp"]:
            event = Event(
                name=lesson["дисциплина"],
                begin=datetime.fromisoformat(lesson["датаНачала"] + "+03:00"),
                end=datetime.fromisoformat(lesson["датаОкончания"] + "+03:00"),
            )
            event.description = (
                f'Препод: {lesson["преподаватель"]}'
            )
            if "-" in lesson["аудитория"]:
                location_id, room = lesson["аудитория"].split("-")
                event.extra.append(ContentLine("X-SHARAGA-ROOM", value=room))
                if location_id in LOCATIONS:
                    nearest_metro = NEAREST_METRO_STATIONS[location_id]
                    metro_info = (
                        f"{LINES[nearest_metro['line']][1]}{nearest_metro['station']}"
                    )

                    location = f"{metro_info}, {LOCATIONS[location_id]}, каб. {room}"
                    event.extra.append(
                        ContentLine("X-SHARAGA-LOCATION", value=LOCATIONS[location_id])
                    )
                    event.extra.append(
                        ContentLine("X-SHARAGA-METRO", value=nearest_metro["station"])
                    )
                    event.extra.append(
                        ContentLine("X-SHARAGA-METRO-LINE", value=nearest_metro["line"])
                    )
                else:
                    location = f"Хуй знает где, каб. {room}"
                    event.extra.append(
                        ContentLine("X-SHARAGA-LOCATION", value="Неизвестно")
                    )
            else:
                location = TEAMS_URLS.get(
                    lesson["преподаватель"], "Дистанционно, ссылка не найдена."
                )
                if "Дистанционно" not in location:
                    event.extra.append(
                        ContentLine("X-GOOGLE-CONFERENCE", value=location)
                    )
            event.location = location
            cal.events.add(event)
        return str(cal)

    async def get_groups(self):
        tmpgroups = {}
        async with aiohttp.ClientSession(
            base_url="https://dec.mgutm.ru/", raise_for_status=True
        ) as session:
            async with session.get("/api/Groups") as resp:
                groupdata = await resp.json()
                for group in groupdata["data"]["groups"]:
                    tmpgroups[group["groupName"]] = str(group["groupID"])
        return OrderedDict(sorted(tmpgroups.items(), key=lambda x: x[0]))

    async def get_teachers(self):
        teachers = {}
        async with aiohttp.ClientSession(
            base_url="https://dec.mgutm.ru/", raise_for_status=True
        ) as session:
            async with session.get("/api/raspTeacherlist") as resp:
                teacherdata = await resp.json()
                for teacher in teacherdata["data"]:
                    teachers[teacher["name"]] = str(teacher["id"])
        return OrderedDict(sorted(teachers.items(), key=lambda x: x[0]))

    async def get_new_ics(self, ics_type, gid):
        async with aiohttp.ClientSession(
            base_url="https://dec.mgutm.ru/", raise_for_status=True
        ) as session:
            async with session.get(
                "/api/Rasp", params={f"id{ics_type.title()}": gid}
            ) as resp:
                tt = (await resp.json())["data"]
        tt = self.generate_ical(tt)
        return tt


if __name__ == "__main__":
    import asyncio

    asyncio.run(get_teams_urls())
    with open("rasp.json", encoding="utf-8") as f:
        tt = json.load(f)["data"]

    rdr = MgutmParser()
    ical = rdr.generate_ical(tt)
    with open("test.ics", "w", newline="", encoding="utf-8") as f:
        f.write(ical)
    print(LOCATIONS, TEAMS_URLS)
